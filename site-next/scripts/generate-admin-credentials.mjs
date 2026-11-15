#!/usr/bin/env node
// Usage: node scripts/generate-admin-credentials.mjs <identifiant>
// Génère des valeurs à stocker UNIQUEMENT dans le coffre de secrets de l'hébergeur.
// La sortie contient un mot de passe : ne pas la copier dans un ticket ou un dépôt Git.
import { pbkdf2Sync, randomBytes } from "node:crypto";

const username = process.argv[2]?.trim();
if (!username || !/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
  console.error("Usage: node scripts/generate-admin-credentials.mjs <identifiant-3-a-50-caracteres>");
  process.exit(1);
}

const rounds = 240000;
const password = randomBytes(30).toString("base64url");
const salt = randomBytes(24);
const hash = pbkdf2Sync(password, salt, rounds, 32, "sha256").toString("hex");
const sessionSecret = randomBytes(48).toString("base64url");

process.stdout.write([
  "Conservez ce mot de passe dans un gestionnaire sécurisé :",
  "ADMIN_LOGIN_PASSWORD=" + password,
  "",
  "Variables à copier UNIQUEMENT dans les secrets de l'hébergement :",
  "ADMIN_USERNAME=" + username,
  "ADMIN_PASSWORD_HASH=pbkdf2-sha256$" + rounds + "$" + salt.toString("hex") + "$" + hash,
  "ADMIN_SESSION_SECRET=" + sessionSecret,
  "",
  "Ne définissez PAS ADMIN_LOGIN_PASSWORD sur le serveur : seule l'empreinte est requise.",
  "Le tableau de bord exige également DATABASE_URL et la migration db/002_admin.sql.",
  ""
].join("\n"));
