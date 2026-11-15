import { NextResponse } from "next/server";
import { contentTypeFor, readUpload } from "@/server/storage";

export const dynamic = "force-dynamic";

/**
 * Médias publics téléversés (images, vidéos des actualités, logos…), lus sur le disque
 * (UPLOAD_DIR) ou dans le bucket S3/R2. Les fichiers de logiciels passent par /telecharger.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  const key = ["uploads", ...parts].join("/");
  if (key.startsWith("uploads/logiciels/")) return new NextResponse("Introuvable", { status: 404 });
  const file = await readUpload(key);
  if (!file) return new NextResponse("Introuvable", { status: 404 });
  return new NextResponse(file.body, {
    headers: {
      "Content-Type": contentTypeFor(key),
      ...(file.size ? { "Content-Length": String(file.size) } : {}),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
