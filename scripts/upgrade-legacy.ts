import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

/**
 * Mise à niveau d’une base de production JP-Services existante (ancienne version PHP)
 * vers le schéma Next.js — SANS supprimer ni modifier les données existantes :
 *
 *  1. ajoute les colonnes manquantes (google_id, auth_provider, themes…) si besoin ;
 *  2. crée les nouvelles tables (sessions, rate_limits, audit_log) et celles de l’extension
 *     2026-08 si elles n’existent pas encore ;
 *  3. inscrit la migration initiale comme « déjà appliquée » pour que `pnpm db:migrate`
 *     n’exécute ensuite que les migrations futures.
 *
 * Usage : faire une sauvegarde complète, puis `pnpm db:upgrade-legacy`.
 */
async function columnExists(c: mysql.Connection, table: string, column: string) {
  const [rows] = await c.query("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?", [table, column]);
  return (rows as unknown[]).length > 0;
}
async function tableExists(c: mysql.Connection, table: string) {
  const [rows] = await c.query("SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?", [table]);
  return (rows as unknown[]).length > 0;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL est requis.");
  const c = await mysql.createConnection({ uri: url, multipleStatements: true });
  if (!(await tableExists(c, "users"))) {
    console.log("Base vide : utilisez plutôt `pnpm db:migrate` pour une installation neuve.");
    await c.end();
    return;
  }
  const steps: Array<[string, () => Promise<boolean>, string]> = [
    ["users.google_id", async () => !(await columnExists(c, "users", "google_id")), "ALTER TABLE `users` ADD COLUMN `google_id` VARCHAR(64) NULL AFTER `mot_de_passe`, ADD UNIQUE KEY `uq_users_google_id` (`google_id`)"],
    ["users.auth_provider", async () => !(await columnExists(c, "users", "auth_provider")), "ALTER TABLE `users` ADD COLUMN `auth_provider` VARCHAR(20) NOT NULL DEFAULT 'local' AFTER `google_id`"],
    ["newsletter_subscribers.themes", async () => (await tableExists(c, "newsletter_subscribers")) && !(await columnExists(c, "newsletter_subscribers", "themes")), "ALTER TABLE `newsletter_subscribers` ADD COLUMN `themes` VARCHAR(255) NOT NULL DEFAULT 'formations,formations_en_ligne,logiciels,actualites,offres' AFTER `statut`, MODIFY `statut` VARCHAR(20) NOT NULL DEFAULT 'actif'"],
  ];
  for (const [label, needed, statement] of steps) {
    if (await needed()) {
      await c.query(statement);
      console.log("✔ ajouté :", label);
    } else console.log("• déjà présent :", label);
  }

  // Tables : on reprend les CREATE TABLE de la migration initiale en « IF NOT EXISTS ».
  const migrationPath = path.join(process.cwd(), "drizzle", "0000_initial_schema.sql");
  const migration = await readFile(migrationPath, "utf8");
  const statements = migration.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean);
  for (const st of statements) {
    if (st.startsWith("CREATE TABLE")) {
      const name = /CREATE TABLE `([^`]+)`/.exec(st)?.[1];
      if (name && !(await tableExists(c, name))) {
        await c.query(st.replace("CREATE TABLE", "CREATE TABLE IF NOT EXISTS"));
        console.log("✔ table créée :", name);
      }
    }
  }
  // Clés étrangères des nouvelles tables uniquement (les tables historiques ont déjà les leurs).
  for (const st of statements.filter((s) => s.startsWith("ALTER TABLE `sessions`"))) {
    try { await c.query(st); } catch { /* déjà présente */ }
  }

  // Marque la migration initiale comme appliquée.
  await c.query("CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (`id` SERIAL PRIMARY KEY, `hash` TEXT NOT NULL, `created_at` BIGINT)");
  const journal = JSON.parse(await readFile(path.join(process.cwd(), "drizzle", "meta", "_journal.json"), "utf8")) as { entries: Array<{ tag: string; when: number }> };
  const first = journal.entries[0]!;
  const hash = createHash("sha256").update(migration).digest("hex");
  const [existing] = await c.query("SELECT 1 FROM `__drizzle_migrations` WHERE `hash` = ?", [hash]);
  if (!(existing as unknown[]).length) {
    await c.query("INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) VALUES (?, ?)", [hash, first.when]);
    console.log("✔ migration initiale marquée comme appliquée");
  }
  await c.end();
  console.log("✔ Base existante prête pour JP-Services (Next.js).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
