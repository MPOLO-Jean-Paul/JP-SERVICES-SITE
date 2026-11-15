import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Lightbulb, Mail, MapPin, Rocket, ShieldCheck, Users } from "lucide-react";
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
  return (
    <>
      <PageHeader title="À propos de JP-Services" icon={Users} text="L’excellence numérique à votre portée. Nous transformons les idées en projets concrets et les projets en résultats." />
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
            {stats ? (
              <dl className="mt-10 grid grid-cols-3 gap-6 border-t pt-8">
                {[[stats.formations, "formations"], [stats.membres, "membres"], [stats.logiciels, "logiciels"]].map(([n, l]) => (
                  <div key={l as string}><dd className="font-display text-3xl font-semibold tracking-tight">{n as number}</dd><dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{l as string}</dt></div>
                ))}
              </dl>
            ) : null}
          </div>
          <div className="relative overflow-hidden rounded-2xl border bg-brand-950 p-8 text-white shadow-lg sm:p-10">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [--grid-line:rgb(255_255_255/0.05)]" aria-hidden />
            <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand-600/40 blur-3xl" aria-hidden />
            <div className="relative">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-300">Notre devise</span>
              <p className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">« Ensemble pour une jeunesse rénovée. »</p>
              <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10">
                {[["Formation", "Parcours pratiques"], ["Logiciels", "Outils métiers"], ["Projets", "Accompagnement"], ["Communauté", "Entraide"]].map(([t, d]) => (
                  <div key={t} className="bg-brand-950/80 p-4"><p className="font-medium">{t}</p><p className="font-mono text-[10px] uppercase tracking-wider text-white/50">{d}</p></div>
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
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-line md:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: Rocket, title: "Notre mission", text: "Fournir des services web et des solutions technologiques de haute qualité, accessibles à tous, et créer des outils qui facilitent la gestion quotidienne des entreprises et des écoles." },
              { Icon: Heart, title: "Passion", text: "Nous aimons ce que nous construisons, et cela se voit dans le soin apporté à chaque formation et à chaque logiciel." },
              { Icon: ShieldCheck, title: "Intégrité", text: "La transparence totale envers nos apprenants et nos clients : des programmes clairs, des tarifs annoncés, des données protégées." },
              { Icon: Lightbulb, title: "Innovation", text: "Nous ne suivons pas les tendances, nous les créons : des outils modernes pensés pour les réalités du terrain." },
            ].map(({ Icon, title, text }) => (
              <article key={title} className="bg-panel p-7">
                <Icon className="size-5" />
                <h3 className="h3 mt-6">{title}</h3>
                <p className="mt-2 text-sm text-copy">{text}</p>
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
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">{m.role}</p>
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
