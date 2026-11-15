import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { StatusSelect } from "@/components/admin/inline-actions";
import { DeleteButton } from "@/components/forum/delete-button";
import { db, schema } from "@/server/db";
import { deletePlanningAction, setPlanningStatusAction } from "@/server/actions/admin/formations";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Horaires et plannings" };
const OPTIONS = [{ value: "en_attente", label: "En attente" }, { value: "valide", label: "Validé" }, { value: "refuse", label: "À revoir" }];

export default async function PlanningsPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const sp = await searchParams;
  const filter = OPTIONS.some((o) => o.value === sp.statut) ? sp.statut! : null;
  const rows = await db
    .select({ p: schema.planningValide, formation: schema.formations.titre, email: schema.users.email, nom: schema.users.nom, prenom: schema.users.prenom })
    .from(schema.planningValide)
    .innerJoin(schema.formations, eq(schema.formations.id, schema.planningValide.formationId))
    .innerJoin(schema.users, eq(schema.users.id, schema.planningValide.userId))
    .where(filter ? eq(schema.planningValide.statut, filter) : undefined)
    .orderBy(desc(schema.planningValide.dateCreation));
  return (
    <AdminPage title="Horaires et plannings" text="Validez les programmes personnalisés transmis par les apprenants après leur inscription.">
      <div className="flex flex-wrap gap-2">{[{ value: "", label: "Tous" }, ...OPTIONS].map((o) => <a key={o.value} href={o.value ? `/admin/horaires?statut=${o.value}` : "/admin/horaires"} className={`rounded-full border px-3 py-1.5 text-sm ${(filter ?? "") === o.value ? "border-ink bg-ink text-canvas" : "bg-panel text-copy hover:border-line-strong"}`}>{o.label}</a>)}</div>
      <Panel>
        <DataTable head={["Apprenant", "Formation", "Modules", "Disponibilités", "Statut", ""]} empty="Aucune demande de planning.">
          {rows.map(({ p, formation, email, nom, prenom }) => {
            let schedule: Record<string, { debut: string; fin: string }> = {};
            try { schedule = JSON.parse(p.horaireDetails); } catch {}
            return (
              <tr key={p.id}>
                <td><p className="font-medium">{`${prenom} ${nom}`.trim() || "—"}</p><p className="text-xs text-muted">{email}</p><p className="font-mono text-[10px] text-muted">{formatDateTime(p.dateCreation)}</p></td>
                <td className="max-w-48 text-sm">{formation}</td>
                <td className="max-w-64 text-xs text-copy">{p.modulesChoisis}</td>
                <td className="text-xs">{Object.entries(schedule).map(([d, h]) => <div key={d} className="whitespace-nowrap"><span className="font-medium">{d}</span> <span className="font-mono text-muted">{h.debut}–{h.fin}</span></div>)}</td>
                <td><StatusSelect value={p.statut} options={OPTIONS} action={setPlanningStatusAction.bind(null, p.id)} /></td>
                <td className="text-right"><DeleteButton action={deletePlanningAction.bind(null, p.id)} label="" title="Supprimer cette demande ?" text="L’apprenant pourra transmettre un nouveau planning." /></td>
              </tr>
            );
          })}
        </DataTable>
      </Panel>
    </AdminPage>
  );
}
