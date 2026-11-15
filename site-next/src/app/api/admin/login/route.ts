import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/lib/db";
import { getSessionCookieOptions, isAdminConfigured, issueSession, SESSION_COOKIE, validSameOrigin, verifyPassword } from "@/lib/admin-auth";
import { apiError, noCache } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
const schema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(8).max(256)
}).strict();

export async function POST(request: NextRequest) {
  if (!validSameOrigin(request)) return apiError("Origine non autorisée.", 403);
  if (!isAdminConfigured()) return apiError("L'administration n'est pas encore configurée.", 503);
  if (!(request.headers.get("content-type") ?? "").startsWith("application/json")) return apiError("Format non accepté.", 415);
  let input: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 1200) return apiError("Requête trop volumineuse.", 413);
    input = JSON.parse(raw);
  } catch { return apiError("Données invalides.", 400); }
  const result = schema.safeParse(input);
  if (!result.success) return apiError("Identifiants incorrects.", 401);
  const db = getDatabase();
  if (!db) return apiError("Base de données indisponible.", 503);

  try {
    const secret = process.env.ADMIN_SESSION_SECRET as string;
    // Limitation partagée entre instances. Le nom de compte est inclus pour freiner les essais ciblés.
    const address = request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const data = new TextEncoder().encode([secret, result.data.username.toLocaleLowerCase(), address.slice(0, 80)].join(":"));
    const raw = await crypto.subtle.digest("SHA-256", data);
    const fingerprint = Array.from(new Uint8Array(raw)).map(c => c.toString(16).padStart(2, "0")).join("");
    const attempts = await db.query(
      "INSERT INTO public.admin_login_limits (fingerprint,window_start,attempts) VALUES ($1,to_timestamp(floor(extract(epoch from now())/900)*900),1) ON CONFLICT (fingerprint,window_start) DO UPDATE SET attempts=public.admin_login_limits.attempts+1 RETURNING attempts",
      [fingerprint]
    );
    if (Number(attempts[0]?.attempts || 0) > 5) return apiError("Trop de tentatives. Réessayez dans quelques minutes.", 429);
  } catch { return apiError("Vérification de sécurité indisponible.", 503); }

  const usernameMatches = result.data.username === process.env.ADMIN_USERNAME?.trim();
  const passwordMatches = await verifyPassword(result.data.password);
  if (!usernameMatches || !passwordMatches) return apiError("Identifiants incorrects.", 401);
  const session = await issueSession();
  if (!session) return apiError("Configuration de sécurité manquante.", 503);
  const response = NextResponse.json({ authenticated: true }, { headers: noCache });
  response.cookies.set(SESSION_COOKIE, session, getSessionCookieOptions());
  return response;
}
