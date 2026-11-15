import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { ExternalLink, Pencil } from "lucide-react";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { StatusSelect } from "@/components/admin/inline-actions";
import { DeleteButton } from "@/components/forum/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { db, schema } from "@/server/db";
import { deleteLiveAction, saveLiveAction, setLiveStatusAction } from "@/server/actions/admin/content";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Formations en ligne" };
const STATUS = [{ value: "planifiee", label: "Planifiée" }, { value: "en_cours", label: "En direct" }, { value: "terminee", label: "Terminée" }, { value: "annulee", label: "Annulée" }];
const local = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default async function LiveAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const sp = await searchParams;
  const [rows, formations] = await Promise.all([
    db.select({ s: schema.liveSessions, formation: schema.formations.titre }).from(schema.liveSessions).leftJoin(schema.formations, eq(schema.formations.id, schema.liveSessions.formationId)).orderBy(desc(schema.liveSessions.dateDebut)),
    db.select({ id: schema.formations.id, titre: schema.formations.titre }).from(schema.formations).orderBy(asc(schema.formations.titre)),
  ]);
  const editing = rows.find((r) => r.s.id === Number(sp.edit))?.s ?? null;
  return (
    <AdminPage title="Formations en ligne" text="Planifiez les sessions de visioconférence. Entrez dans la salle en premier pour en être le modérateur.">
      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Panel title={editing ? "Modifier la session" : "Planifier une session"} actions={editing ? <Link href="/admin/live" className="text-sm text-muted hover:text-ink">Annuler</Link> : null}>
          <ResourceForm key={editing?.id ?? "new"} action={saveLiveAction.bind(null, editing?.id ?? null)} resetOnSuccess={!editing} fields={[
            { name: "titre", label: "Titre de la session", required: true, value: editing?.titre },
            { name: "formation_id", label: "Formation associée", type: "select", value: editing?.formationId ? String(editing.formationId) : "", options: [{ value: "", label: "Aucune" }, ...formations.map((f) => ({ value: String(f.id), label: f.titre }))] },
            { name: "formateur", label: "Hôte / formateur", half: true, value: editing?.formateur },
            { name: "date_debut", label: "Début", type: "datetime-local", required: true, half: true, value: editing ? local(editing.dateDebut) : "" },
            { name: "duree_minutes", label: "Durée (minutes)", type: "number", min: 15, max: 600, half: true, value: editing?.dureeMinutes ?? 60 },
            { name: "acces", label: "Accès", type: "select", half: true, value: editing?.acces ?? "membres", options: [{ value: "membres", label: "Membres connectés" }, { value: "public", label: "Tout public (lien seul)" }] },
            { name: "statut", label: "Statut", type: "select", value: editing?.statut ?? "planifiee", options: STATUS },
            { name: "description", label: "Description", type: "textarea", rows: 4, value: editing?.description ?? "" },
          ]} />
        </Panel>
        <Panel title={`${rows.length} session(s)`}>
          <DataTable head={["Session", "Début", "Accès", "Statut", ""]} empty="Aucune session planifiée.">
            {rows.map(({ s, formation }) => (
              <tr key={s.id}>
                <td><p className="font-medium">{s.titre}</p><p className="text-xs text-muted">{formation ?? "—"} · {s.formateur || "—"}</p></td>
                <td className="whitespace-nowrap text-xs">{formatDateTime(s.dateDebut)}<p className="text-muted">{s.dureeMinutes} min</p></td>
                <td className="text-sm">{s.acces === "public" ? "Public" : "Membres"}</td>
                <td><StatusSelect value={s.statut} options={STATUS} action={setLiveStatusAction.bind(null, s.id)} className="min-w-32" /></td>
                <td className="whitespace-nowrap text-right"><Link href={`/visio/${s.id}`} target="_blank" className={buttonVariants({ variant: "ghost", size: "sm" })} aria-label="Ouvrir la salle"><ExternalLink /></Link><Link href={`/admin/live?edit=${s.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })} aria-label="Modifier"><Pencil /></Link><DeleteButton action={deleteLiveAction.bind(null, s.id)} label="" title="Supprimer cette session ?" /></td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </AdminPage>
  );
}
