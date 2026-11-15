import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { LifeBuoy } from "lucide-react";
import { AdminPage, Panel } from "@/components/admin/ui";
import { StatusSelect } from "@/components/admin/inline-actions";
import { DeleteButton } from "@/components/forum/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { db, schema } from "@/server/db";
import { deleteTicketAction, setTicketStatusAction } from "@/server/actions/admin/content";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Support" };
const STATUS = [{ value: "nouveau", label: "Nouveau" }, { value: "en_cours", label: "En cours" }, { value: "resolu", label: "Résolu" }, { value: "ferme", label: "Fermé" }];

export default async function SupportAdminPage() {
  const rows = await db.select().from(schema.supportTickets).orderBy(desc(schema.supportTickets.dateEnvoi)).limit(200);
  return (
    <AdminPage title="Support" text="Demandes d’assistance du centre d’aide. Répondez par e-mail puis mettez à jour le statut.">
      {rows.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((t) => (
            <Panel key={t.id}>
              <div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-wider text-muted">#{String(t.id).padStart(4, "0")} · {t.sujet} · {formatDateTime(t.dateEnvoi)}</p><p className="mt-1 font-semibold">{t.nom}</p><a href={`mailto:${t.email}?subject=${encodeURIComponent(`Votre demande d’assistance #${t.id}`)}`} className="text-xs text-primary hover:underline">{t.email}</a></div><DeleteButton action={deleteTicketAction.bind(null, t.id)} label="" title="Supprimer cette demande ?" /></div>
              <p className="mt-3 whitespace-pre-line text-sm text-copy">{t.message}</p>
              <div className="mt-4 flex items-center justify-between border-t pt-4"><span className="text-xs text-muted">Statut</span><StatusSelect value={t.statut} options={STATUS} action={setTicketStatusAction.bind(null, t.id)} /></div>
            </Panel>
          ))}
        </div>
      ) : <EmptyState icon={LifeBuoy} title="Aucune demande d’assistance" text="Les demandes envoyées depuis le centre d’aide apparaîtront ici." />}
    </AdminPage>
  );
}
