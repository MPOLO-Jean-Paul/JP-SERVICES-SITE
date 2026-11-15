import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { audit } from "@/server/services/admin";
import type { FormState } from "@/server/actions/contact";

export async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/connexion?redirect_to=/admin");
  return user;
}

export const str = (fd: FormData, k: string, max = 10_000) => String(fd.get(k) ?? "").trim().slice(0, max);
export const num = (fd: FormData, k: string, fallback = 0) => { const n = Number(fd.get(k)); return Number.isFinite(n) ? n : fallback; };
export const bool = (fd: FormData, k: string) => fd.get(k) === "1" || fd.get(k) === "on";
export const fileOrNull = (fd: FormData, k: string) => { const f = fd.get(k); return f instanceof File && f.size > 0 ? f : null; };
export const fail = (message: string, fd?: FormData): FormState => ({ status: "error", message, values: fd ? Object.fromEntries(Array.from(fd.entries()).filter(([, v]) => typeof v === "string").map(([k, v]) => [k, String(v)])) : undefined });
export const ok = (message: string): FormState => ({ status: "success", message });
export { audit };
