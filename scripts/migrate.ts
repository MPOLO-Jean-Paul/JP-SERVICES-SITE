import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../src/server/db/schema";
import { ensureFirstAdmin } from "./first-admin";

/** Applique les migrations SQL du dossier ./drizzle (idempotent). */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL est requis.");
  const client = postgres(url, { max: 1, onnotice: () => {} });
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log("✔ Migrations appliquées.");
  // Premier administrateur sans console Shell (voir scripts/first-admin.ts).
  await ensureFirstAdmin(drizzle(client, { schema })).catch((e) => console.warn("⚠ Création de l’administrateur impossible :", e instanceof Error ? e.message : e));
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
