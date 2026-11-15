import "server-only";
import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { env } from "@/env";

/**
 * Limitation de débit persistante en base (fenêtre fixe), utilisable sur serveur
 * classique comme sur plateforme serverless. Retourne `true` si l'action est autorisée.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const hashed = createHash("sha256").update(`${key}:${env.APP_SECRET}`).digest("hex");
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);
  try {
    // Réinitialise le compteur si la fenêtre est expirée, sinon incrémente (atomique côté MySQL).
    await db.execute(sql`
      INSERT INTO rate_limits (\`key\`, \`count\`, window_start) VALUES (${hashed}, 1, ${now})
      ON DUPLICATE KEY UPDATE
        \`count\` = IF(window_start < ${windowStart}, 1, \`count\` + 1),
        window_start = IF(window_start < ${windowStart}, ${now}, window_start)
    `);
    const rows = await db
      .select({ count: schema.rateLimits.count })
      .from(schema.rateLimits)
      .where(sql`\`key\` = ${hashed}`)
      .limit(1);
    const count = rows[0]?.count ?? 0;
    if (Math.random() < 0.02) {
      await db.execute(sql`DELETE FROM rate_limits WHERE window_start < ${new Date(now.getTime() - 86_400_000)}`).catch(() => {});
    }
    return count <= limit;
  } catch (error) {
    console.error("rate-limit", error);
    // En cas d'incident sur la table, on refuse par prudence les actions sensibles.
    return false;
  }
}
