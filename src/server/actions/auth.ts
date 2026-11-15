"use server";
import { createHash, randomInt } from "node:crypto";
import { and, eq, gt, lt, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { db, schema } from "@/server/db";
import { clientIp, createSession, destroyAllSessions, getCurrentUser } from "@/server/auth/session";
import { hashPassword, passwordNeedsRehash, passwordPolicyError, verifyPassword } from "@/server/auth/password";
import { verifyGoogleIdToken } from "@/server/auth/google";
import { rateLimit } from "@/server/security/rate-limit";
import { layoutEmail, sendMail } from "@/server/mail/mailer";
import { safeLocalRedirect } from "@/lib/utils";
import { env } from "@/env";

export type AuthState = { error?: string; success?: string; values?: Record<string, string> };

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const PENDING_COOKIE = "jp_pending_email";
const sha = (v: string) => createHash("sha256").update(v).digest("hex");
const sixDigits = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

async function landingFor(role: string, requested?: string | null) {
  const safe = safeLocalRedirect(requested, "");
  if (safe && !safe.startsWith("/connexion") && !safe.startsWith("/inscription")) return safe;
  return role === "admin" ? "/admin" : "/profil";
}

/* ───────────── Connexion ───────────── */
export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const t = await getTranslations("auth.errors");
  const email = emailSchema.safeParse(formData.get("email"));
  const password = String(formData.get("mot_de_passe") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "");
  if (!email.success || !password || password.length > 512) return { error: t("invalid"), values: { email: String(formData.get("email") ?? "") } };
  const ip = await clientIp();
  if (!(await rateLimit(`login:${email.data}:${ip}`, 8, 900))) return { error: (await getTranslations("common"))("tooManyRequests") };
  const user = (await db.select().from(schema.users).where(eq(schema.users.email, email.data)).limit(1))[0];
  const ok = user ? await verifyPassword(password, user.motDePasse) : false;
  if (!user || !ok) {
    await new Promise((r) => setTimeout(r, 350));
    return { error: t("invalid"), values: { email: email.data } };
  }
  if (user.isActive !== 1) return { error: t("inactive") };
  if (passwordNeedsRehash(user.motDePasse)) {
    await db.update(schema.users).set({ motDePasse: await hashPassword(password) }).where(eq(schema.users.id, user.id)).catch(() => {});
  }
  await createSession(user.id);
  redirect(await landingFor(user.role, redirectTo));
}

/* ───────────── Google ───────────── */
export async function googleLoginAction(idToken: string, redirectTo?: string): Promise<{ error?: string; redirect?: string }> {
  const t = await getTranslations("auth.errors");
  const ip = await clientIp();
  if (!(await rateLimit(`google:${ip}`, 20, 900))) return { error: (await getTranslations("common"))("tooManyRequests") };
  const identity = await verifyGoogleIdToken(idToken);
  if (!identity) return { error: t("google") };
  let user = (await db.select().from(schema.users).where(or(eq(schema.users.googleId, identity.sub), eq(schema.users.email, identity.email))).limit(1))[0];
  if (!user) {
    const randomPassword = await hashPassword(createHash("sha256").update(identity.sub + env.APP_SECRET + Date.now()).digest("hex"));
    await db.insert(schema.users).values({
      nom: identity.familyName.slice(0, 100),
      prenom: identity.givenName.slice(0, 100),
      email: identity.email,
      motDePasse: randomPassword,
      googleId: identity.sub,
      authProvider: "google",
      photoProfil: identity.picture ? identity.picture.slice(0, 500) : "images/default-avatar.svg",
      isActive: 1,
    });
    user = (await db.select().from(schema.users).where(eq(schema.users.email, identity.email)).limit(1))[0];
    await db.delete(schema.tempUsers).where(eq(schema.tempUsers.email, identity.email)).catch(() => {});
  } else if (!user.googleId) {
    await db.update(schema.users).set({ googleId: identity.sub }).where(eq(schema.users.id, user.id));
  }
  if (!user) return { error: t("google") };
  if (user.isActive !== 1) return { error: t("inactive") };
  await createSession(user.id);
  return { redirect: await landingFor(user.role, redirectTo) };
}

/* ───────────── Inscription ───────────── */
export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const t = await getTranslations("auth.errors");
  const ts = await getTranslations("auth.success");
  const emailRaw = String(formData.get("email") ?? "");
  const email = emailSchema.safeParse(emailRaw);
  const password = String(formData.get("mot_de_passe") ?? "");
  const confirm = String(formData.get("confirmer_mot_de_passe") ?? "");
  const prenom = String(formData.get("prenom") ?? "").trim().slice(0, 100);
  const nom = String(formData.get("nom") ?? "").trim().slice(0, 100);
  const values = { email: emailRaw, prenom, nom };
  if (formData.get("website")) return { success: ts("activationSent") };
  if (!emailRaw || !password) return { error: t("fields"), values };
  if (!email.success) return { error: t("emailInvalid"), values };
  const policy = passwordPolicyError(password);
  if (policy) return { error: t(policy), values };
  if (password !== confirm) return { error: t("mismatch"), values };
  const ip = await clientIp();
  if (!(await rateLimit(`register:${ip}`, 5, 3600))) return { error: (await getTranslations("common"))("tooManyRequests"), values };

  const cutoff = new Date(Date.now() - 30 * 60_000);
  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email.data)).limit(1);
  const pending = await db.select({ id: schema.tempUsers.id }).from(schema.tempUsers).where(and(eq(schema.tempUsers.email, email.data), gt(schema.tempUsers.dateDemande, cutoff))).limit(1);
  if (existing.length || pending.length) return { error: t("exists"), values };
  await db.delete(schema.tempUsers).where(and(eq(schema.tempUsers.email, email.data), lt(schema.tempUsers.dateDemande, cutoff)));

  const code = sixDigits();
  await db.insert(schema.tempUsers).values({ nom, prenom, email: email.data, motDePasse: await hashPassword(password), token: sha(code) });
  const jar = await cookies();
  jar.set(PENDING_COOKIE, email.data, { httpOnly: true, sameSite: "lax", secure: env.NODE_ENV === "production", path: "/", maxAge: 1800 });
  let sent = false;
  try {
    const mail = layoutEmail({ title: "Activez votre compte JP-Services", intro: `Bonjour${prenom ? " " + prenom : ""}, voici votre code d'activation. Il expire dans 30 minutes.`, code, ctaLabel: "Activer mon compte", ctaUrl: `${env.APP_URL}/activation?email=${encodeURIComponent(email.data)}` });
    sent = await sendMail({ to: email.data, subject: "Votre code d'activation JP-Services", ...mail });
  } catch (error) {
    console.error("activation mail", error);
  }
  if (env.NODE_ENV !== "production" && !sent) console.info(`[dev] code d'activation pour ${email.data} : ${code}`);
  redirect(`/activation?email=${encodeURIComponent(email.data)}${sent ? "" : "&envoi=0"}`);
}

export async function activateAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const t = await getTranslations("auth.errors");
  const email = emailSchema.safeParse(formData.get("email"));
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  if (!email.success || code.length !== 6) return { error: t("codeInvalid") };
  const ip = await clientIp();
  if (!(await rateLimit(`activate:${email.data}:${ip}`, 8, 900))) return { error: (await getTranslations("common"))("tooManyRequests") };
  const cutoff = new Date(Date.now() - 30 * 60_000);
  const pending = (await db.select().from(schema.tempUsers).where(and(eq(schema.tempUsers.email, email.data), eq(schema.tempUsers.token, sha(code)), gt(schema.tempUsers.dateDemande, cutoff))).limit(1))[0];
  if (!pending) return { error: t("codeInvalid") };
  await db.transaction(async (tx) => {
    await tx.insert(schema.users).values({ nom: pending.nom, prenom: pending.prenom, email: pending.email, motDePasse: pending.motDePasse, photoProfil: pending.photoProfil, isActive: 1, authProvider: "local" });
    await tx.delete(schema.tempUsers).where(eq(schema.tempUsers.id, pending.id));
  });
  (await cookies()).delete(PENDING_COOKIE);
  const user = (await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email.data)).limit(1))[0];
  if (user) await createSession(user.id);
  redirect("/profil?bienvenue=1");
}

export async function resendActivationAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ts = await getTranslations("auth.success");
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: (await getTranslations("auth.errors"))("emailInvalid") };
  const ip = await clientIp();
  if (!(await rateLimit(`resend:${email.data}:${ip}`, 3, 900))) return { error: (await getTranslations("common"))("tooManyRequests") };
  const pending = (await db.select().from(schema.tempUsers).where(eq(schema.tempUsers.email, email.data)).limit(1))[0];
  if (pending) {
    const code = sixDigits();
    await db.update(schema.tempUsers).set({ token: sha(code), dateDemande: new Date() }).where(eq(schema.tempUsers.id, pending.id));
    const mail = layoutEmail({ title: "Votre nouveau code d'activation", intro: "Voici votre nouveau code d'activation JP-Services. Il expire dans 30 minutes.", code });
    const sent = await sendMail({ to: email.data, subject: "Nouveau code d'activation JP-Services", ...mail }).catch(() => false);
    if (env.NODE_ENV !== "production" && !sent) console.info(`[dev] code d'activation pour ${email.data} : ${code}`);
  }
  return { success: ts("activationSent") };
}

/* ───────────── Mot de passe oublié ───────────── */
export async function forgotPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const ts = await getTranslations("auth.success");
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: (await getTranslations("auth.errors"))("emailInvalid") };
  const ip = await clientIp();
  if (!(await rateLimit(`forgot:${email.data}:${ip}`, 4, 900))) return { error: (await getTranslations("common"))("tooManyRequests") };
  const user = (await db.select({ id: schema.users.id, prenom: schema.users.prenom }).from(schema.users).where(and(eq(schema.users.email, email.data), eq(schema.users.isActive, 1))).limit(1))[0];
  if (user) {
    const code = sixDigits();
    await db.update(schema.users).set({ resetToken: sha(code + email.data), resetExpire: new Date(Date.now() + 20 * 60_000) }).where(eq(schema.users.id, user.id));
    const mail = layoutEmail({ title: "Réinitialisation de votre mot de passe", intro: `Bonjour${user.prenom ? " " + user.prenom : ""}, utilisez ce code pour définir un nouveau mot de passe. Il expire dans 20 minutes.`, code, ctaLabel: "Choisir un nouveau mot de passe", ctaUrl: `${env.APP_URL}/mot-de-passe/reinitialiser?email=${encodeURIComponent(email.data)}` });
    const sent = await sendMail({ to: email.data, subject: "Code de réinitialisation JP-Services", ...mail }).catch(() => false);
    if (env.NODE_ENV !== "production" && !sent) console.info(`[dev] code de réinitialisation pour ${email.data} : ${code}`);
  }
  redirect(`/mot-de-passe/reinitialiser?email=${encodeURIComponent(email.data)}&envoye=1`);
  return { success: ts("codeSent") };
}

export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const t = await getTranslations("auth.errors");
  const email = emailSchema.safeParse(formData.get("email"));
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  const password = String(formData.get("mot_de_passe") ?? "");
  const confirm = String(formData.get("confirmer_mot_de_passe") ?? "");
  if (!email.success || code.length !== 6) return { error: t("codeInvalid") };
  const policy = passwordPolicyError(password);
  if (policy) return { error: t(policy) };
  if (password !== confirm) return { error: t("mismatch") };
  const ip = await clientIp();
  if (!(await rateLimit(`reset:${email.data}:${ip}`, 6, 900))) return { error: (await getTranslations("common"))("tooManyRequests") };
  const user = (await db.select({ id: schema.users.id }).from(schema.users).where(and(eq(schema.users.email, email.data), eq(schema.users.resetToken, sha(code + email.data)), gt(schema.users.resetExpire, new Date()))).limit(1))[0];
  if (!user) return { error: t("codeInvalid") };
  await db.update(schema.users).set({ motDePasse: await hashPassword(password), resetToken: null, resetExpire: null }).where(eq(schema.users.id, user.id));
  await destroyAllSessions(user.id);
  redirect("/connexion?reinitialise=1");
}

/* ───────────── Profil ───────────── */
export async function updateProfileAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  const t = await getTranslations("auth.errors");
  const prenom = String(formData.get("prenom") ?? "").trim().slice(0, 100);
  const nom = String(formData.get("nom") ?? "").trim().slice(0, 100);
  const email = emailSchema.safeParse(formData.get("email"));
  const current = String(formData.get("mot_de_passe_actuel") ?? "");
  const next = String(formData.get("nouveau_mot_de_passe") ?? "");
  const confirm = String(formData.get("confirmer_mot_de_passe") ?? "");
  if (!email.success) return { error: t("emailInvalid") };
  const row = (await db.select().from(schema.users).where(eq(schema.users.id, user.id)).limit(1))[0];
  if (!row) redirect("/connexion");
  const emailChanged = email.data !== row.email;
  const updates: Partial<typeof schema.users.$inferInsert> = { prenom, nom };
  if (emailChanged || next) {
    if (row.authProvider !== "google" && !(await verifyPassword(current, row.motDePasse))) return { error: "Le mot de passe actuel est incorrect." };
    if (emailChanged) {
      const taken = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email.data)).limit(1);
      if (taken.length) return { error: t("exists") };
      updates.email = email.data;
    }
    if (next) {
      const policy = passwordPolicyError(next);
      if (policy) return { error: t(policy) };
      if (next !== confirm) return { error: t("mismatch") };
      updates.motDePasse = await hashPassword(next);
    }
  }
  await db.update(schema.users).set(updates).where(eq(schema.users.id, user.id));
  return { success: "Votre profil a été mis à jour." };
}

export async function updateAvatarAction(formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Aucune image sélectionnée." };
  const { storeUpload, deleteUpload, UploadError } = await import("@/server/storage");
  try {
    const key = await storeUpload(file, "image", "profils");
    const previous = (await db.select({ p: schema.users.photoProfil }).from(schema.users).where(eq(schema.users.id, user.id)).limit(1))[0]?.p;
    await db.update(schema.users).set({ photoProfil: key }).where(eq(schema.users.id, user.id));
    if (previous?.startsWith("uploads/")) await deleteUpload(previous);
    return { success: "Photo de profil mise à jour." };
  } catch (error) {
    return { error: error instanceof UploadError ? error.message : "Le téléversement a échoué." };
  }
}

export async function deleteAccountAction(formData: FormData): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  const password = String(formData.get("mot_de_passe") ?? "");
  const row = (await db.select().from(schema.users).where(eq(schema.users.id, user.id)).limit(1))[0];
  if (!row) redirect("/connexion");
  if (row.role === "admin") return { error: "Un compte administrateur ne peut pas être supprimé depuis cet écran." };
  if (row.authProvider !== "google" && !(await verifyPassword(password, row.motDePasse))) return { error: "Mot de passe incorrect." };
  await db.delete(schema.users).where(eq(schema.users.id, user.id));
  await db.execute(sql`DELETE FROM sessions WHERE user_id = ${user.id}`).catch(() => {});
  (await cookies()).delete("jp_session");
  redirect("/?compte=supprime");
}
