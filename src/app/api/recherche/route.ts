import { NextResponse } from "next/server";
import { searchSite } from "@/server/services/content";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });
  if (q.length > 100) return NextResponse.json({ results: [], error: "invalid_query" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  try {
    const results = await searchSite(q, 5);
    return NextResponse.json({ results }, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch (error) {
    console.error("recherche", error);
    return NextResponse.json({ results: [], error: "temporarily_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
