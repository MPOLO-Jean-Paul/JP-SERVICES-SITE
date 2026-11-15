import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError, noCache, requireAdminResponse } from "@/lib/admin-api";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const blocked = await requireAdminResponse();
  if (blocked) return blocked;
  const db = getDatabase();
  if (!db) return apiError("Base de données indisponible.", 503);
  try {
    const items = await db.query(
      "SELECT id::text, name, email, subject, message, created_at, read_at FROM public.contact_messages ORDER BY created_at DESC LIMIT 100"
    );
    return NextResponse.json({ items }, { headers: noCache });
  } catch { return apiError("Messagerie indisponible.", 503); }
}

export async function PATCH(request: NextRequest) {
  const blocked = await requireAdminResponse(request);
  if (blocked) return blocked;
  if (!(request.headers.get("content-type") || "").startsWith("application/json")) return apiError("Format invalide.", 415);
  let input: unknown;
  try {
    if (Number(request.headers.get("content-length") || 0) > 300) return apiError("Requête trop volumineuse.", 413);
    input = await request.json();
  } catch { return apiError("Données invalides.", 400); }
  const data = z.object({ id: z.uuid(), read: z.boolean() }).strict().safeParse(input);
  if (!data.success) return apiError("Données invalides.", 422);
  const db = getDatabase();
  if (!db) return apiError("Base de données indisponible.", 503);
  try {
    const rows = await db.query(
      "UPDATE public.contact_messages SET read_at = CASE WHEN $1 THEN now() ELSE NULL END WHERE id=$2::uuid RETURNING id::text",
      [data.data.read, data.data.id]
    );
    if (!rows[0]) return apiError("Message introuvable.", 404);
    return NextResponse.json({ saved: true }, { headers: noCache });
  } catch { return apiError("Modification impossible.", 503); }
}
