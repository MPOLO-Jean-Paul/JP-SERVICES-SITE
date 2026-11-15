"use server";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { destroyAllSessions } from "@/server/auth/session";
import { hashPassword, passwordPolicyError } from "@/server/auth/password";
import { audit, fail, ok, requireAdminAction, str } from "./_helpers";
import type { FormState } from "@/server/actions/contact";

export async function setUserActiveAction(userId: number, active: boolean) {
  const admin = await requireAdminAction();
  if (userId === admin.id) return { ok: false, message: "Vous ne pouvez pas désactiver votre propre compte." };
  await db.update(schema.users).set({ isActive: active ? 1 : 0 }).where(eq(schema.users.id, userId));
  if (!active) await destroyAllSessions(userId);
  await audit(active ? "user.activate" : "user.deactivate", `user:${userId}`);
  revalidatePath("/admin/utilisateurs");
  return { ok: true };
}

export async function setUserRoleAction(userId: number, role: string) {
  const admin = await requireAdminAction();
  if (!["utilisateur", "admin"].includes(role)) return { ok: false, message: "Rôle invalide." };
  if (userId === admin.id && role !== "admin") return { ok: false, message: "Vous ne pouvez pas retirer votre propre rôle administrateur." };
  await db.update(schema.users).set({ role }).where(eq(schema.users.id, userId));
  await audit("user.role", `user:${userId}`, { role });
  revalidatePath("/admin/utilisateurs");
  return { ok: true };
}

export async function deleteUserAction(userId: number) {
  const admin = await requireAdminAction();
  if (userId === admin.id) return { ok: false, message: "Impossible de supprimer votre propre compte." };
  await db.delete(schema.users).where(eq(schema.users.id, userId));
  await audit("user.delete", `user:${userId}`);
  revalidatePath("/admin/utilisateurs");
  return { ok: true, message: "Compte supprimé." };
}

export async function activatePendingAction(tempId: number) {
  await requireAdminAction();
  const pending = (await db.select().from(schema.tempUsers).where(eq(schema.tempUsers.id, tempId)).limit(1))[0];
  if (!pending) return { ok: false, message: "Demande introuvable." };
  await db.transaction(async (tx) => {
    await tx.insert(schema.users).values({ nom: pending.nom, prenom: pending.prenom, email: pending.email, motDePasse: pending.motDePasse, photoProfil: pending.photoProfil, isActive: 1 });
    await tx.delete(schema.tempUsers).where(eq(schema.tempUsers.id, tempId));
  });
  await audit("user.activate-manual", `temp:${tempId}`, { email: pending.email });
  revalidatePath("/admin/utilisateurs");
  return { ok: true, message: "Compte activé manuellement." };
}

export async function createUserAction(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  const email = str(fd, "email", 254).toLowerCase();
  const password = String(fd.get("mot_de_passe") ?? "");
  const role = str(fd, "role") === "admin" ? "admin" : "utilisateur";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Adresse e-mail invalide.", fd);
  const policy = passwordPolicyError(password);
  if (policy) return fail("Mot de passe trop faible (10 caractères, majuscule, minuscule, chiffre).", fd);
  const exists = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (exists.length) return fail("Cette adresse est déjà utilisée.", fd);
  await db.insert(schema.users).values({ email, prenom: str(fd, "prenom", 100), nom: str(fd, "nom", 100), motDePasse: await hashPassword(password), role, isActive: 1 });
  await audit("user.create", email, { role });
  revalidatePath("/admin/utilisateurs");
  return ok("Compte créé.");
}

export async function purgeExpiredPendingAction() {
  await requireAdminAction();
  await db.execute(sql`DELETE FROM temp_users WHERE date_demande < NOW() - INTERVAL '30 minutes'`);
  revalidatePath("/admin/utilisateurs");
  return { ok: true, message: "Demandes expirées supprimées." };
}
