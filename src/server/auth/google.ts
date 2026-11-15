import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "@/env";

const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export type GoogleIdentity = { sub: string; email: string; emailVerified: boolean; givenName: string; familyName: string; picture: string };

export function googleIsConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
}

/** Vérifie un ID token Google Identity Services (signature, émetteur, audience, expiration, domaine autorisé). */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity | null> {
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  try {
    const { payload } = await jwtVerify(idToken, JWKS, { issuer: ["https://accounts.google.com", "accounts.google.com"], audience: clientId, clockTolerance: 60 });
    const email = String(payload.email ?? "").toLowerCase();
    const verified = payload.email_verified === true || payload.email_verified === "true";
    if (!email || !verified) return null;
    if (env.GOOGLE_ALLOWED_HOSTED_DOMAIN && payload.hd !== env.GOOGLE_ALLOWED_HOSTED_DOMAIN) return null;
    return {
      sub: String(payload.sub),
      email,
      emailVerified: verified,
      givenName: String(payload.given_name ?? ""),
      familyName: String(payload.family_name ?? ""),
      picture: String(payload.picture ?? ""),
    };
  } catch {
    return null;
  }
}
