import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

/**
 * Applique les migrations SQL du dossier ./drizzle (idempotent : la table
 * __drizzle_migrations mémorise celles déjà exécutées).
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL est requis.");
  const connection = await mysql.createConnection({ uri: url, multipleStatements: true });
  const db = drizzle(connection);
  await migrate(db, { migrationsFolder: "./drizzle" });
  await connection.end();
  console.log("✔ Migrations appliquées.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
