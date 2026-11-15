import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { getCurrentUser, clientIp } from "@/server/auth/session";

export async function adminStats() {
  const count = async (q: Promise<Array<{ c: number }>>) => Number((await q)[0]?.c ?? 0);
  const [users, pendingActivations, formations, enrollments, pendingPlannings, projectsPending, posts, messages, tickets, partnerships, logiciels, live, newsletter] = await Promise.all([
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.users)),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.tempUsers)),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.formations)),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.inscriptions)),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.planningValide).where(eq(schema.planningValide.statut, "en_attente"))),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.projets).where(eq(schema.projets.statut, "en_attente"))),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.posts)),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.messages)),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.supportTickets).where(eq(schema.supportTickets.statut, "nouveau"))),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.partenariatDemandes).where(eq(schema.partenariatDemandes.statut, "nouvelle"))),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.logiciels)),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.liveSessions).where(sql`statut IN ('planifiee','en_cours')`)),
    count(db.select({ c: sql<number>`COUNT(*)` }).from(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.statut, "actif"))),
  ]);
  return { users, pendingActivations, formations, enrollments, pendingPlannings, projectsPending, posts, messages, tickets, partnerships, logiciels, live, newsletter };
}

export async function recentActivity() {
  const [users, messages, projects, plannings] = await Promise.all([
    db.select({ id: schema.users.id, nom: schema.users.nom, prenom: schema.users.prenom, email: schema.users.email, date: schema.users.dateInscription }).from(schema.users).orderBy(desc(schema.users.dateInscription)).limit(5),
    db.select({ id: schema.messages.id, nom: schema.messages.nom, sujet: schema.messages.sujet, date: schema.messages.dateEnvoi }).from(schema.messages).orderBy(desc(schema.messages.dateEnvoi)).limit(5),
    db.select({ id: schema.projets.id, titre: schema.projets.titre, statut: schema.projets.statut, date: schema.projets.dateSoumission }).from(schema.projets).orderBy(desc(schema.projets.dateSoumission)).limit(5),
    db.select({ id: schema.planningValide.id, statut: schema.planningValide.statut, date: schema.planningValide.dateCreation, formation: schema.formations.titre, user: schema.users.email }).from(schema.planningValide).innerJoin(schema.formations, eq(schema.formations.id, schema.planningValide.formationId)).innerJoin(schema.users, eq(schema.users.id, schema.planningValide.userId)).orderBy(desc(schema.planningValide.dateCreation)).limit(5),
  ]);
  return { users, messages, projects, plannings };
}

/** Trace une action d'administration (journal consultable dans la console). */
export async function audit(action: string, cible: string, details?: Record<string, unknown>) {
  try {
    const user = await getCurrentUser();
    await db.insert(schema.auditLog).values({ userId: user?.id ?? null, action, cible: cible.slice(0, 160), details: details ? JSON.stringify(details).slice(0, 4000) : null, ipAddress: await clientIp() });
  } catch (error) {
    console.error("audit", error);
  }
}
