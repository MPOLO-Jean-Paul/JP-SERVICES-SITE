import "dotenv/config";
import mysql from "mysql2/promise";
import postgres from "postgres";

/**
 * Import des données de l’ancienne base MySQL de JP-Services vers PostgreSQL.
 *
 *   MYSQL_URL=mysql://user:pass@hote:3306/ancienne_base \
 *   DATABASE_URL=postgres://…/jpservices \
 *   pnpm db:import-mysql
 *
 * - Exécuter d’abord `pnpm db:migrate` sur la base PostgreSQL (tables vides).
 * - Les identifiants sont conservés : liens, inscriptions et commentaires restent cohérents.
 * - Les colonnes inconnues sont ignorées, les dates invalides (0000-00-00) deviennent nulles
 *   ou la date du jour pour les colonnes obligatoires.
 * - Une ligne refusée (doublon, référence orpheline) est signalée puis ignorée.
 * - Relançable : les lignes déjà présentes sont ignorées.
 */
const TABLES = [
  "users", "temp_users", "formations", "actualites", "produits", "equipe", "messages", "support_tickets", "newsletter_subscribers",
  "logiciel_categories", "logiciels", "partenaires", "partenariat_demandes", "site_settings",
  "posts", "comments", "likes", "projets", "inscriptions", "abonnements", "planning_valide", "notifications", "notifications_lues", "live_sessions",
];

type PgColumn = { column_name: string; data_type: string; is_nullable: "YES" | "NO"; column_default: string | null };

function normalize(value: unknown, col: PgColumn): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const type = col.data_type;
  if (type.startsWith("timestamp") || type === "date") {
    const d = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(d.getTime()) || d.getFullYear() < 1900) return col.is_nullable === "YES" ? null : new Date();
    return type === "date" ? d.toISOString().slice(0, 10) : d;
  }
  if (Buffer.isBuffer(value)) return value.toString("utf8");
  if (type === "smallint" || type === "integer" || type === "bigint") return Number(value);
  return value;
}

async function main() {
  const mysqlUrl = process.env.MYSQL_URL;
  const pgUrl = process.env.DATABASE_URL;
  if (!mysqlUrl || !pgUrl) throw new Error("MYSQL_URL (source) et DATABASE_URL (PostgreSQL) sont requis.");
  const source = await mysql.createConnection({ uri: mysqlUrl, dateStrings: false, charset: "utf8mb4" });
  const target = postgres(pgUrl, { max: 1, onnotice: () => {} });
  const report: Array<[string, number, number, number]> = [];

  for (const table of TABLES) {
    const [exists] = await source.query("SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?", [table]);
    if (!(exists as unknown[]).length) {
      report.push([table, 0, 0, 0]);
      continue;
    }
    const columns = (await target`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${table}`) as unknown as PgColumn[];
    const byName = new Map(columns.map((c) => [c.column_name, c]));
    const [rows] = await source.query(`SELECT * FROM \`${table}\``);
    const list = rows as Array<Record<string, unknown>>;
    let inserted = 0;
    let skipped = 0;
    for (const row of list) {
      const record: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(row)) {
        const col = byName.get(k);
        if (!col) continue;
        const value = normalize(v, col);
        if (value === null && col.is_nullable === "NO") continue; // laisse la valeur par défaut
        record[k] = value;
      }
      try {
        const res = await target`INSERT INTO ${target(table)} ${target(record as Record<string, postgres.ParameterOrJSON<never>>)} ON CONFLICT DO NOTHING`;
        if (res.count) inserted++;
        else skipped++;
      } catch (error) {
        skipped++;
        console.warn(`  ! ${table} : ligne ignorée (${(error as Error).message.split("\n")[0]})`);
      }
    }
    report.push([table, list.length, inserted, skipped]);
    // Les identifiants importés ne doivent pas entrer en conflit avec les prochaines insertions.
    if (byName.has("id")) {
      await target.unsafe(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), (SELECT COALESCE(MAX(id), 1) FROM "${table}"))`);
    }
  }

  await source.end();
  await target.end();
  console.log("\nTable                    lues   importées  ignorées");
  for (const [t, r, i, s] of report) console.log(`${t.padEnd(24)} ${String(r).padStart(5)} ${String(i).padStart(10)} ${String(s).padStart(9)}`);
  console.log("\n✔ Import terminé. Les mots de passe existants restent valides (bcrypt).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
