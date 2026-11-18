import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import Link from "next/link";
import { ArrowRight, CircleCheck, CircleDashed, Clock, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser } from "@/server/auth/session";
import { listUserProjects, listValidatedProjects } from "@/server/services/content";
import { excerpt, formatDate } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { PROJECT_STATUS } from "@/lib/constants";
import { ProjectForm } from "./project-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({ title: "Projets digitaux", description: "Transformez votre idée en projet structuré : soumettez votre initiative à JP-Services, suivez son analyse et découvrez les réalisations de la communauté.", path: "/projets" });


export default async function ProjetsPage() {
  const user = await getCurrentUser();
  const [mine, validated] = await Promise.all([user ? listUserProjects(user.id).catch(() => []) : Promise.resolve([]), listValidatedProjects().catch(() => [])]);
  return (
    <>
      <PageHero
        asideOnMobile
        eyebrow="Atelier de projets"
        title="Transformons votre idée en projet structuré."
        text="Décrivez votre initiative, transmettez-la de manière sécurisée et suivez son analyse depuis votre espace, jusqu’au retour de l’équipe."
        actions={
          <>
            <a href="#soumettre" className={buttonVariants({ variant: "dark", size: "lg" })}>Présenter un projet <ArrowRight /></a>
            <a href="#realisations" className={buttonVariants({ variant: "outline", size: "lg" })}>Voir les réalisations</a>
          </>
        }
        aside={<div className="jp-directory-guide"><span>Votre démarche</span><p>Un projet se construit autour d’un problème concret.</p>{["Présenter le contexte","Décrire les objectifs","Échanger sur la faisabilité"].map((step,i)=><div className="jp-directory-guide-row" key={step}><small>{String(i+1).padStart(2,"0")}</small><strong>{step}</strong></div>)}</div>}
      >
        
      </PageHero>

      <section className="section" id="soumettre">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="jp-project-form-section p-6 sm:p-8">
            <span className="eyebrow">Nouvelle demande</span>
            <h2 className="h2 mt-2">Présenter un projet</h2>
            <p className="mt-2 text-copy">Donnez suffisamment de contexte pour obtenir un premier retour pertinent.</p>
            <div className="mt-6">
              {user ? <ProjectForm /> : <div className="rounded-md border border-line-strong bg-canvas-soft p-7"><p className="text-copy">Connectez-vous pour transmettre un projet et suivre son analyse.</p><Link href="/connexion?redirect_to=/projets" className={buttonVariants({ variant: "dark", className: "mt-4" })}>Se connecter <ArrowRight /></Link></div>}
            </div>
          </div>
          <div className="reveal">
            <div className="flex items-end justify-between"><div><span className="eyebrow">Tableau de suivi</span><h2 className="h2 mt-2">Mes projets</h2></div><strong className="font-display text-3xl font-semibold">{mine.length}</strong></div>
            {!user ? <p className="mt-4 text-copy">Votre historique apparaît ici après connexion.</p> : mine.length ? (
              <ul className="mt-6 space-y-3">
                {mine.map((p) => { const st = PROJECT_STATUS[p.statut] ?? { label: p.statut, tone: "neutral" as const }; return (
                  <li key={p.id} className="card p-5">
                    <div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{p.titre}</h3><Badge tone={st.tone}>{st.tone === "success" ? <CircleCheck /> : st.tone === "warning" ? <Clock /> : <CircleDashed />}{st.label}</Badge></div>
                    <p className="mt-2 text-sm text-copy">{excerpt(p.description, 140)}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted"><span>Soumis le {formatDate(p.dateSoumission)}</span>{st.tone === "success" ? <Link href={`/projets/${p.id}`} className="font-semibold text-primary">Voir la fiche</Link> : null}</div>
                  </li>
                ); })}
              </ul>
            ) : <div className="mt-6 rounded-xl border border-dashed p-8 text-center text-copy">Aucun projet soumis pour le moment. Votre première demande apparaîtra ici.</div>}
          </div>
        </div>
      </section>

      <section className="section border-t bg-canvas-soft" id="realisations">
        <div className="shell">
          <SectionHeading kicker="Réalisations" title="Les initiatives retenues par notre équipe." text="Consultez les projets dont l’analyse est terminée et accédez à leur présentation complète." />
          {validated.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {validated.map(({ projet: p, auteurNom, auteurPrenom }) => (
                <article key={p.id} className="card card-hover reveal p-6"><Badge tone="success"><Rocket /> Projet validé</Badge><h3 className="h3 mt-3"><Link href={`/projets/${p.id}`} className="hover:text-primary">{p.titre}</Link></h3><p className="mt-2 text-sm text-copy">{excerpt(p.description, 140)}</p><p className="mt-4 text-xs text-muted">Par {`${auteurPrenom} ${auteurNom}`.trim() || "un membre"} · {formatDate(p.dateSoumission)}</p></article>
              ))}
            </div>
          ) : <div className="card reveal mt-10 p-10 text-center text-copy">Les premiers projets validés seront présentés ici.</div>}
        </div>
      </section>
    </>
  );
}
