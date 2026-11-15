import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Variables d'environnement validées au démarrage.
 * Toute valeur manquante ou invalide fait échouer le build : jamais de secret « deviné ».
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    APP_URL: z.string().url().default("http://localhost:3000"),
    APP_SECRET: z.string().min(32, "APP_SECRET doit contenir au moins 32 caractères aléatoires."),
    APP_TIMEZONE: z.string().default("Africa/Lubumbashi"),
    // Obligatoire sur Render / Docker ; facultatif sur Cloudflare si la liaison HYPERDRIVE est configurée.
    DATABASE_URL: z.string().min(1).optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z
      .string()
      .optional()
      .transform((v) => v === "true" || v === "1"),
    SMTP_USERNAME: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM_ADDRESS: z.string().email().optional(),
    SMTP_FROM_NAME: z.string().default("JP-Services"),
    ADMIN_NOTIFICATION_EMAIL: z.string().email().optional(),
    GOOGLE_ALLOWED_HOSTED_DOMAIN: z.string().optional(),
    STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
    S3_ENDPOINT: z.string().optional(),
    S3_REGION: z.string().default("auto"),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_URL: z.string().optional(),
    INDEXNOW_KEY: z.string().optional(),
    GOOGLE_SITE_VERIFICATION: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    APP_SECRET: process.env.APP_SECRET,
    APP_TIMEZONE: process.env.APP_TIMEZONE,
    DATABASE_URL: process.env.DATABASE_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USERNAME: process.env.SMTP_USERNAME,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM_ADDRESS: process.env.SMTP_FROM_ADDRESS,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL,
    GOOGLE_ALLOWED_HOSTED_DOMAIN: process.env.GOOGLE_ALLOWED_HOSTED_DOMAIN,
    STORAGE_DRIVER: process.env.STORAGE_DRIVER,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_REGION: process.env.S3_REGION,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_PUBLIC_URL: process.env.S3_PUBLIC_URL,
    INDEXNOW_KEY: process.env.INDEXNOW_KEY,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
