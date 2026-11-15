import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { env } from "@/env";

export const SESSION_COOKIE = "jp_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 jours glissants
const ROTATE_AFTER_MS = 1000 * 60 * 60 * 24; // prolonge la session au plus une fois par jour

export type SessionUser = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  photoProfil: string;
  authProvider: string;
  displayName: string;
  isAdmin: boolean;
};

function hashToken(token: string) {
  return createHash("sha256").update(token + env.APP_SECRET).digest("hex");
}

async function requestMeta() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : h.get("x-real-ip")) ?? "";
  return { ip: ip.trim().slice(0, 45), userAgent: (h.get("user-agent") ?? "").slice(0, 255) };
}

/** Crée une session serveur et dépose le cookie HttpOnly. */
export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const meta = await requestMeta();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(schema.sessions).values({ id: hashToken(token), userId, userAgent: meta.userAgent, ipAddress: meta.ip, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  // Nettoyage opportuniste des sessions expirées.
  if (Math.random() < 0.05) await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date())).catch(() => {});
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token))).catch(() => {});
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: number) {
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}

/** Utilisateur courant (mis en cache pour la durée de la requête). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const id = hashToken(token);
  const rows = await db
    .select({
      sid: schema.sessions.id,
      lastSeenAt: schema.sessions.lastSeenAt,
      user: {
        id: schema.users.id,
        nom: schema.users.nom,
        prenom: schema.users.prenom,
        email: schema.users.email,
        role: schema.users.role,
        photoProfil: schema.users.photoProfil,
        authProvider: schema.users.authProvider,
        isActive: schema.users.isActive,
      },
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.id, id), gt(schema.sessions.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row || row.user.isActive !== 1) return null;
  if (Date.now() - row.lastSeenAt.getTime() > ROTATE_AFTER_MS) {
    await db
      .update(schema.sessions)
      .set({ lastSeenAt: new Date(), expiresAt: new Date(Date.now() + SESSION_TTL_MS) })
      .where(eq(schema.sessions.id, id))
      .catch(() => {});
  }
  const u = row.user;
  const displayName = `${u.prenom} ${u.nom}`.trim() || u.email.split("@")[0] || "Membre";
  return { ...u, displayName, isAdmin: u.role === "admin" };
});

export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const target = returnTo ? `/connexion?redirect_to=${encodeURIComponent(returnTo)}` : "/connexion";
    redirect(target);
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?redirect_to=/admin");
  if (!user.isAdmin) redirect("/?acces=refuse");
  return user;
}

export async function clientIp(): Promise<string> {
  return (await requestMeta()).ip || "unknown";
}
