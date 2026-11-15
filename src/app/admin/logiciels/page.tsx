import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { Pencil } from "lucide-react";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { DeleteButton } from "@/components/forum/delete-button";
import { AppTile } from "@/components/visuals/cover";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { db, schema } from "@/server/db";
import { deleteCategorieAction, deleteLogicielAction, saveCategorieAction, saveLogicielAction } from "@/server/actions/admin/content";
import { formatBytes } from "@/lib/utils";

export const metadata: Metadata = { title: "Logiciels" };

export default async function LogicielsAdminPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const sp = await searchParams;
  const [rows, cats] = await Promise.all([
    db.select({ l: schema.logiciels, cat: schema.logicielCategories.nom }).from(schema.logiciels).leftJoin(schema.logicielCategories, eq(schema.logicielCategories.id, schema.logiciels.categorieId)).orderBy(desc(schema.logiciels.misAJour)),
    db.select().from(schema.logicielCategories).orderBy(asc(schema.logicielCategories.ordre)),
  ]);
  const e = rows.find((r) => r.l.id === Number(sp.edit))?.l ?? null;
  return (
    <AdminPage title="Logiciels" text="Médiathèque publique : fichiers hébergés (50 Mo max) ou liens externes, avec compteur de téléchargements.">
      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Panel title={e ? `Modifier « ${e.nom} »` : "Ajouter un logiciel"} actions={e ? <Link href="/admin/logiciels" className="text-sm text-muted hover:text-ink">Annuler</Link> : null}>
          <ResourceForm key={e?.id ?? "new"} action={saveLogicielAction.bind(null, e?.id ?? null)} resetOnSuccess={!e} fields={[
            { name: "nom", label: "Nom du logiciel", required: true, value: e?.nom },
            { name: "version", label: "Version", half: true, value: e?.version },
            { name: "licence", label: "Licence", half: true, value: e?.licence ?? "Gratuit" },
            { name: "categorie_id", label: "Catégorie", type: "select", half: true, value: e?.categorieId ? String(e.categorieId) : "", options: [{ value: "", label: "Sans catégorie" }, ...cats.map((c) => ({ value: String(c.id), label: c.nom }))] },
            { name: "plateforme", label: "Plateforme", half: true, placeholder: "Windows 10/11", value: e?.plateforme },
            { name: "description", label: "Description", type: "textarea", rows: 4, value: e?.description ?? "" },
            { name: "fichier", label: "Fichier à téléverser", type: "file", accept: ".zip,.apk,.exe,.msi,.dmg,.pkg,.deb,.rar,.7z,.pdf", hint: e?.fichier ? `Fichier actuel : ${e.fichier.split("/").pop()} — laisser vide pour le conserver.` : "zip, apk, exe, msi, dmg, pkg, deb, rar, 7z ou pdf — 50 Mo max." },
            { name: "lien_externe", label: "Ou lien de téléchargement externe", type: "url", placeholder: "https://…", value: e?.lienExterne },
            { name: "taille_mo", label: "Taille (Mo) pour un lien externe", type: "number", step: "0.1", min: 0, half: true, value: e && !e.fichier && e.tailleOctets ? (e.tailleOctets / 1048576).toFixed(1) : "" },
            { name: "statut", label: "Statut", type: "select", half: true, value: e?.statut ?? "publie", options: [{ value: "publie", label: "Publié" }, { value: "brouillon", label: "Brouillon" }] },
            { name: "image", label: "Icône personnalisée", type: "file", accept: "image/png,image/jpeg,image/webp", hint: "Facultatif : une pastille est générée automatiquement." },
          ]} />
        </Panel>
        <div className="space-y-6">
          <Panel title={`${rows.length} logiciel(s)`}>
            <DataTable head={["Logiciel", "Catégorie", "Taille", "Téléch.", ""]} empty="Aucun logiciel.">
              {rows.map(({ l, cat }) => (
                <tr key={l.id}>
                  <td><div className="flex items-center gap-3"><AppTile name={l.nom} className="size-9 text-xs" /><div><p className="font-medium">{l.nom} {l.version ? <span className="font-mono text-xs text-muted">v{l.version}</span> : null}</p><p className="text-xs text-muted">{l.fichier ? "Fichier hébergé" : l.lienExterne ? "Lien externe" : "Sans fichier"}{l.statut === "brouillon" ? " · " : ""}{l.statut === "brouillon" ? <Badge tone="warning">Brouillon</Badge> : null}</p></div></div></td>
                  <td className="text-sm">{cat ?? "—"}</td>
                  <td className="whitespace-nowrap text-xs text-muted">{formatBytes(l.tailleOctets)}</td>
                  <td className="text-sm">{l.telechargements.toLocaleString("fr-FR")}</td>
                  <td className="whitespace-nowrap text-right"><Link href={`/admin/logiciels?edit=${l.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })} aria-label="Modifier"><Pencil /></Link><DeleteButton action={deleteLogicielAction.bind(null, l.id)} label="" title={`Supprimer ${l.nom} ?`} text="Le fichier hébergé sera également supprimé." /></td>
                </tr>
              ))}
            </DataTable>
          </Panel>
          <Panel title="Catégories">
            <ul className="mb-5 flex flex-wrap gap-2">{cats.map((c) => <li key={c.id} className="inline-flex items-center gap-1 rounded-full border bg-panel py-0.5 pl-3 pr-1 text-sm">{c.nom}<DeleteButton action={deleteCategorieAction.bind(null, c.id)} label="" title={`Supprimer la catégorie ${c.nom} ?`} text="Les logiciels associés passeront « Sans catégorie »." /></li>)}</ul>
            <ResourceForm action={saveCategorieAction} resetOnSuccess submitLabel="Ajouter la catégorie" fields={[{ name: "nom", label: "Nom", required: true, half: true }, { name: "ordre", label: "Ordre d’affichage", type: "number", half: true, value: cats.length + 1 }]} />
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}
