import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(20).max(5000),
  website: z.string().max(200).optional().default("")
}).strict();

const jsonError = (message: string, status: number) =>
  NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const expected = [request.nextUrl.origin, process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean);
  if (!origin || !expected.includes(origin)) {
    return jsonError("Origine de la requête non autorisée.", 403);
  }
  if (!(request.headers.get("content-type") || "").startsWith("application/json")) {
    return jsonError("Format de demande invalide.", 415);
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 10000) return jsonError("Message trop volumineux.", 413);
  let input: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 10000) return jsonError("Message trop volumineux.", 413);
    input = JSON.parse(raw);
  } catch {
    return jsonError("Données invalides.", 400);
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return jsonError("Vérifiez les champs obligatoires et la longueur de votre message.", 422);
  if (parsed.data.website) return NextResponse.json({ message: "Message enregistré." }, {status:200});

  const db = getDatabase();
  if (!db) return jsonError("Le formulaire est momentanément indisponible. Utilisez l'adresse e-mail indiquée sur cette page.", 503);

  try {
    // Limitation persistante, partagée entre Render et Workers.
    const salt = process.env.CONTACT_RATE_LIMIT_SALT;
    if (!salt || salt.length < 24) return jsonError("Le formulaire n'est pas encore configuré.", 503);
    const encoded = new TextEncoder().encode(salt + ":" + parsed.data.email.toLowerCase());
    const hash = await crypto.subtle.digest("SHA-256", encoded);
    const fingerprint = Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, "0")).join("");
    const counted = await db.query(
      "INSERT INTO public.contact_rate_limits (fingerprint, window_start, attempts) VALUES ($1, date_trunc('hour', now()), 1) ON CONFLICT (fingerprint, window_start) DO UPDATE SET attempts = contact_rate_limits.attempts + 1 RETURNING attempts",
      [fingerprint]
    );
    if (Number(counted[0]?.attempts || 0) > 5) return jsonError("Trop de demandes. Réessayez plus tard.", 429);
    await db.query(
      "INSERT INTO public.contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)",
      [parsed.data.name, parsed.data.email, parsed.data.subject, parsed.data.message]
    );
    return NextResponse.json({ message: "Votre message a été enregistré. Notre équipe pourra le consulter." }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError("Enregistrement impossible pour le moment. Vous pouvez nous écrire par e-mail.", 503);
  }
}
