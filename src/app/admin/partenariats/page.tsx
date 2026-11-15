import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { Pencil } from "lucide-react";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { StatusSelect } from "@/components/admin/inline-actions";
import { DeleteButton } from "@/components/forum/delete-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { db, schema } from "@/server/db";
import { deleteDemandeAction, deletePartenaireAction, saveDemandeNoteAction, savePartenaireAction, setDemandeStatusAction } from "@/server/actions/admin/content";
import { PARTNERSHIP_TYPES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Partenariats" };
const STATUS = [{ value: "nouvelle", label: "Nouvelle" }, { value: "en_discussion", label: "En discussion" }, { value: "acceptee", label: "Acceptée" }, { value: "refusee", label: "Refusée" }];

export default async function PartenariatsAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const sp = await searchParams;
  const [partenaires, demandes] = await Promise.all([db.select().from(schema.partenaires).orderBy(asc(schema.partenaires.ordre)), db.select().from(schema.partenariatDemandes).orderBy(desc(schema.partenariatDemandes.dateDemande))]);
  const e = partenaires.find((p) => p.id === Number(sp.edit)) ?? null;
  return (
    <AdminPage title="Partenariats" text="Vitrine des partenaires et suivi des demandes reçues depuis la page Partenariat.">
      <Panel title={`Demandes reçues (${demandes.length})`}>
        {demandes.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {demandes.map((d) => (
              <div key={d.id} className="rounded-xl border p-5">
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{d.organisation}</p><p className="text-xs text-muted">{d.contactNom} · <a href={`mailto:${d.email}`} className="hover:text-ink">{d.email}</a>{d.telephone ? ` · ${d.telephone}` : ""}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">{d.typePartenariat} · {formatDateTime(d.dateDemande)}</p></div><DeleteButton action={deleteDemandeAction.bind(null, d.id)} label="" title="Supprimer cette demande ?" /></div>
                <p className="mt-3 whitespace-pre-line text-sm text-copy">{d.message}</p>
                <div className="mt-4 flex items-center justify-between border-t pt-4"><span className="text-xs text-muted">Statut</span><StatusSelect value={d.statut} options={STATUS} action={setDemandeStatusAction.bind(null, d.id)} /></div>
                <div className="mt-3"><ResourceForm action={saveDemandeNoteAction.bind(null, d.id)} submitLabel="Enregistrer la note" fields={[{ name: "note_admin", label: "Note interne", type: "textarea", rows: 2, value: d.noteAdmin ?? "" }]} /></div>
              </div>
            ))}
          </div>
        ) : <p className="py-6 text-center text-sm text-muted">Aucune demande reçue.</p>}
      </Panel>
      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <Panel title={e ? `Modifier « ${e.nom} »` : "Ajouter un partenaire"} actions={e ? <Link href="/admin/partenariats" className="text-sm text-muted hover:text-ink">Annuler</Link> : null}>
          <ResourceForm key={e?.id ?? "new"} action={savePartenaireAction.bind(null, e?.id ?? null)} resetOnSuccess={!e} fields={[
            { name: "nom", label: "Nom de l’organisation", required: true, value: e?.nom },
            { name: "type_partenariat", label: "Type de partenariat", type: "select", half: true, value: e?.typePartenariat ?? "", options: [{ value: "", label: "—" }, ...PARTNERSHIP_TYPES.map((t) => ({ value: t.label, label: t.label }))] },
            { name: "ordre", label: "Ordre d’affichage", type: "number", half: true, value: e?.ordre ?? 0 },
            { name: "site_web", label: "Site web", type: "url", placeholder: "https://…", value: e?.siteWeb },
            { name: "description", label: "Description courte", type: "textarea", rows: 3, value: e?.description ?? "" },
            { name: "logo", label: "Logo", type: "file", accept: "image/png,image/jpeg,image/webp,image/svg+xml" },
            { name: "actif", label: "Afficher sur la page publique", type: "checkbox", value: e ? e.actif === 1 : true },
          ]} />
        </Panel>
        <Panel title={`${partenaires.length} partenaire(s)`}>
          <DataTable head={["Partenaire", "Type", "Visibilité", ""]} empty="Aucun partenaire.">
            {partenaires.map((p) => <tr key={p.id}><td className="font-medium">{p.nom}</td><td className="text-sm">{p.typePartenariat || "—"}</td><td>{p.actif ? <Badge tone="success">Visible</Badge> : <Badge>Masqué</Badge>}</td><td className="whitespace-nowrap text-right"><Link href={`/admin/partenariats?edit=${p.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })} aria-label="Modifier"><Pencil /></Link><DeleteButton action={deletePartenaireAction.bind(null, p.id)} label="" title={`Supprimer ${p.nom} ?`} /></td></tr>)}
          </DataTable>
        </Panel>
      </div>
    </AdminPage>
  );
}
