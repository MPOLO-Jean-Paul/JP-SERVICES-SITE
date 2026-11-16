import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, schema } from "@/server/db";

export const dynamic = "force-dynamic";
const noCache = { "Cache-Control": "private, no-store, max-age=0" };

/**
 * Readiness probe: a live SQL connection is not sufficient to operate
 * registrations, admin settings or the contact form.
 *
 * No user records, database errors or secrets are returned by this endpoint.
 * Queries are read-only and restricted to three application tables.
 */
export async function GET() {
  const started = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    return NextResponse.json(
      { status: "error", database: "unreachable" },
      { status: 503, headers: noCache },
    );
  }
  try {
    await Promise.all([
      db.select({ cle: schema.siteSettings.cle }).from(schema.siteSettings).limit(1),
      db.select({ id: schema.users.id }).from(schema.users).limit(1),
      db.select({ id: schema.messages.id }).from(schema.messages).limit(1),
    ]);
    return NextResponse.json(
      { status: "ok", database: "ok", schema: "ok", latencyMs: Date.now() - started },
      { headers: noCache },
    );
  } catch {
    return NextResponse.json(
      { status: "error", database: "ok", schema: "unavailable" },
      { status: 503, headers: noCache },
    );
  }
}
