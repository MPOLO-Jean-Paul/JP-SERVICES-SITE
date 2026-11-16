import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowDown, ArrowRight, CalendarCheck, GraduationCap, Rows3, SearchCheck, Video } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHero } from "@/components/site/page-hero";
import { Catalog, type CatalogItem, type DomainChip } from "@/components/formations/catalog";
import { listFormations } from "@/server/services/formations";
import { excerpt } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({ title: "Formations", description: "Catalogue des formations JP-Services : développement web, bureautique, marketing digital, data et management. Comparez les niveaux, tarifs et prochaines sessions.", path: "/formations" });

export default async function FormationsPage() {
  const formations = await listFormations().catch(() => []);
  const items: CatalogItem[] = formations.map((f) => ({
    id: f.id,
    titre: f.titre,
    excerpt: excerpt(f.description, 150) || "Un parcours structuré pour développer une compétence directement applicable.",
    search: `${f.titre} ${f.description} ${f.domain.label} ${f.niveau}`.toLowerCase(),
    domainSlug: f.domain.slug,
    domainLabel: f.domain.label,
    domainIcon: f.domain.icon,
    niveau: f.niveau?.trim() || "Niveau ouvert",
    prix: Number(f.prix),
    duree: f.duree,
    dateDebut: f.dateDebut,
    dateTs: f.dateDebut ? new Date(f.dateDebut).getTime() : Number.MAX_SAFE_INTEGER,
    modules: f.modules.length,
    image: f.image,
  }));
  const domainMap = new Map<string, DomainChip>();
  for (const f of formations) {
    const d = domainMap.get(f.domain.slug) ?? { slug: f.domain.slug, label: f.domain.label, icon: f.domain.icon, count: 0 };
    d.count++;
    domainMap.set(f.domain.slug, d);
  }
  const levels = Array.from(new Set(items.map((i) => i.niveau))).sort((a, b) => a.localeCompare(b, "fr"));

  return (
    <>
      <PageHero
        eyebrow="Catalogue des formations"
        title="Développez vos compétences. Donnez-leur une application concrète."
        text="Explorez les formations publiées par JP-SERVICES. Comparez les programmes et les informations disponibles pour choisir avec précision."
        actions={
          <>
            <a href="#catalogue" className={buttonVariants({ variant: "dark", size: "lg" })}>
              Parcourir le catalogue <ArrowDown />
            </a>
            <Link href="/formations-en-ligne" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <Video /> Sessions en direct
            </Link>
          </>
        }
        aside={
          <div className="jp-directory-guide" aria-label="Étapes pour choisir une formation">
            <span>VOTRE PARCOURS</span>
            <p>Une bonne formation commence par un besoin clairement identifié.</p>
            {["Définir votre objectif","Lire les informations publiées","Demander les précisions utiles"].map((item,i)=>
              <div className="jp-directory-guide-row" key={item}><small>{String(i+1).padStart(2,"0")}</small><strong>{item}</strong></div>
            )}
          </div>
        }
      />

      <section className="section">
        <div className="shell">
          {items.length ? (
            <Suspense fallback={null}>
              <Catalog items={items} domains={Array.from(domainMap.values()).sort((a, b) => a.label.localeCompare(b.label, "fr"))} levels={levels} />
            </Suspense>
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="Le catalogue est en préparation"
              text="Aucun programme n’est publié actuellement. Écrivez-nous pour préciser vos besoins ; les formations apparaîtront ici lorsque leurs informations seront confirmées."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/contact?sujet=Demande%20de%20formation" className={buttonVariants({ variant: "dark" })}>Demander des renseignements</Link>
                  <Link href="/contact" className={buttonVariants({ variant: "outline" })}>Nous contacter</Link>
                </div>
              }
            />
          )}
        </div>
      </section>

      <section className="section border-t bg-canvas-soft">
        <div className="shell">
          <SectionHeading kicker="Bien choisir" title="Un parcours clair, de la découverte à la pratique." text="Chaque fiche vous donne les informations utiles avant de vous engager." action={<Link href="/aide" className={buttonVariants({ variant: "outline" })}>Besoin de conseils ? <ArrowRight /></Link>} />
          <ol className="jp-directory-steps mt-12">
            {[
              { Icon: SearchCheck, title: "Comparez", text: "Filtrez par domaine, niveau, durée et tarif pour identifier la formation adaptée." },
              { Icon: Rows3, title: "Consultez le programme", text: "Découvrez les modules, le déroulement et les prochaines dates avant l’inscription." },
              { Icon: CalendarCheck, title: "Planifiez", text: "Après inscription, proposez vos disponibilités et suivez la validation de votre planning." },
            ].map(({ Icon, title, text }, i) => (
              <li key={title} className="jp-directory-step">
                <div className="flex items-center justify-between">
                  <Icon className="size-5" />
                  <span className="font-mono text-xs text-muted">0{i + 1}</span>
                </div>
                <h3 className="h3 mt-6">{title}</h3>
                <p className="mt-2 text-copy">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
