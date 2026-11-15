import { NextRequest, NextResponse } from "next/server";
import { revokeCurrentSession, SESSION_COOKIE, validSameOrigin } from "@/lib/admin-auth";
import { apiError, noCache } from "@/lib/admin-api";

export async function POST(request: NextRequest) {
  if (!validSameOrigin(request)) return apiError("Origine non autorisée.", 403);
  await revokeCurrentSession();
  const response = NextResponse.json({ authenticated: false }, { headers: noCache });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
