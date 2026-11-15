import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { Pencil } from "lucide-react";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { DeleteButton } from "@/components/forum/delete-button";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { db, schema } from "@/server/db";
import { deleteMembreAction, saveMembreAction } from "@/server/actions/admin/content";

export const metadata: Metadata = { title: "Équipe JP-Services" };

export default async function EquipeAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const sp = await searchParams;
  const rows = await db.select().from(schema.equipe).orderBy(asc(schema.equipe.ordre), asc(schema.equipe.nom));
  const e = rows.find((r) => r.id === Number(sp.edit)) ?? null;
  return (
    <AdminPage title="Équipe JP-Services" text="Membres présentés sur la page À propos.">
      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <Panel title={e ? `Modifier « ${e.nom} »` : "Ajouter un membre"} actions={e ? <Link href="/admin/equipe" className="text-sm text-muted hover:text-ink">Annuler</Link> : null}>
          <ResourceForm key={e?.id ?? "new"} action={saveMembreAction.bind(null, e?.id ?? null)} resetOnSuccess={!e} fields={[
            { name: "nom", label: "Nom complet", required: true, half: true, value: e?.nom },
            { name: "role", label: "Rôle / poste", required: true, half: true, value: e?.role },
            { name: "email", label: "E-mail professionnel", type: "email", half: true, value: e?.email },
            { name: "linkedin", label: "Profil LinkedIn", type: "url", half: true, value: e?.linkedin ?? "" },
            { name: "ordre", label: "Ordre d’affichage", type: "number", half: true, value: e?.ordre ?? rows.length + 1 },
            { name: "photo", label: "Photo", type: "file", accept: "image/jpeg,image/png,image/webp", half: true },
          ]} />
        </Panel>
        <Panel title={`${rows.length} membre(s)`}>
          <DataTable head={["Membre", "Rôle", ""]} empty="Aucun membre.">
            {rows.map((m) => <tr key={m.id}><td><div className="flex items-center gap-3"><Avatar name={m.nom} src={m.photo.startsWith("uploads/") ? m.photo : null} size={34} /><div><p className="font-medium">{m.nom}</p><p className="text-xs text-muted">{m.email}</p></div></div></td><td className="text-sm">{m.role}</td><td className="whitespace-nowrap text-right"><Link href={`/admin/equipe?edit=${m.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })} aria-label="Modifier"><Pencil /></Link><DeleteButton action={deleteMembreAction.bind(null, m.id)} label="" title={`Retirer ${m.nom} ?`} /></td></tr>)}
          </DataTable>
        </Panel>
      </div>
    </AdminPage>
  );
}
