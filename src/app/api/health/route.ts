import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/** Sonde de santé (Render, Docker, supervision) : vérifie l’accès à la base. */
export async function GET() {
  const started = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ status: "ok", database: "ok", latencyMs: Date.now() - started }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "error", database: "unreachable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
