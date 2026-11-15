import "dotenv/config";
import { execSync } from "node:child_process";
import postgres from "postgres";

/**
 * Recrée une base PostgreSQL VIERGE : supprime toutes les tables et données, réapplique
 * les migrations depuis zéro, puis installe uniquement la configuration de base
 * (paramètres du site et catégories de logiciels). Aucune donnée de démonstration.
 *
 *   pnpm db:reset --yes
 *   ADMIN_EMAIL=… ADMIN_PASSWORD=… pnpm db:reset --yes   → crée aussi le premier administrateur
 *
 * Sécurité : refuse de s’exécuter sur une base distante sans ALLOW_REMOTE_RESET=1.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL est requis.");
  const host = new URL(url).hostname;
  const local = ["localhost", "127.0.0.1", "::1", "db", "postgres"].includes(host);
  if (!process.argv.includes("--yes")) {
    console.error(`Cette commande efface TOUTES les données de la base « ${new URL(url).pathname.slice(1)} » sur ${host}.\nRelancez avec --yes pour confirmer.`);
    process.exit(1);
  }
  if (!local && process.env.ALLOW_REMOTE_RESET !== "1") {
    console.error(`Base distante (${host}) : ajoutez ALLOW_REMOTE_RESET=1 pour confirmer l’effacement.`);
    process.exit(1);
  }

  const sql = postgres(url, { max: 1, onnotice: () => {} });
  await sql.unsafe("DROP SCHEMA IF EXISTS drizzle CASCADE; DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
  await sql.end();
  console.log("✔ Base vidée.");

  const run = (cmd: string) => execSync(cmd, { stdio: "inherit", env: { ...process.env, SEED_DEMO: "" } });
  run("pnpm -s db:migrate");
  run("pnpm -s db:seed");
  console.log("✔ Base vierge prête.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
