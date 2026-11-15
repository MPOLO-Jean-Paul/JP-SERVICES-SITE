import "server-only";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "@/env";
import * as schema from "./schema";

/**
 * Pool MySQL partagé (réutilisé entre rechargements en développement et entre
 * invocations serverless lorsque le runtime conserve le module en mémoire).
 */
const globalForDb = globalThis as unknown as { __jpPool?: mysql.Pool };

const pool =
  globalForDb.__jpPool ??
  mysql.createPool({
    uri: env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: env.NODE_ENV === "production" ? 10 : 5,
    maxIdle: 5,
    idleTimeout: 60_000,
    enableKeepAlive: true,
    charset: "utf8mb4_unicode_ci",
    timezone: "Z",
    supportBigNumbers: true,
    decimalNumbers: false,
  });

if (env.NODE_ENV !== "production") globalForDb.__jpPool = pool;

export const db = drizzle(pool, { schema, mode: "default", casing: "snake_case" });
export { schema };
export type Db = typeof db;
