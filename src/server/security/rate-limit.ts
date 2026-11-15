import "server-only";
import { createHash } from "node:crypto";
import { lt, sql } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { env } from "@/env";

/**
 * Limitation de débit persistante en base (fenêtre fixe), fonctionnelle sur plusieurs
 * instances. Une seule requête atomique « INSERT … ON CONFLICT … RETURNING ».
 * Retourne `true` si l’action est autorisée.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const hashed = createHash("sha256").update(`${key}:${env.APP_SECRET}`).digest("hex");
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);
  const t = schema.rateLimits;
  try {
    const [row] = await db
      .insert(t)
      .values({ key: hashed, count: 1, windowStart: now })
      .onConflictDoUpdate({
        target: t.key,
        set: {
          count: sql`CASE WHEN ${t.windowStart} < ${windowStart.toISOString()}::timestamptz THEN 1 ELSE ${t.count} + 1 END`,
          windowStart: sql`CASE WHEN ${t.windowStart} < ${windowStart.toISOString()}::timestamptz THEN ${now.toISOString()}::timestamptz ELSE ${t.windowStart} END`,
        },
      })
      .returning({ count: t.count });
    if (Math.random() < 0.02) {
      await db.delete(t).where(lt(t.windowStart, new Date(now.getTime() - 86_400_000))).catch(() => {});
    }
    return (row?.count ?? 0) <= limit;
  } catch (error) {
    console.error("rate-limit", error);
    // En cas d’incident sur la table, on refuse par prudence les actions sensibles.
    return false;
  }
}
