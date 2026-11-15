"use server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { clientIp, getCurrentUser } from "@/server/auth/session";
import { rateLimit } from "@/server/security/rate-limit";
import { layoutEmail, sendMail } from "@/server/mail/mailer";
import { splitList } from "@/lib/utils";
import { env } from "@/env";
import { headers } from "next/headers";

export type ActionResult = { ok: boolean; message: string };

async function requireFormationUser(formationId: number) {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?redirect_to=${encodeURIComponent(`/formations/${formationId}`)}`);
  return user;
}

export async function enrollAction(formationId: number): Promise<ActionResult> {
  const user = await requireFormationUser(formationId);
  if (!(await rateLimit(`formation-action:${user.id}`, 20, 300))) return { ok: false, message: "Trop d’actions successives. Patientez quelques instants." };
  try {
    await db.insert(schema.inscriptions).values({ userId: user.id, formationId }).onDuplicateKeyUpdate({ set: { formationId } });
    revalidatePath(`/formations/${formationId}`);
    revalidatePath("/abonnements");
    return { ok: true, message: "Votre inscription est confirmée. Vous pouvez maintenant organiser votre programme." };
  } catch (error) {
    console.error("enroll", error);
    return { ok: false, message: "Cette action n’a pas pu être enregistrée. Réessayez plus tard." };
  }
}

export async function toggleAlertsAction(formationId: number, enable: boolean): Promise<ActionResult> {
  const user = await requireFormationUser(formationId);
  if (!(await rateLimit(`formation-action:${user.id}`, 20, 300))) return { ok: false, message: "Trop d’actions successives. Patientez quelques instants." };
  try {
    if (!enable) {
      await db.update(schema.abonnements).set({ notificationsActive: 0 }).where(and(eq(schema.abonnements.userId, user.id), eq(schema.abonnements.formationId, formationId)));
      revalidatePath(`/formations/${formationId}`);
      return { ok: true, message: "Les alertes de cette formation sont désactivées." };
    }
    const formation = (await db.select().from(schema.formations).where(eq(schema.formations.id, formationId)).limit(1))[0];
    if (!formation) return { ok: false, message: "Formation introuvable." };
    const ua = ((await headers()).get("user-agent") ?? "").slice(0, 255);
    await db
      .insert(schema.abonnements)
      .values({
        userId: user.id,
        formationId,
        formationTitre: formation.titre,
        formationDescription: formation.description,
        formationPrix: formation.prix,
        formationDuree: formation.duree,
        formationNiveau: formation.niveau,
        formationDateDebut: formation.dateDebut,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        ipUtilisateur: await clientIp(),
        userAgent: ua,
        notificationsActive: 1,
      })
      .onDuplicateKeyUpdate({ set: { notificationsActive: 1 } });
    revalidatePath(`/formations/${formationId}`);
    return { ok: true, message: "Vous recevrez les prochaines informations concernant cette formation." };
  } catch (error) {
    console.error("alerts", error);
    return { ok: false, message: "Cette action n’a pas pu être enregistrée. Réessayez plus tard." };
  }
}

export type PlanningState = { error?: string; review?: { modules: string[]; schedule: Record<string, { debut: string; fin: string }> } };

const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/** Étape 1 → 2 : valide la sélection et renvoie un récapitulatif ; étape 2 : enregistre définitivement. */
export async function planningAction(_prev: PlanningState, formData: FormData): Promise<PlanningState> {
  const formationId = Number(formData.get("formation_id"));
  if (!Number.isInteger(formationId) || formationId <= 0) return { error: "Formation invalide." };
  const user = await requireFormationUser(formationId);
  const formation = (await db.select().from(schema.formations).where(eq(schema.formations.id, formationId)).limit(1))[0];
  if (!formation) return { error: "Formation introuvable." };
  const enrolled = await db.select({ id: schema.inscriptions.id }).from(schema.inscriptions).where(and(eq(schema.inscriptions.userId, user.id), eq(schema.inscriptions.formationId, formationId))).limit(1);
  if (!enrolled.length) return { error: "Une inscription active est nécessaire pour organiser ce programme." };

  const allowedModules = splitList(formation.modulesListe);
  const allowedDays = splitList(formation.joursPossibles);
  const modulesAllowed = allowedModules.length ? allowedModules : ["Parcours complet"];
  const daysAllowed = allowedDays.length ? allowedDays : ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

  const modules = Array.from(new Set(formData.getAll("modules").map(String))).filter((m) => modulesAllowed.includes(m));
  const days = Array.from(new Set(formData.getAll("jours").map(String))).filter((d) => daysAllowed.includes(d));
  if (!modules.length) return { error: "Sélectionnez au moins un module." };
  if (!days.length || days.length > 3) return { error: "Sélectionnez entre un et trois jours." };
  const schedule: Record<string, { debut: string; fin: string }> = {};
  for (const day of days) {
    const debut = String(formData.get(`debut_${day}`) ?? "").slice(0, 5);
    const fin = String(formData.get(`fin_${day}`) ?? "").slice(0, 5);
    if (!TIME.test(debut) || !TIME.test(fin) || debut >= fin) return { error: `L’horaire choisi pour ${day} est invalide.` };
    schedule[day] = { debut, fin };
  }
  if (formData.get("confirmer") !== "1") return { review: { modules, schedule } };

  if (!(await rateLimit(`planning:${user.id}`, 6, 600))) return { error: "Trop de demandes successives. Patientez quelques minutes.", review: { modules, schedule } };
  try {
    await db.insert(schema.planningValide).values({ userId: user.id, formationId, modulesChoisis: modules.join(", "), horaireDetails: JSON.stringify(schedule), statut: "en_attente" });
  } catch (error) {
    console.error("planning", error);
    return { error: "Le planning n’a pas pu être enregistré. Il existe peut-être déjà." };
  }
  const admin = env.ADMIN_NOTIFICATION_EMAIL ?? env.SMTP_FROM_ADDRESS;
  if (admin) {
    const mail = layoutEmail({ title: "Nouvelle demande de planning", intro: `${user.displayName} (${user.email}) a transmis une demande pour « ${formation.titre} ». Modules : ${modules.join(", ")}. Jours : ${Object.entries(schedule).map(([d, h]) => `${d} ${h.debut}–${h.fin}`).join(", ")}.`, ctaLabel: "Ouvrir l’administration", ctaUrl: `${env.APP_URL}/admin/horaires` });
    await sendMail({ to: admin, subject: `Nouvelle demande de planning — ${formation.titre}`, replyTo: user.email, ...mail }).catch(() => false);
  }
  revalidatePath(`/formations/${formationId}`);
  revalidatePath("/abonnements");
  redirect(`/formations/${formationId}/programme?envoye=1`);
}
