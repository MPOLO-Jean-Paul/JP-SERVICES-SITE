import { createHash } from "node:crypto";
import mysql from "mysql2/promise";
import type { Page } from "@playwright/test";

export const ADMIN = { email: process.env.E2E_ADMIN_EMAIL ?? "admin@jp-services.test", password: process.env.E2E_ADMIN_PASSWORD ?? "Admin-Demo-2026" };

export async function dbConnection() {
  return mysql.createConnection({ uri: process.env.DATABASE_URL ?? "mysql://jp:jp_dev_password@127.0.0.1:3306/jpservices" });
}

/** Remplace le code d’activation d’une inscription en attente par un code connu (les e-mails ne sont pas lus en test). */
export async function forceActivationCode(email: string, code = "123456") {
  const conn = await dbConnection();
  await conn.execute("UPDATE temp_users SET token = ?, date_demande = NOW() WHERE email = ?", [createHash("sha256").update(code).digest("hex"), email]);
  await conn.end();
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
