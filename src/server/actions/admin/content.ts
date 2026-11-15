"use server";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/server/db";
import { deleteUpload, storeUpload, UploadError } from "@/server/storage";
import { slugify } from "@/lib/utils";
import { SETTING_FIELDS } from "@/server/services/settings";
import { audit, bool, fail, fileOrNull, num, ok, requireAdminAction, str } from "./_helpers";
import type { FormState } from "@/server/actions/contact";

const revalidateAll = (...paths: string[]) => paths.forEach((p) => revalidatePath(p));

/* ───── Actualités ───── */
export async function saveActualiteAction(id: number | null, _p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  const titre = str(fd, "titre", 180); const contenu = str(fd, "contenu", 100_000);
  if (titre.length < 3 || contenu.length < 10) return fail("Titre et contenu sont obligatoires.", fd);
  const current = id ? (await db.select({ media: schema.actualites.media }).from(schema.actualites).where(eq(schema.actualites.id, id)).limit(1))[0] : null;
  let media = current?.media ?? "";
  try { const f = fileOrNull(fd, "media"); if (f) { media = await storeUpload(f, "image", "actualites"); if (current?.media.startsWith("uploads/")) await deleteUpload(current.media); } } catch (e) { return fail(e instanceof UploadError ? e.message : "Téléversement impossible.", fd); }
  const externalMedia = str(fd, "media_url", 500); if (externalMedia && /^https?:\/\//i.test(externalMedia)) media = externalMedia;
  if (id) { await db.update(schema.actualites).set({ titre, contenu, media }).where(eq(schema.actualites.id, id)); await audit("actualite.update", `actualite:${id}`); }
  else { const [r] = await db.insert(schema.actualites).values({ titre, contenu, media }).returning({ id: schema.actualites.id }); await audit("actualite.create", `actualite:${r?.id}`); id = r?.id ?? null; }
  revalidateAll("/actualites", "/", "/admin/actualites");
  if (id) revalidatePath(`/actualites/${id}`);
  return ok(id ? "Actualité enregistrée." : "Actualité publiée.");
}
export async function deleteActualiteAction(id: number) {
  await requireAdminAction();
  const cur = (await db.select({ media: schema.actualites.media }).from(schema.actualites).where(eq(schema.actualites.id, id)).limit(1))[0];
  await db.delete(schema.actualites).where(eq(schema.actualites.id, id));
  if (cur?.media.startsWith("uploads/")) await deleteUpload(cur.media);
  await audit("actualite.delete", `actualite:${id}`);
  revalidateAll("/actualites", "/", "/admin/actualites");
  redirect("/admin/actualites?supprimee=1");
}

/* ───── Logiciels ───── */
export async function saveLogicielAction(id: number | null, _p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  const nom = str(fd, "nom", 180); if (nom.length < 2) return fail("Le nom est obligatoire.", fd);
  const lienExterne = str(fd, "lien_externe", 500); if (lienExterne && !/^https?:\/\//i.test(lienExterne)) return fail("Le lien externe doit commencer par http(s)://", fd);
  const current = id ? (await db.select().from(schema.logiciels).where(eq(schema.logiciels.id, id)).limit(1))[0] : null;
  let fichier = current?.fichier ?? ""; let image = current?.image ?? ""; let taille = current?.tailleOctets ?? 0;
  try {
    const f = fileOrNull(fd, "fichier"); if (f) { fichier = await storeUpload(f, "software", "logiciels"); taille = f.size; if (current?.fichier) await deleteUpload(current.fichier); }
    const img = fileOrNull(fd, "image"); if (img) { image = await storeUpload(img, "image", "logiciels"); if (current?.image.startsWith("uploads/")) await deleteUpload(current.image); }
  } catch (e) { return fail(e instanceof UploadError ? e.message : "Téléversement impossible.", fd); }
  const manualSize = num(fd, "taille_mo", 0); if (manualSize > 0 && !fileOrNull(fd, "fichier")) taille = Math.round(manualSize * 1024 * 1024);
  const categorieId = num(fd, "categorie_id", 0) || null;
  const data = { nom, description: str(fd, "description", 10_000) || null, version: str(fd, "version", 40), plateforme: str(fd, "plateforme", 120), licence: str(fd, "licence", 60) || "Gratuit", categorieId, lienExterne, fichier, image, tailleOctets: taille, statut: (str(fd, "statut") === "brouillon" ? "brouillon" : "publie") as "publie" | "brouillon" };
  if (id) { await db.update(schema.logiciels).set(data).where(eq(schema.logiciels.id, id)); await audit("logiciel.update", `logiciel:${id}`); }
  else { const [r] = await db.insert(schema.logiciels).values(data).returning({ id: schema.logiciels.id }); await audit("logiciel.create", `logiciel:${r?.id}`); }
  revalidateAll("/logiciels", "/", "/admin/logiciels");
  return ok("Logiciel enregistré.");
}
export async function deleteLogicielAction(id: number) {
  await requireAdminAction();
  const cur = (await db.select().from(schema.logiciels).where(eq(schema.logiciels.id, id)).limit(1))[0];
  await db.delete(schema.logiciels).where(eq(schema.logiciels.id, id));
  if (cur?.fichier) await deleteUpload(cur.fichier); if (cur?.image.startsWith("uploads/")) await deleteUpload(cur.image);
  await audit("logiciel.delete", `logiciel:${id}`);
  revalidateAll("/logiciels", "/admin/logiciels");
  return { ok: true, message: "Logiciel supprimé." };
}
export async function saveCategorieAction(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  const nom = str(fd, "nom", 120); if (nom.length < 2) return fail("Nom de catégorie requis.", fd);
  await db.insert(schema.logicielCategories).values({ nom, slug: slugify(nom) || randomBytes(4).toString("hex"), icone: str(fd, "icone", 60) || "box", ordre: num(fd, "ordre", 0) });
  revalidateAll("/logiciels", "/admin/logiciels");
  return ok("Catégorie ajoutée.");
}
export async function deleteCategorieAction(id: number) {
  await requireAdminAction();
  await db.delete(schema.logicielCategories).where(eq(schema.logicielCategories.id, id));
  revalidateAll("/logiciels", "/admin/logiciels");
  return { ok: true, message: "Catégorie supprimée." };
}

/* ───── Produits ───── */
export async function saveProduitAction(id: number | null, _p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  const nom = str(fd, "nom", 180); const description = str(fd, "description", 20_000);
  if (nom.length < 2) return fail("Désignation requise.", fd);
  const current = id ? (await db.select({ imageUrl: schema.produits.imageUrl }).from(schema.produits).where(eq(schema.produits.id, id)).limit(1))[0] : null;
  let imageUrl = current?.imageUrl ?? "";
  try { const f = fileOrNull(fd, "image"); if (f) { imageUrl = await storeUpload(f, "image", "produits"); if (current?.imageUrl.startsWith("uploads/")) await deleteUpload(current.imageUrl); } } catch (e) { return fail(e instanceof UploadError ? e.message : "Téléversement impossible.", fd); }
  const data = { nom, description, prix: Math.max(0, num(fd, "prix", 0)).toFixed(2), imageUrl };
  if (id) await db.update(schema.produits).set(data).where(eq(schema.produits.id, id)); else await db.insert(schema.produits).values(data);
  await audit(id ? "produit.update" : "produit.create", nom);
  revalidateAll("/produits", "/admin/produits");
  return ok("Produit enregistré.");
}
export async function deleteProduitAction(id: number) {
  await requireAdminAction();
  const cur = (await db.select({ imageUrl: schema.produits.imageUrl }).from(schema.produits).where(eq(schema.produits.id, id)).limit(1))[0];
  await db.delete(schema.produits).where(eq(schema.produits.id, id));
  if (cur?.imageUrl.startsWith("uploads/")) await deleteUpload(cur.imageUrl);
  revalidateAll("/produits", "/admin/produits");
  return { ok: true, message: "Produit supprimé." };
}

/* ───── Sessions en ligne ───── */
export async function saveLiveAction(id: number | null, _p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  const titre = str(fd, "titre", 190); if (titre.length < 3) return fail("Titre requis.", fd);
  const dateRaw = str(fd, "date_debut", 25); const dateDebut = new Date(dateRaw);
  if (!dateRaw || Number.isNaN(dateDebut.getTime())) return fail("Date et heure de début invalides.", fd);
  const data = { titre, description: str(fd, "description", 5000) || null, formateur: str(fd, "formateur", 160), formationId: num(fd, "formation_id", 0) || null, dateDebut, dureeMinutes: Math.min(600, Math.max(15, num(fd, "duree_minutes", 60))), acces: (str(fd, "acces") === "public" ? "public" : "membres") as "public" | "membres", statut: (["planifiee", "en_cours", "terminee", "annulee"].includes(str(fd, "statut")) ? str(fd, "statut") : "planifiee") as "planifiee" | "en_cours" | "terminee" | "annulee" };
  if (id) { await db.update(schema.liveSessions).set(data).where(eq(schema.liveSessions.id, id)); await audit("live.update", `live:${id}`); }
  else { const roomName = "JPServices" + slugify(titre).replace(/-/g, "").slice(0, 24) + randomBytes(4).toString("hex"); await db.insert(schema.liveSessions).values({ ...data, roomName }); await audit("live.create", titre); }
  revalidateAll("/formations-en-ligne", "/", "/admin/live");
  return ok("Session enregistrée.");
}
export async function setLiveStatusAction(id: number, statut: string) {
  await requireAdminAction();
  if (!["planifiee", "en_cours", "terminee", "annulee"].includes(statut)) return { ok: false, message: "Statut invalide." };
  await db.update(schema.liveSessions).set({ statut: statut as "planifiee" }).where(eq(schema.liveSessions.id, id));
  revalidateAll("/formations-en-ligne", `/visio/${id}`, "/admin/live");
  return { ok: true };
}
export async function deleteLiveAction(id: number) {
  await requireAdminAction();
  await db.delete(schema.liveSessions).where(eq(schema.liveSessions.id, id));
  revalidateAll("/formations-en-ligne", "/admin/live");
  return { ok: true, message: "Session supprimée." };
}

/* ───── Partenaires et demandes ───── */
export async function savePartenaireAction(id: number | null, _p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  const nom = str(fd, "nom", 160); if (nom.length < 2) return fail("Nom requis.", fd);
  const siteWeb = str(fd, "site_web", 500); if (siteWeb && !/^https?:\/\//i.test(siteWeb)) return fail("Le site web doit commencer par http(s)://", fd);
  const current = id ? (await db.select({ logo: schema.partenaires.logo }).from(schema.partenaires).where(eq(schema.partenaires.id, id)).limit(1))[0] : null;
  let logo = current?.logo ?? "";
  try { const f = fileOrNull(fd, "logo"); if (f) { logo = await storeUpload(f, "logo", "partenaires"); if (current?.logo.startsWith("uploads/")) await deleteUpload(current.logo); } } catch (e) { return fail(e instanceof UploadError ? e.message : "Téléversement impossible.", fd); }
  const data = { nom, description: str(fd, "description", 2000) || null, siteWeb, typePartenariat: str(fd, "type_partenariat", 80), ordre: num(fd, "ordre", 0), actif: bool(fd, "actif") ? 1 : 0, logo };
  if (id) await db.update(schema.partenaires).set(data).where(eq(schema.partenaires.id, id)); else await db.insert(schema.partenaires).values(data);
  revalidateAll("/partenariat", "/admin/partenariats");
  return ok("Partenaire enregistré.");
}
export async function deletePartenaireAction(id: number) {
  await requireAdminAction();
  const cur = (await db.select({ logo: schema.partenaires.logo }).from(schema.partenaires).where(eq(schema.partenaires.id, id)).limit(1))[0];
  await db.delete(schema.partenaires).where(eq(schema.partenaires.id, id));
  if (cur?.logo.startsWith("uploads/")) await deleteUpload(cur.logo);
  revalidateAll("/partenariat", "/admin/partenariats");
  return { ok: true, message: "Partenaire supprimé." };
}
export async function setDemandeStatusAction(id: number, statut: string) {
  await requireAdminAction();
  if (!["nouvelle", "en_discussion", "acceptee", "refusee"].includes(statut)) return { ok: false, message: "Statut invalide." };
  await db.update(schema.partenariatDemandes).set({ statut: statut as "nouvelle" }).where(eq(schema.partenariatDemandes.id, id));
  revalidatePath("/admin/partenariats");
  return { ok: true };
}
export async function saveDemandeNoteAction(id: number, _p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  await db.update(schema.partenariatDemandes).set({ noteAdmin: str(fd, "note_admin", 5000) || null }).where(eq(schema.partenariatDemandes.id, id));
  revalidatePath("/admin/partenariats");
  return ok("Note enregistrée.");
}
export async function deleteDemandeAction(id: number) {
  await requireAdminAction();
  await db.delete(schema.partenariatDemandes).where(eq(schema.partenariatDemandes.id, id));
  revalidatePath("/admin/partenariats");
  return { ok: true, message: "Demande supprimée." };
}

/* ───── Projets ───── */
export async function setProjectStatusAction(id: number, statut: string) {
  await requireAdminAction();
  if (!["en_attente", "valide", "rejete"].includes(statut)) return { ok: false, message: "Statut invalide." };
  await db.update(schema.projets).set({ statut }).where(eq(schema.projets.id, id));
  await audit("projet.status", `projet:${id}`, { statut });
  revalidateAll("/projets", "/mes-projets", `/projets/${id}`, "/admin/projets");
  return { ok: true };
}
export async function deleteProjectAction(id: number) {
  await requireAdminAction();
  await db.delete(schema.projets).where(eq(schema.projets.id, id));
  await audit("projet.delete", `projet:${id}`);
  revalidateAll("/projets", "/admin/projets");
  return { ok: true, message: "Projet supprimé." };
}

/* ───── Forum (modération) ───── */
export async function adminDeletePostAction(id: number) {
  await requireAdminAction();
  await db.delete(schema.posts).where(eq(schema.posts.id, id));
  await audit("post.delete", `post:${id}`);
  revalidateAll("/forum", "/admin/forum");
  return { ok: true, message: "Publication supprimée." };
}

/* ───── Messages, support, newsletter ───── */
export async function deleteMessageAction(id: number) {
  await requireAdminAction();
  await db.delete(schema.messages).where(eq(schema.messages.id, id));
  revalidatePath("/admin/messages");
  return { ok: true, message: "Message supprimé." };
}
export async function replyMessageAction(_p: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdminAction();
  const to = str(fd, "to", 254); const subject = str(fd, "subject", 180); const body = str(fd, "body", 10_000);
  if (!to || body.length < 5) return fail("Destinataire et message requis.", fd);
  const { sendMail, layoutEmail, smtpIsConfigured, smtpConfigurationError } = await import("@/server/mail/mailer");
  if (!smtpIsConfigured()) return fail(`SMTP non configuré : ${smtpConfigurationError()}`, fd);
  try {
    await sendMail({ to, subject: subject || "Réponse de JP-Services", replyTo: admin.email, ...layoutEmail({ title: subject || "Réponse de JP-Services", intro: body, footer: "Vous recevez ce message en réponse à votre demande adressée à JP-Services." }) });
    await audit("message.reply", to, { subject });
    return ok("Réponse envoyée.");
  } catch (e) { return fail(`Envoi impossible : ${e instanceof Error ? e.message : "erreur SMTP"}`, fd); }
}
export async function setTicketStatusAction(id: number, statut: string) {
  await requireAdminAction();
  if (!["nouveau", "en_cours", "resolu", "ferme"].includes(statut)) return { ok: false, message: "Statut invalide." };
  await db.update(schema.supportTickets).set({ statut }).where(eq(schema.supportTickets.id, id));
  revalidatePath("/admin/support");
  return { ok: true };
}
export async function deleteTicketAction(id: number) {
  await requireAdminAction();
  await db.delete(schema.supportTickets).where(eq(schema.supportTickets.id, id));
  revalidatePath("/admin/support");
  return { ok: true, message: "Demande supprimée." };
}
export async function deleteSubscriberAction(id: number) {
  await requireAdminAction();
  await db.delete(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.id, id));
  revalidatePath("/admin/newsletter");
  return { ok: true, message: "Abonné supprimé." };
}

/* ───── Équipe ───── */
export async function saveMembreAction(id: number | null, _p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  const nom = str(fd, "nom", 120); const role = str(fd, "role", 120);
  if (nom.length < 2 || role.length < 2) return fail("Nom et rôle sont obligatoires.", fd);
  const current = id ? (await db.select({ photo: schema.equipe.photo }).from(schema.equipe).where(eq(schema.equipe.id, id)).limit(1))[0] : null;
  let photo = current?.photo ?? "default-avatar.svg";
  try { const f = fileOrNull(fd, "photo"); if (f) { photo = await storeUpload(f, "image", "equipe"); if (current?.photo.startsWith("uploads/")) await deleteUpload(current.photo); } } catch (e) { return fail(e instanceof UploadError ? e.message : "Téléversement impossible.", fd); }
  const data = { nom, role, email: str(fd, "email", 254), linkedin: str(fd, "linkedin", 500) || null, ordre: num(fd, "ordre", 0), photo };
  if (id) await db.update(schema.equipe).set(data).where(eq(schema.equipe.id, id)); else await db.insert(schema.equipe).values(data);
  revalidateAll("/a-propos", "/admin/equipe");
  return ok("Membre enregistré.");
}
export async function deleteMembreAction(id: number) {
  await requireAdminAction();
  const cur = (await db.select({ photo: schema.equipe.photo }).from(schema.equipe).where(eq(schema.equipe.id, id)).limit(1))[0];
  await db.delete(schema.equipe).where(eq(schema.equipe.id, id));
  if (cur?.photo.startsWith("uploads/")) await deleteUpload(cur.photo);
  revalidateAll("/a-propos", "/admin/equipe");
  return { ok: true, message: "Membre supprimé." };
}

/* ───── Paramètres ───── */
export async function saveSettingsAction(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  for (const f of SETTING_FIELDS) {
    const valeur = str(fd, f.key, 5000);
    await db.insert(schema.siteSettings).values({ cle: f.key, valeur }).onConflictDoUpdate({ target: schema.siteSettings.cle, set: { valeur } });
  }
  await audit("settings.update", "site_settings");
  revalidatePath("/", "layout");
  return ok("Paramètres enregistrés.");
}

/* ───── SMTP ───── */
export async function testSmtpAction(_p: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdminAction();
  const to = str(fd, "to", 254) || admin.email;
  const { sendMail, verifySmtp, smtpIsConfigured, smtpConfigurationError, layoutEmail } = await import("@/server/mail/mailer");
  if (!smtpIsConfigured()) return fail(`SMTP non configuré : ${smtpConfigurationError()}`);
  try {
    await verifySmtp();
    await sendMail({ to, subject: "Test SMTP JP-Services", ...layoutEmail({ title: "Test SMTP réussi", intro: `Ce message confirme que l'envoi d'e-mails fonctionne depuis la plateforme JP-Services (${new Date().toLocaleString("fr-FR")}).` }) });
    return ok(`E-mail de test envoyé à ${to}.`);
  } catch (e) { return fail(`Échec SMTP : ${e instanceof Error ? e.message : "erreur inconnue"}`); }
}
