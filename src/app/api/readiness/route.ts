import { NextResponse } from "next/server";
import { GET as checkDatabaseAndSchema } from "../health/route";

export const dynamic = "force-dynamic";

const revision = "readiness-20261116-v2";

/**
 * Independent diagnostic endpoint for distinguishing browser/CDN caching
 * from a server running older code. Preserves the existing readiness result
 * and never returns database credentials, records or operational secrets.
 */
export async function GET() {
  const health = await checkDatabaseAndSchema();
  const result = await health.json();
  return NextResponse.json(
    { ...result, revision },
    {
      status: health.status,
      headers: {
        "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
        "CDN-Cache-Control": "no-store",
        "X-JP-Health-Revision": revision,
      },
    },
  );
}
