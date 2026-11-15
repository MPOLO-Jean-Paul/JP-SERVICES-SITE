import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { DownloadsPreview } from "@/components/visuals/mockups";
import Link from "next/link";
import { ArrowDown, BadgeCheck, Download, FileSearch, RefreshCcw } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SoftwareCatalog, type CategoryChip, type SoftwareItem } from "@/components/logiciels/software-catalog";
import { listLogicielCategories, listLogiciels } from "@/server/services/content";
import { getSetting } from "@/server/services/settings";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({ title: "Logiciels à télécharger", description: "Médiathèque JP-Services : logiciels et outils vérifiés (bureautique, développement, design, sécurité, gestion scolaire) avec version, plateforme et licence.", path: "/logiciels" });

export default async function LogicielsPage() {
  const [rows, categories, intro] = await Promise.all([listLogiciels().catch(() => []), listLogicielCategories().catch(() => []), getSetting("logiciels_intro", "Téléchargez les logiciels et outils recommandés par JP-Services.")]);
  const items: SoftwareItem[] = rows.map(({ logiciel: l, categorie: c }) => ({ id: l.id, nom: l.nom, description: l.description ?? "", version: l.version, taille: Number(l.tailleOctets), plateforme: l.plateforme, licence: l.licence, image: l.image, telechargements: l.telechargements, misAJour: l.misAJour.toISOString(), categorieSlug: c?.slug ?? "autre", categorieNom: c?.nom ?? "Sans catégorie", external: !l.fichier && Boolean(l.lienExterne), hasFile: Boolean(l.fichier) }));
  const used = new Map<string, CategoryChip>();
  for (const it of items) { const c = used.get(it.categorieSlug) ?? { slug: it.categorieSlug, nom: it.categorieNom, count: 0 }; c.count++; used.set(it.categorieSlug, c); }
  const chips = categories.map((c) => used.get(c.slug)).filter((c): c is CategoryChip => Boolean(c));
  const platforms = Array.from(new Set(items.map((i) => i.plateforme).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fr"));
  const total = items.reduce((s, i) => s + i.telechargements, 0);
  return (
    <>
      <PageHero
        eyebrow="Médiathèque JP-Services"
        title="Des logiciels utiles, vérifiés et prêts à installer."
        text={intro}
        actions={
          <>
            <a href="#catalogue-logiciels" className={buttonVariants({ variant: "dark", size: "lg" })}>Parcourir les logiciels <ArrowDown /></a>
            <Link href="/scolia" className={buttonVariants({ variant: "outline", size: "lg" })}>Découvrir SCOLIA Pro</Link>
          </>
        }
        aside={<DownloadsPreview total={total || undefined} />}
      >
        {items.length ? <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
          {[[items.length, "logiciels"], [chips.length, "catégories"], [total, "téléchargements"]].map(([n, l]) => (
            <div key={l as string}><dd className="font-display text-3xl font-semibold tracking-tight">{(n as number).toLocaleString("fr-FR")}</dd><dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{l as string}</dt></div>
          ))}
        </dl> : null}
      </PageHero>
      <section className="section"><div className="shell">{items.length ? <SoftwareCatalog items={items} categories={chips} platforms={platforms} /> : <EmptyState icon={Download} title="La médiathèque est en préparation" text="Les premiers logiciels vérifiés seront publiés prochainement. Vous pouvez déjà nous suggérer un outil utile à votre formation." action={<Link href="/contact" className={buttonVariants({ variant: "dark" })}>Suggérer un logiciel</Link>} />}</div></section>
      <section className="section border-t bg-canvas-soft">
        <div className="shell">
          <SectionHeading kicker="Télécharger en confiance" title="Des fichiers vérifiés et des informations claires." text="Chaque logiciel publié est contrôlé par l’équipe JP-Services avant sa mise en ligne." />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-line md:grid-cols-3">
            {[{ Icon: BadgeCheck, t: "Fichiers contrôlés", d: "Chaque téléversement est vérifié par l’administration avant d’être accessible publiquement." }, { Icon: FileSearch, t: "Fiches détaillées", d: "Version, taille, plateforme et licence sont indiquées pour choisir en toute connaissance de cause." }, { Icon: RefreshCcw, t: "Mises à jour suivies", d: "Les logiciels sont actualisés au fil des versions utilisées dans nos formations." }].map(({ Icon, t, d }) => (
              <article key={t} className="bg-panel p-8"><Icon className="size-5" /><h3 className="h3 mt-6">{t}</h3><p className="mt-2 text-copy">{d}</p></article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
