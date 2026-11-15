import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { Pencil } from "lucide-react";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { DeleteButton } from "@/components/forum/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { db, schema } from "@/server/db";
import { deleteProduitAction, saveProduitAction } from "@/server/actions/admin/content";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Produits" };

export default async function ProduitsAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const sp = await searchParams;
  const rows = await db.select().from(schema.produits).orderBy(desc(schema.produits.dateCreation));
  const e = rows.find((r) => r.id === Number(sp.edit)) ?? null;
  return (
    <AdminPage title="Produits" text="Inventaire des produits et prestations affichés sur la page Produits.">
      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <Panel title={e ? "Modifier le produit" : "Ajouter un produit"} actions={e ? <Link href="/admin/produits" className="text-sm text-muted hover:text-ink">Annuler</Link> : null}>
          <ResourceForm key={e?.id ?? "new"} action={saveProduitAction.bind(null, e?.id ?? null)} resetOnSuccess={!e} fields={[
            { name: "nom", label: "Désignation", required: true, value: e?.nom },
            { name: "prix", label: "Prix (USD)", type: "number", step: "0.01", min: 0, value: e ? Number(e.prix) : 0 },
            { name: "description", label: "Description", type: "textarea", rows: 5, value: e?.description },
            { name: "image", label: "Image", type: "file", accept: "image/jpeg,image/png,image/webp" },
          ]} />
        </Panel>
        <Panel title={`${rows.length} produit(s)`}>
          <DataTable head={["Produit", "Prix", ""]} empty="Aucun produit.">
            {rows.map((p) => <tr key={p.id}><td className="font-medium">{p.nom}</td><td className="text-sm">{formatPrice(p.prix)}</td><td className="whitespace-nowrap text-right"><Link href={`/admin/produits?edit=${p.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })} aria-label="Modifier"><Pencil /></Link><DeleteButton action={deleteProduitAction.bind(null, p.id)} label="" title={`Supprimer ${p.nom} ?`} /></td></tr>)}
          </DataTable>
        </Panel>
      </div>
    </AdminPage>
  );
}
