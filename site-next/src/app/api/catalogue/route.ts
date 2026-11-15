import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { offerings, type Kind } from "@/lib/content";

export const dynamic = "force-dynamic";
const kinds: Kind[] = ["service", "formation", "logiciel", "projet", "actualite"];

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind");
  if (!kind || !kinds.includes(kind as Kind)) {
    return NextResponse.json({ message: "Catégorie inconnue." }, { status: 400 });
  }
  const db = getDatabase();
  if (!db) {
    return NextResponse.json({ source: "preview", items: offerings.filter(item => item.kind === kind) }, {headers:{"Cache-Control":"no-store"}});
  }
  try {
    const rows = await db.query(
      "SELECT id::text, type AS kind, category, title, description, coalesce(detail, '') AS detail, coalesce(status, '') AS status FROM public.catalogue_items WHERE published = true AND type = $1 ORDER BY sort_order ASC, created_at DESC LIMIT 48",
      [kind]
    );
    return NextResponse.json({ source: "database", items: rows }, {headers:{"Cache-Control":"public, max-age=15, s-maxage=30"}});
  } catch {
    return NextResponse.json({ message: "Catalogue temporairement indisponible." }, {status:503});
  }
}
