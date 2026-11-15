import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "jp-services-next",
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    timestamp: new Date().toISOString()
  }, { headers: { "Cache-Control": "no-store" } });
}
