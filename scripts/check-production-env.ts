/**
 * Environment-only production preflight.
 * It never opens a network connection or prints values of credentials.
 * Use before migrations and before accepting real registrations.
 */
const required = [
  "DATABASE_URL",
  "APP_SECRET",
  "SMTP_HOST",
  "SMTP_USERNAME",
  "SMTP_PASSWORD",
  "SMTP_FROM_ADDRESS",
  "S3_ENDPOINT",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
] as const;

const missing = required.filter((key) => !process.env[key]?.trim());
const invalid: string[] = [];

if (process.env.APP_SECRET && process.env.APP_SECRET.length < 32) {
  invalid.push("APP_SECRET (moins de 32 caractères)");
}
if (process.env.STORAGE_DRIVER !== "s3") invalid.push("STORAGE_DRIVER (doit être s3)");
if (process.env.JP_PREVIEW_MODE === "1") invalid.push("JP_PREVIEW_MODE (désactiver pour la production)");

const appUrl = process.env.APP_URL;
try {
  const parsed = new URL(appUrl ?? "");
  if (parsed.protocol !== "https:" || parsed.hostname !== "jp-services.org") {
    invalid.push("APP_URL (https://jp-services.org attendu)");
  }
} catch {
  invalid.push("APP_URL (adresse HTTPS invalide)");
}

const storageUrl = process.env.S3_ENDPOINT;
if (storageUrl && !storageUrl.startsWith("https://")) invalid.push("S3_ENDPOINT (HTTPS requis)");
const fromAddress = process.env.SMTP_FROM_ADDRESS;
if (fromAddress && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fromAddress)) invalid.push("SMTP_FROM_ADDRESS (adresse invalide)");

if (missing.length || invalid.length) {
  console.error(
    "JP-Services : prérequis de production non satisfaits. " +
    [...missing.map((name) => `Manquant : ${name}`), ...invalid.map((s) => `Invalide : ${s}`)].join(" ; "),
  );
  process.exitCode = 1;
} else {
  console.info("✔ Configuration de production : variables indispensables présentes et cohérentes.");
}
