import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { ExternalLink, Pencil } from "lucide-react";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { DeleteButton } from "@/components/forum/delete-button";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { db, schema } from "@/server/db";
import { deleteActualiteAction, saveActualiteAction } from "@/server/actions/admin/content";
import { excerpt, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Actualités" };

export default async function ActualitesAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string; supprimee?: string }> }) {
  const sp = await searchParams;
  const rows = await db.select().from(schema.actualites).orderBy(desc(schema.actualites.datePublication));
  const e = rows.find((r) => r.id === Number(sp.edit)) ?? null;
  return (
    <AdminPage title="Actualités" text="Articles du journal public. Les paragraphes sont séparés par une ligne vide.">
      {sp.supprimee ? <Alert tone="success">L’actualité a été supprimée.</Alert> : null}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Panel title={e ? "Modifier l’actualité" : "Publier une actualité"} actions={e ? <Link href="/admin/actualites" className="text-sm text-muted hover:text-ink">Annuler</Link> : null}>
          <ResourceForm key={e?.id ?? "new"} action={saveActualiteAction.bind(null, e?.id ?? null)} resetOnSuccess={!e} submitLabel={e ? "Enregistrer" : "Publier"} fields={[
            { name: "titre", label: "Titre", required: true, value: e?.titre },
            { name: "contenu", label: "Contenu", type: "textarea", rows: 12, required: true, value: e?.contenu },
            { name: "media", label: "Image d’illustration", type: "file", accept: "image/jpeg,image/png,image/webp,image/avif", hint: e?.media ? `Média actuel : ${e.media.split("/").pop()}` : "Facultatif. Sans image, une couverture sobre est générée." },
            { name: "media_url", label: "Ou URL d’une vidéo / image externe", type: "url", placeholder: "https://…" },
          ]} />
        </Panel>
        <Panel title={`${rows.length} article(s)`}>
          <DataTable head={["Article", "Publication", ""]} empty="Aucune actualité.">
            {rows.map((a) => <tr key={a.id}><td><p className="font-medium">{a.titre}</p><p className="line-clamp-1 text-xs text-muted">{excerpt(a.contenu, 90)}</p></td><td className="whitespace-nowrap text-xs text-muted">{formatDateTime(a.datePublication)}</td><td className="whitespace-nowrap text-right"><Link href={`/actualites/${a.id}`} target="_blank" className={buttonVariants({ variant: "ghost", size: "sm" })} aria-label="Voir"><ExternalLink /></Link><Link href={`/admin/actualites?edit=${a.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })} aria-label="Modifier"><Pencil /></Link><DeleteButton action={deleteActualiteAction.bind(null, a.id)} label="" title="Supprimer cette actualité ?" /></td></tr>)}
          </DataTable>
        </Panel>
      </div>
    </AdminPage>
  );
}
