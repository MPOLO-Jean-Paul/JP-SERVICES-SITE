import { NextResponse } from "next/server";
import { searchSite } from "@/server/services/content";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });
  try {
    const results = await searchSite(q, 5);
    return NextResponse.json({ results }, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch (error) {
    console.error("recherche", error);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
