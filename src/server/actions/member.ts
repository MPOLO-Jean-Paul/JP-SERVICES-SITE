"use server";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";

export async function markNotificationReadAction(notificationId: number) {
  const user = await getCurrentUser();
  if (!user) return;
  await db.insert(schema.notificationsLues).values({ userId: user.id, notificationId }).onDuplicateKeyUpdate({ set: { dateLecture: new Date() } }).catch(() => {});
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return;
  await db.execute(sql`INSERT IGNORE INTO notifications_lues (user_id, notification_id) SELECT ${user.id}, n.id FROM notifications n JOIN abonnements a ON a.formation_id = n.formation_id AND a.user_id = ${user.id} AND a.notifications_active = 1`);
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}

export async function setFormationAlertsAction(formationId: number, enabled: boolean) {
  const user = await getCurrentUser();
  if (!user) return;
  await db.update(schema.abonnements).set({ notificationsActive: enabled ? 1 : 0 }).where(and(eq(schema.abonnements.userId, user.id), eq(schema.abonnements.formationId, formationId)));
  revalidatePath("/abonnements");
}

export async function unenrollAction(formationId: number) {
  const user = await getCurrentUser();
  if (!user) return;
  await db.delete(schema.inscriptions).where(and(eq(schema.inscriptions.userId, user.id), eq(schema.inscriptions.formationId, formationId)));
  await db.delete(schema.planningValide).where(and(eq(schema.planningValide.userId, user.id), eq(schema.planningValide.formationId, formationId)));
  revalidatePath("/abonnements");
  revalidatePath(`/formations/${formationId}`);
}
