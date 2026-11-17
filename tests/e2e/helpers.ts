import { createHash } from "node:crypto";
import postgres from "postgres";
import type { Page } from "@playwright/test";

export const ADMIN = { email: process.env.E2E_ADMIN_EMAIL ?? "admin@jp-services.test", password: process.env.E2E_ADMIN_PASSWORD ?? "Admin-Demo-2026" };

/** Remplace le code d’activation d’une inscription en attente par un code connu (les e-mails ne sont pas lus en test). */
export async function forceActivationCode(email: string, code = "123456") {
  const sql = postgres(process.env.DATABASE_URL ?? "postgres://jp:jp_dev_password@127.0.0.1:5432/jpservices", { max: 1, onnotice: () => {} });
  await sql`UPDATE temp_users SET token = ${createHash("sha256").update(code).digest("hex")}, date_demande = NOW() WHERE email = ${email}`;
  await sql.end();
  return code;
}

/** Injecte uniquement en CI un code de réinitialisation dans la base éphémère. */
export async function forceResetCode(email: string, code = "654321") {
  const sql = postgres(process.env.DATABASE_URL ?? "postgres://jp:jp_dev_password@127.0.0.1:5432/jpservices", { max: 1, onnotice: () => {} });
  await sql`UPDATE users SET reset_token = ${createHash("sha256").update(code + email).digest("hex")}, reset_expire = NOW() + INTERVAL '20 minutes' WHERE email = ${email}`;
  await sql.end();
  return code;
}

export async function acceptCookies(page: Page) {
  await page.addInitScript(() => localStorage.setItem("jp_consent", JSON.stringify({ analytics: false, at: Date.now() })));
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/connexion");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.locator("#mot_de_passe").fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();
}
