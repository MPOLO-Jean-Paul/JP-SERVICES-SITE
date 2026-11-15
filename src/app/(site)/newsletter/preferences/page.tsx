import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { MailCheck } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Alert } from "@/components/ui/alert";
import { db, schema } from "@/server/db";
import { newsletterToken } from "@/server/actions/newsletter";
import { PrefsForm } from "./prefs-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Préférences newsletter", robots: { index: false } };

export default async function PrefsPage({ searchParams }: { searchParams: Promise<{ email?: string; t?: string }> }) {
  const sp = await searchParams;
  const email = (sp.email ?? "").toLowerCase().trim();
  const valid = Boolean(email) && sp.t === (await newsletterToken(email));
  const sub = valid ? (await db.select().from(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.email, email)).limit(1))[0] : undefined;
  return (
    <>
      <PageHeader title="Préférences newsletter" icon={MailCheck} text="Gérez les thèmes de la newsletter JP-Services ou désinscrivez-vous à tout moment." />
      <section className="section"><div className="shell-narrow">{valid ? <div className="card p-6 sm:p-8"><p className="text-sm text-copy">Préférences pour <strong className="text-ink">{email}</strong>{sub?.statut === "desinscrit" ? " (actuellement désinscrit)" : ""}.</p><div className="mt-6"><PrefsForm email={email} token={sp.t ?? ""} themes={(sub?.themes ?? "").split(",").filter(Boolean)} /></div></div> : <Alert tone="danger" title="Lien invalide">Ce lien de préférences n’est pas valide ou a été modifié. Utilisez le lien reçu dans un e-mail ou abonnez-vous à nouveau depuis le pied de page.</Alert>}</div></section>
    </>
  );
}
