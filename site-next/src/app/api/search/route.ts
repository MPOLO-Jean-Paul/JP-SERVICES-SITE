import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { offerings } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("q") ?? "";
  const query = raw.trim().replace(/\s+/g, " ");
  if (query.length < 2 || query.length > 80) {
    return NextResponse.json(
      { message: "La recherche doit contenir entre 2 et 80 caractères." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const db = getDatabase();
  if (!db) {
    const normalized = query.toLocaleLowerCase("fr");
    const items = offerings.filter(item =>
      [item.title, item.description, item.category, item.detail]
        .join(" ").toLocaleLowerCase("fr").includes(normalized)
    ).slice(0, 12);
    return NextResponse.json({ source: "preview", items }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    // position(...) réalise une recherche littérale sans interpréter %, _, ou des expressions SQL.
    const rows = await db.query(
      "SELECT id::text, slug, type AS kind, category, title, description, coalesce(detail, '') AS detail, coalesce(status, '') AS status FROM public.catalogue_items WHERE published = true AND position(lower($1) in lower(title || ' ' || description || ' ' || category || ' ' || coalesce(detail, ''))) > 0 ORDER BY sort_order ASC, created_at DESC LIMIT 12",
      [query]
    );
    return NextResponse.json({ source: "database", items: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { message: "Recherche momentanément indisponible." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
