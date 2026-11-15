import { cookies } from "next/headers";

export const SESSION_COOKIE = "jp_services_admin";
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length > 4096) return null;
  try {
    const raw = atob(value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "="));
    return Uint8Array.from(raw, char => char.charCodeAt(0));
  } catch {
    return null;
  }
}
function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) return null;
  return Uint8Array.from({ length: hex.length / 2 }, (_, index) => parseInt(hex.slice(index * 2, index * 2 + 2), 16));
}
async function getKey(): Promise<CryptoKey | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL &&
    process.env.ADMIN_USERNAME?.trim() &&
    process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32 &&
    process.env.ADMIN_PASSWORD_HASH &&
    /^pbkdf2-sha256\$(\d+)\$[0-9a-f]{32,128}\$[0-9a-f]{64}$/i.test(process.env.ADMIN_PASSWORD_HASH)
  );
}

export async function verifyPassword(password: string): Promise<boolean> {
  const spec = process.env.ADMIN_PASSWORD_HASH || "";
  const match = /^pbkdf2-sha256\$(\d+)\$([0-9a-f]{32,128})\$([0-9a-f]{64})$/i.exec(spec);
  if (!match || password.length < 8 || password.length > 256) return false;
  const rounds = Number(match[1]);
  if (!Number.isSafeInteger(rounds) || rounds < 150000 || rounds > 500000) return false;
  const salt = hexToBytes(match[2]), expected = hexToBytes(match[3]);
  if (!salt || !expected) return false;
  const passwordKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const raw = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: Uint8Array.from(salt), iterations: rounds, hash: "SHA-256" }, passwordKey, 256);
  const actual = new Uint8Array(raw);
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

export async function issueSession(): Promise<string | null> {
  const key = await getKey();
  const username = process.env.ADMIN_USERNAME?.trim();
  if (!key || !username) return null;
  const payload = toBase64Url(encoder.encode(JSON.stringify({
    sub: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
    ver: 1
  })));
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
  return payload + "." + toBase64Url(signature);
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token || token.length > 1800 || !isAdminConfigured()) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const bytes = fromBase64Url(parts[0]), signature = fromBase64Url(parts[1]);
  const key = await getKey();
  if (!bytes || !signature || !key || signature.length !== 32) return false;
  const valid = await crypto.subtle.verify("HMAC", key, Uint8Array.from(signature), encoder.encode(parts[0]));
  if (!valid) return false;
  try {
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!payload || typeof payload !== "object") return false;
    const value = payload as { sub?: unknown; exp?: unknown; ver?: unknown };
    const now = Math.floor(Date.now() / 1000);
    return value.ver === 1 && value.sub === process.env.ADMIN_USERNAME?.trim() &&
      typeof value.exp === "number" && Number.isInteger(value.exp) && value.exp > now && value.exp <= now + SESSION_SECONDS;
  } catch { return false; }
}

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

export function getSessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/", maxAge: SESSION_SECONDS };
}

export function validSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = [new URL(request.url).origin, process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean);
  return allowed.includes(origin);
}
