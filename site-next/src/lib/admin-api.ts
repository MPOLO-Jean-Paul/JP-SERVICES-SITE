import { NextResponse } from "next/server";
import { isAdminConfigured, isAuthenticated, validSameOrigin } from "@/lib/admin-auth";

export const noCache = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export function apiError(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: noCache });
}

export async function requireAdminResponse(request?: Request): Promise<NextResponse | null> {
  if (!isAdminConfigured()) return apiError("L'administration n'est pas encore configurée.", 503);
  if (request && !validSameOrigin(request)) return apiError("Origine non autorisée.", 403);
  if (!(await isAuthenticated())) return apiError("Connexion administrateur requise.", 401);
  return null;
}
