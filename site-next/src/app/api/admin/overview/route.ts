import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { noCache, apiError, requireAdminResponse } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const blocked = await requireAdminResponse();
  if (blocked) return blocked;
  const db = getDatabase();
  if (!db) return apiError("Base de données indisponible.", 503);
  try {
    const [stats, messages] = await Promise.all([
      db.query<{total: number; published: number; drafts: number}>(
        "SELECT count(*)::int AS total, count(*) FILTER (WHERE published)::int AS published, count(*) FILTER (WHERE NOT published)::int AS drafts FROM public.catalogue_items"
      ),
      db.query<{total: number; unread: number}>(
        "SELECT count(*)::int AS total, count(*) FILTER (WHERE read_at IS NULL)::int AS unread FROM public.contact_messages"
      )
    ]);
    return NextResponse.json({ catalogue: stats[0], inbox: messages[0] }, { headers: noCache });
  } catch {
    return apiError("Informations administratives indisponibles.", 503);
  }
}
