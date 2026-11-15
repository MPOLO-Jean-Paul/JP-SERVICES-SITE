import type { Metadata } from "next";
import { sql } from "drizzle-orm";
import { stat, mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { CheckCircle2, CircleAlert, XCircle } from "lucide-react";
import { AdminPage, Panel } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { db } from "@/server/db";
import { smtpConfigurationError } from "@/server/mail/mailer";
import { testSmtpAction } from "@/server/actions/admin/content";
import { env } from "@/env";
import { googleIsConfigured } from "@/server/auth/google";

export const metadata: Metadata = { title: "Santé du système" };
type Check = { label: string; status: "ok" | "warn" | "error"; detail: string };

async function runChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  const t0 = Date.now();
  try {
    const [rows] = (await db.execute(sql`SELECT VERSION() AS v`)) as unknown as [Array<{ v: string }>];
    checks.push({ label: "Base de données", status: "ok", detail: `Connectée (${rows[0]?.v ?? "MySQL"}) en ${Date.now() - t0} ms.` });
  } catch (e) {
    checks.push({ label: "Base de données", status: "error", detail: e instanceof Error ? e.message : "Connexion impossible." });
  }
  try {
    const [rows] = (await db.execute(sql`SELECT COUNT(*) AS c FROM __drizzle_migrations`)) as unknown as [Array<{ c: number }>];
    checks.push({ label: "Migrations", status: "ok", detail: `${rows[0]?.c ?? 0} migration(s) appliquée(s).` });
  } catch {
    checks.push({ label: "Migrations", status: "warn", detail: "Table de suivi absente : exécutez « pnpm db:migrate »." });
  }
  const smtp = smtpConfigurationError();
  checks.push({ label: "E-mails (SMTP)", status: smtp ? "warn" : "ok", detail: smtp ?? `Configuré via ${env.SMTP_HOST}:${env.SMTP_PORT}.` });
  checks.push({ label: "Connexion Google", status: googleIsConfigured() ? "ok" : "warn", detail: googleIsConfigured() ? "ID client configuré." : "NEXT_PUBLIC_GOOGLE_CLIENT_ID non défini : bouton Google masqué." });
  if (env.STORAGE_DRIVER === "s3") {
    checks.push({ label: "Stockage des fichiers", status: env.S3_BUCKET && env.S3_PUBLIC_URL ? "ok" : "error", detail: env.S3_BUCKET ? `Bucket « ${env.S3_BUCKET} »` : "S3_BUCKET manquant." });
  } else {
    try {
      const dir = path.join(process.cwd(), "public", "uploads");
      await mkdir(dir, { recursive: true });
      const probe = path.join(dir, `.probe-${Date.now()}`);
      await writeFile(probe, "ok");
      await unlink(probe);
      await stat(dir);
      checks.push({ label: "Stockage des fichiers", status: "ok", detail: "Dossier public/uploads accessible en écriture." });
    } catch {
      checks.push({ label: "Stockage des fichiers", status: "error", detail: "public/uploads n’est pas accessible en écriture (utilisez STORAGE_DRIVER=s3 sur une plateforme serverless)." });
    }
  }
  checks.push({ label: "URL canonique", status: env.APP_URL.startsWith("https://") || env.NODE_ENV !== "production" ? "ok" : "warn", detail: env.APP_URL });
  checks.push({ label: "Environnement", status: "ok", detail: `${env.NODE_ENV} · Node ${process.version} · fuseau ${env.APP_TIMEZONE}` });
  return checks;
}

const ICON = { ok: <CheckCircle2 className="size-5 text-emerald-600" />, warn: <CircleAlert className="size-5 text-amber-600" />, error: <XCircle className="size-5 text-red-600" /> };

export default async function SantePage() {
  const checks = await runChecks();
  return (
    <AdminPage title="Santé du système" text="Diagnostic de la configuration de production. Aucune donnée sensible n’est affichée.">
      <Panel>
        <ul className="divide-y">{checks.map((c) => <li key={c.label} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">{ICON[c.status]}<div><p className="font-medium">{c.label}</p><p className="text-sm text-muted">{c.detail}</p></div></li>)}</ul>
      </Panel>
      <Panel title="Tester l’envoi d’e-mails" text="Envoie un message de test pour vérifier la configuration SMTP.">
        <ResourceForm action={testSmtpAction} submitLabel="Envoyer un e-mail de test" fields={[{ name: "to", label: "Destinataire (vide = votre adresse)", type: "email" }]} />
      </Panel>
    </AdminPage>
  );
}
