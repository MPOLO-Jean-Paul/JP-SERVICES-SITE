import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, gte, ne, sql } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { detectDomain, splitList } from "@/lib/utils";

export type FormationCard = schema.Formation & { domain: ReturnType<typeof detectDomain>; modules: string[] };

function decorate(f: schema.Formation): FormationCard {
  return { ...f, domain: detectDomain(f.titre, f.description), modules: splitList(f.modulesListe) };
}

export const listFormations = cache(async (): Promise<FormationCard[]> => {
  const rows = await db.select().from(schema.formations).orderBy(asc(schema.formations.titre));
  return rows.map(decorate);
});

export const listUpcomingFormations = cache(async (limit = 3): Promise<FormationCard[]> => {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await db.select().from(schema.formations).where(gte(schema.formations.dateDebut, today)).orderBy(asc(schema.formations.dateDebut)).limit(limit);
  return rows.map(decorate);
});

export const getFormation = cache(async (id: number): Promise<FormationCard | null> => {
  const rows = await db.select().from(schema.formations).where(eq(schema.formations.id, id)).limit(1);
  return rows[0] ? decorate(rows[0]) : null;
});

export const getRelatedFormations = cache(async (id: number, limit = 3): Promise<FormationCard[]> => {
  const rows = await db.select().from(schema.formations).where(ne(schema.formations.id, id)).orderBy(desc(schema.formations.id)).limit(limit);
  return rows.map(decorate);
});

export async function getUserFormationState(userId: number, formationId: number) {
  const [enrolled, notif, planning] = await Promise.all([
    db.select({ id: schema.inscriptions.id }).from(schema.inscriptions).where(and(eq(schema.inscriptions.userId, userId), eq(schema.inscriptions.formationId, formationId))).limit(1),
    db
      .select({ id: schema.abonnements.id })
      .from(schema.abonnements)
      .where(and(eq(schema.abonnements.userId, userId), eq(schema.abonnements.formationId, formationId), eq(schema.abonnements.notificationsActive, 1)))
      .limit(1),
    db.select({ statut: schema.planningValide.statut }).from(schema.planningValide).where(and(eq(schema.planningValide.userId, userId), eq(schema.planningValide.formationId, formationId))).limit(1),
  ]);
  return { isEnrolled: enrolled.length > 0, notificationsOn: notif.length > 0, planningStatus: planning[0]?.statut ?? null };
}

export async function listUserEnrollments(userId: number) {
  return db
    .select({
      id: schema.inscriptions.id,
      dateInscription: schema.inscriptions.dateInscription,
      formation: schema.formations,
      planningStatut: schema.planningValide.statut,
      notificationsActive: schema.abonnements.notificationsActive,
    })
    .from(schema.inscriptions)
    .innerJoin(schema.formations, eq(schema.formations.id, schema.inscriptions.formationId))
    .leftJoin(schema.planningValide, and(eq(schema.planningValide.formationId, schema.inscriptions.formationId), eq(schema.planningValide.userId, userId)))
    .leftJoin(schema.abonnements, and(eq(schema.abonnements.formationId, schema.inscriptions.formationId), eq(schema.abonnements.userId, userId)))
    .where(eq(schema.inscriptions.userId, userId))
    .orderBy(desc(schema.inscriptions.dateInscription));
}

export async function listUserNotifications(userId: number) {
  return db
    .select({
      id: schema.notifications.id,
      titre: schema.notifications.titre,
      message: schema.notifications.message,
      dateEnvoi: schema.notifications.dateEnvoi,
      formationId: schema.notifications.formationId,
      formationTitre: schema.formations.titre,
      lue: sql<number>`IF(${schema.notificationsLues.notificationId} IS NULL, 0, 1)`,
    })
    .from(schema.notifications)
    .innerJoin(schema.abonnements, and(eq(schema.abonnements.formationId, schema.notifications.formationId), eq(schema.abonnements.userId, userId), eq(schema.abonnements.notificationsActive, 1)))
    .innerJoin(schema.formations, eq(schema.formations.id, schema.notifications.formationId))
    .leftJoin(schema.notificationsLues, and(eq(schema.notificationsLues.notificationId, schema.notifications.id), eq(schema.notificationsLues.userId, userId)))
    .orderBy(desc(schema.notifications.dateEnvoi))
    .limit(100);
}

export async function countUnreadNotifications(userId: number): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(schema.notifications)
    .innerJoin(schema.abonnements, and(eq(schema.abonnements.formationId, schema.notifications.formationId), eq(schema.abonnements.userId, userId), eq(schema.abonnements.notificationsActive, 1)))
    .leftJoin(schema.notificationsLues, and(eq(schema.notificationsLues.notificationId, schema.notifications.id), eq(schema.notificationsLues.userId, userId)))
    .where(sql`${schema.notificationsLues.notificationId} IS NULL`);
  return Number(rows[0]?.count ?? 0);
}

export async function getLatestNotificationForUser(userId: number) {
  const rows = await db
    .select({ id: schema.notifications.id, titre: schema.notifications.titre, message: schema.notifications.message, formationId: schema.notifications.formationId })
    .from(schema.notifications)
    .innerJoin(schema.abonnements, and(eq(schema.abonnements.formationId, schema.notifications.formationId), eq(schema.abonnements.userId, userId), eq(schema.abonnements.notificationsActive, 1)))
    .leftJoin(schema.notificationsLues, and(eq(schema.notificationsLues.notificationId, schema.notifications.id), eq(schema.notificationsLues.userId, userId)))
    .where(sql`${schema.notificationsLues.notificationId} IS NULL`)
    .orderBy(desc(schema.notifications.dateEnvoi))
    .limit(1);
  return rows[0] ?? null;
}
