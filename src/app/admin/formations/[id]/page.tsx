import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { formationFields } from "@/components/admin/formation-fields";
import { DeleteButton } from "@/components/forum/delete-button";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { db, schema } from "@/server/db";
import { deleteFormationAction, updateFormationAction } from "@/server/actions/admin/formations";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Modifier la formation" };

export default async function EditFormationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ creee?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const fid = Number(id);
  const f = Number.isInteger(fid) ? (await db.select().from(schema.formations).where(eq(schema.formations.id, fid)).limit(1))[0] : undefined;
  if (!f) notFound();
  const inscrits = await db.select({ id: schema.inscriptions.id, date: schema.inscriptions.dateInscription, email: schema.users.email, nom: schema.users.nom, prenom: schema.users.prenom }).from(schema.inscriptions).innerJoin(schema.users, eq(schema.users.id, schema.inscriptions.userId)).where(eq(schema.inscriptions.formationId, fid)).orderBy(desc(schema.inscriptions.dateInscription));
  return (
    <AdminPage title={f.titre} text="Modifier les informations publiques de la formation." actions={<><Link href="/admin/formations" className={buttonVariants({ variant: "ghost" })}><ArrowLeft /> Retour</Link><Link href={`/formations/${f.id}`} target="_blank" className={buttonVariants({ variant: "outline" })}><ExternalLink /> Voir la fiche</Link><DeleteButton action={deleteFormationAction.bind(null, f.id)} variant="danger" size="md" title="Supprimer cette formation ?" text="Les inscriptions, plannings, abonnements et notifications associés seront supprimés." /></>}>
      {sp.creee ? <Alert tone="success">La formation a été publiée.</Alert> : null}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Informations"><ResourceForm action={updateFormationAction.bind(null, f.id)} fields={formationFields(f)} /></Panel>
        <Panel title={`${inscrits.length} inscrit(s)`}>
          <DataTable head={["Membre", "Inscription"]} empty="Aucun inscrit pour le moment.">
            {inscrits.map((i) => <tr key={i.id}><td><p className="font-medium">{`${i.prenom} ${i.nom}`.trim() || "—"}</p><p className="text-xs text-muted">{i.email}</p></td><td className="text-xs text-muted">{formatDateTime(i.date)}</td></tr>)}
          </DataTable>
        </Panel>
      </div>
    </AdminPage>
  );
}
