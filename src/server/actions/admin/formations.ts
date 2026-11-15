"use server";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/server/db";
import { deleteUpload, storeUpload, UploadError } from "@/server/storage";
import { audit, fail, fileOrNull, ok, requireAdminAction, str } from "./_helpers";
import type { FormState } from "@/server/actions/contact";

function parseFormation(fd: FormData) {
  const titre = str(fd, "titre", 180);
  const description = str(fd, "description", 50_000);
  const prix = Math.max(0, Number(fd.get("prix") ?? 0) || 0);
  const niveau = str(fd, "niveau", 80) || "Débutant";
  const duree = str(fd, "duree", 80);
  const dateDebut = str(fd, "date_debut", 10) || null;
  const modulesListe = str(fd, "modules_liste", 20_000);
  const joursPossibles = str(fd, "jours_possibles", 255) || "Lundi,Mardi,Mercredi,Jeudi,Vendredi";
  const heureDebutDefaut = /^\d{2}:\d{2}/.test(str(fd, "heure_debut")) ? str(fd, "heure_debut").slice(0, 5) + ":00" : "08:00:00";
  const heureFinDefaut = /^\d{2}:\d{2}/.test(str(fd, "heure_fin")) ? str(fd, "heure_fin").slice(0, 5) + ":00" : "17:00:00";
  if (titre.length < 3) return { error: "Le titre est obligatoire (3 caractères minimum)." };
  if (description.length < 20) return { error: "La description doit contenir au moins 20 caractères." };
  if (!duree) return { error: "Indiquez la durée totale." };
  if (dateDebut && !/^\d{4}-\d{2}-\d{2}$/.test(dateDebut)) return { error: "Date de rentrée invalide." };
  return { data: { titre, description, prix: prix.toFixed(2), niveau, duree, dateDebut, modulesListe, joursPossibles, heureDebutDefaut, heureFinDefaut } };
}

export async function createFormationAction(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  const parsed = parseFormation(fd);
  if ("error" in parsed) return fail(parsed.error!, fd);
  let image = "images/formations/default.jpg";
  try {
    const file = fileOrNull(fd, "image");
    if (file) image = await storeUpload(file, "image", "formations");
  } catch (e) { return fail(e instanceof UploadError ? e.message : "Téléversement impossible.", fd); }
  const [res] = await db.insert(schema.formations).values({ ...parsed.data!, image }).$returningId();
  await audit("formation.create", `formation:${res?.id}`, { titre: parsed.data!.titre });
  revalidatePath("/formations"); revalidatePath("/");
  redirect(`/admin/formations/${res?.id}?creee=1`);
}

export async function updateFormationAction(id: number, _p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  const parsed = parseFormation(fd);
  if ("error" in parsed) return fail(parsed.error!, fd);
  const current = (await db.select({ image: schema.formations.image }).from(schema.formations).where(eq(schema.formations.id, id)).limit(1))[0];
  if (!current) return fail("Formation introuvable.");
  let image = current.image;
  try {
    const file = fileOrNull(fd, "image");
    if (file) { image = await storeUpload(file, "image", "formations"); if (current.image.startsWith("uploads/")) await deleteUpload(current.image); }
  } catch (e) { return fail(e instanceof UploadError ? e.message : "Téléversement impossible.", fd); }
  await db.update(schema.formations).set({ ...parsed.data!, image }).where(eq(schema.formations.id, id));
  await audit("formation.update", `formation:${id}`);
  revalidatePath("/formations"); revalidatePath(`/formations/${id}`); revalidatePath("/"); revalidatePath("/admin/formations");
  return ok("Formation mise à jour.");
}

export async function deleteFormationAction(id: number) {
  await requireAdminAction();
  const current = (await db.select({ image: schema.formations.image, titre: schema.formations.titre }).from(schema.formations).where(eq(schema.formations.id, id)).limit(1))[0];
  if (!current) return { ok: false, message: "Introuvable." };
  await db.delete(schema.formations).where(eq(schema.formations.id, id));
  if (current.image.startsWith("uploads/")) await deleteUpload(current.image);
  await audit("formation.delete", `formation:${id}`, { titre: current.titre });
  revalidatePath("/formations"); revalidatePath("/");
  redirect("/admin/formations?supprimee=1");
}

/* ───── Plannings ───── */
export async function setPlanningStatusAction(id: number, statut: string) {
  await requireAdminAction();
  if (!["en_attente", "valide", "refuse"].includes(statut)) return { ok: false, message: "Statut invalide." };
  await db.update(schema.planningValide).set({ statut, dateValidation: statut === "valide" ? new Date() : null }).where(eq(schema.planningValide.id, id));
  await audit("planning.status", `planning:${id}`, { statut });
  revalidatePath("/admin/horaires"); revalidatePath("/abonnements");
  return { ok: true };
}
export async function deletePlanningAction(id: number) {
  await requireAdminAction();
  await db.delete(schema.planningValide).where(eq(schema.planningValide.id, id));
  await audit("planning.delete", `planning:${id}`);
  revalidatePath("/admin/horaires");
  return { ok: true, message: "Planning supprimé." };
}

/* ───── Notifications aux inscrits ───── */
export async function sendNotificationAction(_p: FormState, fd: FormData): Promise<FormState> {
  await requireAdminAction();
  const formationId = Number(fd.get("formation_id"));
  const titre = str(fd, "titre", 180);
  const message = str(fd, "message", 10_000);
  if (!Number.isInteger(formationId) || formationId <= 0) return fail("Sélectionnez une formation.", fd);
  if (titre.length < 3 || message.length < 5) return fail("Renseignez un objet et un message.", fd);
  const formation = (await db.select({ id: schema.formations.id, titre: schema.formations.titre }).from(schema.formations).where(eq(schema.formations.id, formationId)).limit(1))[0];
  if (!formation) return fail("Formation introuvable.", fd);
  await db.insert(schema.notifications).values({ formationId, titre, message });
  const recipients = await db.select({ email: schema.abonnements.email, prenom: schema.abonnements.prenom }).from(schema.abonnements).where(sql`formation_id = ${formationId} AND notifications_active = 1`);
  if (fd.get("envoyer_email") === "1" && recipients.length) {
    const { sendMail, layoutEmail, smtpIsConfigured } = await import("@/server/mail/mailer");
    if (smtpIsConfigured()) {
      const { env } = await import("@/env");
      await Promise.allSettled(recipients.map((r) => sendMail({ to: r.email, subject: `${formation.titre} — ${titre}`, ...layoutEmail({ title: titre, intro: message, ctaLabel: "Voir la formation", ctaUrl: `${env.APP_URL}/formations/${formationId}` }) })));
    }
  }
  await audit("notification.send", `formation:${formationId}`, { titre, recipients: recipients.length });
  revalidatePath("/admin/abonnements"); revalidatePath("/notifications");
  return ok(`Notification enregistrée pour ${recipients.length} abonné(s).`);
}
export async function deleteNotificationAction(id: number) {
  await requireAdminAction();
  await db.delete(schema.notifications).where(eq(schema.notifications.id, id));
  revalidatePath("/admin/abonnements");
  return { ok: true, message: "Notification supprimée." };
}
