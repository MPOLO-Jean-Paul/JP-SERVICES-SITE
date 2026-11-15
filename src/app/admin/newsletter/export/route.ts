import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return new NextResponse("Accès refusé", { status: 403 });
  const rows = await db.select().from(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.statut, "actif")).orderBy(desc(schema.newsletterSubscribers.dateInscription));
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = ["email;themes;date_inscription", ...rows.map((r) => [esc(r.email), esc(r.themes), esc(r.dateInscription.toISOString())].join(";"))].join("\r\n");
  return new NextResponse("﻿" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="newsletter-jp-services-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
}
