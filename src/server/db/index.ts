import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Accès PostgreSQL.
 * - Node.js (Render, Docker) : un pool partagé par le processus.
 * - Cloudflare Workers : une connexion par requête via Hyperdrive (les sockets ne peuvent
 *   pas être partagés entre requêtes dans un Worker), créée à la demande.
 */
type Database = PostgresJsDatabase<typeof schema>;
const isWorker = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

const globalForDb = globalThis as unknown as { __jpDb?: Database };

function nodeDatabase(): Database {
  if (globalForDb.__jpDb) return globalForDb.__jpDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL n’est pas défini.");
  const client = postgres(url, {
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idle_timeout: 30,
    connect_timeout: 15,
    prepare: !/pgbouncer=true|\.pooler\.|-pooler\./.test(url),
    onnotice: () => {},
  });
  globalForDb.__jpDb = drizzle(client, { schema });
  return globalForDb.__jpDb;
}

const perRequest = new WeakMap<object, Database>();
function workerDatabase(): Database {
  // Import différé : le module n’existe que dans le build Cloudflare.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getCloudflareContext } = require("@opennextjs/cloudflare") as typeof import("@opennextjs/cloudflare");
  const { env, ctx } = getCloudflareContext();
  const existing = perRequest.get(ctx);
  if (existing) return existing;
  const url = (env as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE?.connectionString ?? process.env.DATABASE_URL;
  if (!url) throw new Error("Ni HYPERDRIVE ni DATABASE_URL ne sont configurés.");
  const client = postgres(url, { max: 5, fetch_types: false, prepare: true, onnotice: () => {} });
  const database = drizzle(client, { schema });
  perRequest.set(ctx, database);
  ctx.waitUntil(new Promise((resolve) => setTimeout(resolve, 30_000)).then(() => client.end({ timeout: 5 })).catch(() => {}));
  return database;
}

function current(): Database {
  return isWorker ? workerDatabase() : nodeDatabase();
}

/** Proxy : le code applicatif utilise `db` sans se soucier de l’environnement d’exécution. */
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const target = current();
    const value = Reflect.get(target as object, prop, target);
    return typeof value === "function" ? value.bind(target) : value;
  },
});
export { schema };
export type Db = Database;
