import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { AdminPage, Panel } from "@/components/admin/ui";
import { StatusSelect } from "@/components/admin/inline-actions";
import { DeleteButton } from "@/components/forum/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban } from "lucide-react";
import { db, schema } from "@/server/db";
import { deleteProjectAction, setProjectStatusAction } from "@/server/actions/admin/content";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Projets" };
const OPTIONS = [{ value: "en_attente", label: "En attente" }, { value: "valide", label: "Validé (public)" }, { value: "rejete", label: "À revoir" }];

export default async function ProjetsAdminPage() {
  const rows = await db.select({ p: schema.projets, email: schema.users.email, nom: schema.users.nom, prenom: schema.users.prenom }).from(schema.projets).innerJoin(schema.users, eq(schema.users.id, schema.projets.auteurId)).orderBy(desc(schema.projets.dateSoumission));
  return (
    <AdminPage title="Projets" text="Analysez les projets soumis. Un projet validé devient visible dans la vitrine publique des réalisations.">
      {rows.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map(({ p, email, nom, prenom }) => (
            <Panel key={p.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0"><p className="font-mono text-[10px] uppercase tracking-wider text-muted">#{String(p.id).padStart(4, "0")} · {formatDateTime(p.dateSoumission)}</p><h2 className="mt-1 font-semibold">{p.titre}</h2><p className="text-xs text-muted">{`${prenom} ${nom}`.trim() || "—"} · {email}</p></div>
                <DeleteButton action={deleteProjectAction.bind(null, p.id)} label="" title="Supprimer ce projet ?" />
              </div>
              <p className="mt-3 max-h-40 overflow-y-auto whitespace-pre-line text-sm text-copy scrollbar-thin">{p.description}</p>
              <div className="mt-4 flex items-center justify-between border-t pt-4"><span className="text-xs text-muted">Statut</span><StatusSelect value={["valide", "approuve"].includes(p.statut) ? "valide" : ["rejete", "refuse"].includes(p.statut) ? "rejete" : "en_attente"} options={OPTIONS} action={setProjectStatusAction.bind(null, p.id)} /></div>
            </Panel>
          ))}
        </div>
      ) : <EmptyState icon={FolderKanban} title="Aucun projet soumis" text="Les projets transmis par les membres apparaîtront ici." />}
    </AdminPage>
  );
}
