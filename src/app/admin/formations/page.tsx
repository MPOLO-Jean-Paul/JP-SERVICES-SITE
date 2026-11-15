import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { Pencil, Plus } from "lucide-react";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Cover } from "@/components/visuals/cover";
import { db, schema } from "@/server/db";
import { detectDomain, formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Formations" };

export default async function AdminFormationsPage({ searchParams }: { searchParams: Promise<{ supprimee?: string }> }) {
  const sp = await searchParams;
  const rows = await db
    .select({ f: schema.formations, inscrits: sql<number>`(SELECT COUNT(*) FROM inscriptions i WHERE i.formation_id = ${schema.formations.id})`, plannings: sql<number>`(SELECT COUNT(*) FROM planning_valide p WHERE p.formation_id = ${schema.formations.id} AND p.statut = 'en_attente')` })
    .from(schema.formations)
    .orderBy(desc(schema.formations.dateCreation));
  void eq;
  return (
    <AdminPage title="Formations" text="Catalogue public : publication, modification et suivi des inscriptions." actions={<Link href="/admin/formations/nouvelle" className={buttonVariants({ variant: "dark" })}><Plus /> Nouvelle formation</Link>}>
      {sp.supprimee ? <Alert tone="success">La formation a été supprimée.</Alert> : null}
      <Panel>
        <DataTable head={["Formation", "Niveau", "Rentrée", "Tarif", "Inscrits", ""]} empty="Aucune formation publiée.">
          {rows.map(({ f, inscrits, plannings }) => (
            <tr key={f.id}>
              <td><div className="flex items-center gap-3"><Cover seed={f.id} palette={detectDomain(f.titre, f.description).slug} className="h-10 w-14 shrink-0 rounded-md" /><div className="min-w-0"><Link href={`/admin/formations/${f.id}`} className="font-medium hover:text-primary">{f.titre}</Link><p className="text-xs text-muted">{f.duree}</p></div></div></td>
              <td className="text-sm">{f.niveau}</td>
              <td className="whitespace-nowrap text-sm">{f.dateDebut ? formatDate(f.dateDebut, "fr", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
              <td className="text-sm font-medium">{formatPrice(f.prix)}</td>
              <td className="text-sm">{Number(inscrits)}{Number(plannings) ? <span className="ml-2 text-xs text-amber-600">{Number(plannings)} planning(s) à valider</span> : null}</td>
              <td className="text-right"><Link href={`/admin/formations/${f.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}><Pencil /> Modifier</Link></td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </AdminPage>
  );
}
