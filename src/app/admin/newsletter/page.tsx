import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { Download } from "lucide-react";
import { AdminPage, DataTable, Panel, StatCard } from "@/components/admin/ui";
import { DeleteButton } from "@/components/forum/delete-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Mail, UserMinus } from "lucide-react";
import { db, schema } from "@/server/db";
import { deleteSubscriberAction } from "@/server/actions/admin/content";
import { NEWSLETTER_THEMES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Newsletter" };

export default async function NewsletterAdminPage() {
  const [rows, actifs, desinscrits] = await Promise.all([
    db.select().from(schema.newsletterSubscribers).orderBy(desc(schema.newsletterSubscribers.dateInscription)).limit(500),
    db.select({ c: sql<number>`COUNT(*)` }).from(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.statut, "actif")),
    db.select({ c: sql<number>`COUNT(*)` }).from(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.statut, "desinscrit")),
  ]);
  return (
    <AdminPage title="Newsletter" text="Abonnés et thèmes choisis. Exportez la liste au format CSV pour votre outil d’envoi." actions={<a href="/admin/newsletter/export" className={buttonVariants({ variant: "outline" })}><Download /> Exporter en CSV</a>}>
      <div className="grid gap-4 sm:grid-cols-2"><StatCard icon={Mail} label="Abonnés actifs" value={Number(actifs[0]?.c ?? 0)} tone="success" /><StatCard icon={UserMinus} label="Désinscrits" value={Number(desinscrits[0]?.c ?? 0)} /></div>
      <Panel>
        <DataTable head={["E-mail", "Thèmes", "Statut", "Inscription", ""]} empty="Aucun abonné.">
          {rows.map((r) => <tr key={r.id}><td className="font-medium">{r.email}</td><td className="text-xs text-copy">{r.themes.split(",").filter(Boolean).map((t) => NEWSLETTER_THEMES[t as keyof typeof NEWSLETTER_THEMES] ?? t).join(", ")}</td><td>{r.statut === "actif" ? <Badge tone="success">Actif</Badge> : <Badge>Désinscrit</Badge>}</td><td className="whitespace-nowrap text-xs text-muted">{formatDateTime(r.dateInscription)}</td><td className="text-right"><DeleteButton action={deleteSubscriberAction.bind(null, r.id)} label="" title={`Supprimer ${r.email} ?`} /></td></tr>)}
        </DataTable>
      </Panel>
    </AdminPage>
  );
}
