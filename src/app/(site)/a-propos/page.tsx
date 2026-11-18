import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Users } from "lucide-react";
import { Linkedin } from "@/components/brand/social-icons";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { listEquipe } from "@/server/services/content";
import { getHomeStats } from "@/server/services/content";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({ title: "À propos", description: "JP-Services : l’excellence numérique à votre portée. Notre mission, nos valeurs et l’équipe qui accompagne la formation et la transformation digitale à Lubumbashi.", path: "/a-propos" });

function teamPhoto(photo: string) {
  return photo && photo.startsWith("uploads/") ? photo : null;
}

export default async function AProposPage() {
  const [membres, stats] = await Promise.all([listEquipe().catch(() => []), getHomeStats().catch(() => null)]);
  // Seuls les chiffres parlants sont affichés (jamais « 1 membres » au lancement).
  const shown = stats ? ([[stats.formations, "formations", 5], [stats.membres, "membres", 50], [stats.logiciels, "logiciels", 5]] as const).filter(([n, , min]) => n >= min).map(([n, l]) => [n, l] as const) : [];
  return (
    <>
      <PageHeader illustration="/illustrations/a-propos-equipe.svg" title="À propos de JP-Services" icon={Users} text="L’excellence numérique à votre portée. Nous transformons les idées en projets concrets et les projets en résultats." />
      <section className="section">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow">Qui sommes-nous ?</span>
            <h2 className="h1 mt-3">Ensemble pour une jeunesse rénovée.</h2>
            <p className="lead mt-5">JP-Services est une structure de formation et de services digitaux basée à Lubumbashi. Nous rendons les compétences numériques accessibles et nous accompagnons les organisations dans leur transformation : formations pratiques, logiciels métiers comme SCOLIA Pro, projets digitaux et communauté d’entraide.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/formations" className={buttonVariants({ variant: "dark", size: "lg" })}>Découvrir nos formations <ArrowRight /></Link>
              <Link href="/contact" className={buttonVariants({ variant: "outline", size: "lg" })}>Nous contacter</Link>
            </div>
            {shown.length >= 2 ? (
              <dl className="mt-10 grid grid-cols-3 gap-6 border-t pt-8">
                {shown.map(([n, l]) => (
                  <div key={l as string}><dd className="font-display text-3xl font-semibold tracking-tight">{n as number}</dd><dt className="mt-1 text-sm text-muted">{l as string}</dt></div>
                ))}
              </dl>
            ) : null}
          </div>
          <div className="relative overflow-hidden rounded-2xl border bg-brand-950 p-8 text-white shadow-lg sm:p-10">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [--grid-line:rgb(255_255_255/0.05)]" aria-hidden />
            <div className="relative">
              <span className="text-[11px] text-brand-300 font-medium">Notre devise</span>
              <p className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">« Ensemble pour une jeunesse rénovée. »</p>
              <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10">
                {[["Formation", "Parcours pratiques"], ["Logiciels", "Outils métiers"], ["Projets", "Accompagnement"], ["Communauté", "Entraide"]].map(([t, d]) => (
                  <div key={t} className="bg-brand-950/80 p-4"><p className="font-medium">{t}</p><p className="text-[11px] text-white/50 font-medium">{d}</p></div>
                ))}
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm text-white/70"><MapPin className="size-4" /> Lubumbashi, RDC · sur place et à distance</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section border-y bg-canvas-soft">
        <div className="shell">
          <SectionHeading kicker="Mission et valeurs" title="Ce qui guide chacune de nos actions." />
          <div className="reveal-stagger mt-12 grid gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {[
              { title: "Notre mission", text: "Rendre les compétences numériques accessibles et donner aux entreprises et aux écoles des outils qui simplifient leur gestion au quotidien." },
              { title: "Le soin du détail", text: "Chaque formation est préparée sur des cas réels ; chaque logiciel est testé sur le terrain avant d’être publié." },
              { title: "La transparence", text: "Des programmes clairs, des tarifs annoncés à l’avance et des données personnelles protégées." },
              { title: "L’adaptation au terrain", text: "Des outils pensés pour les réalités locales : connexion limitée, réseau d’établissement, fonctionnement hors ligne." },
            ].map(({ title, text }, i) => (
              <article key={title} className="border-t border-line-strong pt-6">
                <span className="font-display text-sm font-semibold text-primary tabular-nums">0{i + 1}</span>
                <h3 className="h3 mt-3">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-copy">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeading kicker="L’équipe" title="Les visages derrière le code." text="Formateurs, développeurs et accompagnateurs : une équipe engagée pour votre progression." />
          {membres.length ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {membres.map((m) => (
                <article key={m.id} className="card card-hover reveal flex flex-col items-start p-7">
                  <Avatar name={m.nom} src={teamPhoto(m.photo)} size={88} className="ring-1 ring-line" />
                  <h3 className="h3 mt-5">{m.nom}</h3>
                  <p className="mt-1 text-[11px] text-muted font-medium">{m.role}</p>
                  <div className="mt-4 flex gap-2">
                    {m.linkedin ? <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${m.nom}`} className="inline-flex size-9 items-center justify-center rounded-full border text-copy hover:border-primary hover:text-primary"><Linkedin className="size-4" /></a> : null}
                    {m.email ? <a href={`mailto:${m.email}`} aria-label={`Écrire à ${m.nom}`} className="inline-flex size-9 items-center justify-center rounded-full border text-copy hover:border-primary hover:text-primary"><Mail className="size-4" /></a> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-copy">L’équipe se prépare, repassez bientôt !</p>
          )}
        </div>
      </section>
    </>
  );
}
