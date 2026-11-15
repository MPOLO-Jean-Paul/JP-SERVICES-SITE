import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { readUploadStream } from "@/server/storage";

export const dynamic = "force-dynamic";

/** Téléchargement contrôlé : incrémente le compteur, puis diffuse le fichier hébergé ou redirige vers le lien externe. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.redirect(new URL("/logiciels", process.env.APP_URL ?? "http://localhost:3000"), 302);
  const logiciel = (await db.select().from(schema.logiciels).where(eq(schema.logiciels.id, id)).limit(1))[0];
  if (!logiciel || logiciel.statut !== "publie") return new NextResponse("Ce logiciel est introuvable.", { status: 404 });
  await db.update(schema.logiciels).set({ telechargements: sql`telechargements + 1` }).where(eq(schema.logiciels.id, id)).catch(() => {});
  const fichier = logiciel.fichier.trim();
  if (fichier) {
    const stream = await readUploadStream(fichier);
    if (!stream) return new NextResponse("Le fichier de ce logiciel est indisponible.", { status: 404 });
    const ext = fichier.split(".").pop() ?? "bin";
    const base = logiciel.nom.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "logiciel";
    const version = logiciel.version ? "-" + logiciel.version.replace(/[^a-z0-9.\-]+/gi, "") : "";
    return new NextResponse(stream.body as BodyInit, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${base}${version}.${ext}"`,
        ...(stream.size ? { "Content-Length": String(stream.size) } : {}),
        "Cache-Control": "private, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  const lien = logiciel.lienExterne.trim();
  if (/^https?:\/\//i.test(lien)) return NextResponse.redirect(lien, 303);
  return new NextResponse("Aucun fichier n’est associé à ce logiciel.", { status: 404 });
}
