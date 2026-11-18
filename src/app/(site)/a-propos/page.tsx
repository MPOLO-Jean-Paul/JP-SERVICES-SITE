import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gem, HeartHandshake, Lightbulb, Mail, MapPin, ScanEye, Users } from "lucide-react";
import { Linkedin } from "@/components/brand/social-icons";
import { PageHeader } from "@/components/site/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { listEquipe } from "@/server/services/content";
import { getHomeStats } from "@/server/services/content";
import { pageMetadata } from "@/lib/seo";
import { CtaBand } from "@/components/site/cta-band";

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
      <PageHeader illustration="/illustrations/a-propos-equipe.svg" tone="violet" title="À propos de JP-Services" icon={Users} text="L’excellence numérique à votre portée. Nous transformons les idées en projets concrets et les projets en résultats." />
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

      <section className="section border-y bg-canvas-soft" aria-labelledby="mission-title">
        <div className="shell">
          <div className="jp-section-intro-center">
            <p className="jp-overline">Mission et vision</p>
            <h2 id="mission-title">Pourquoi nous faisons ce métier.</h2>
          </div>
          <div className="jp-mission-grid">
            <article className="jp-mission-card reveal">
              <Image src="/illustrations/formateur-en-ligne.svg" width={400} height={400} alt="" unoptimized loading="lazy" className="jp-mission-art" />
              <p className="jp-mission-kicker">Notre mission</p>
              <h3>Rendre le numérique accessible et utile à tous.</h3>
              <p className="jp-justify">Former les jeunes et les professionnels aux compétences numériques, et donner aux entreprises, aux écoles et aux organisations des outils fiables qui simplifient leur travail au quotidien : formations pratiques, applications, sites, logiciels métiers et accompagnement.</p>
            </article>
            <article className="jp-mission-card jp-mission-card-dark reveal">
              <Image src="/illustrations/a-propos-equipe.svg" width={400} height={400} alt="" unoptimized loading="lazy" className="jp-mission-art" />
              <p className="jp-mission-kicker">Notre vision</p>
              <h3>Une jeunesse rénovée, qui crée ses propres solutions.</h3>
              <p className="jp-justify">Nous voulons voir une génération capable de concevoir les outils numériques dont son pays a besoin, de Lubumbashi à toute la République démocratique du Congo. C’est le sens de notre devise : « Ensemble pour une jeunesse rénovée ».</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="values-title">
        <div className="shell">
          <div className="jp-section-intro-center">
            <p className="jp-overline">Nos valeurs</p>
            <h2 id="values-title">Ce qui guide chacune de nos actions.</h2>
            <p>Cinq engagements concrets, que nous appliquons à chaque formation, chaque projet et chaque logiciel.</p>
          </div>
          <div className="jp-values reveal-stagger">
            {[
              { Icon: Gem, tone: "blue", title: "L’excellence", text: "Un travail soigné dans le moindre détail : chaque formation est préparée sur des cas réels, chaque logiciel est testé sur le terrain avant d’être livré." },
              { Icon: ScanEye, tone: "violet", title: "La transparence", text: "Des programmes clairs, des tarifs annoncés à l’avance, des délais tenus et des données personnelles protégées." },
              { Icon: HeartHandshake, tone: "red", title: "La proximité", text: "Une équipe joignable et à l’écoute, présente à Lubumbashi comme à distance, qui accompagne chacun à son rythme." },
              { Icon: Lightbulb, tone: "amber", title: "L’innovation utile", text: "Des solutions modernes pensées pour les réalités locales : connexion limitée, réseau d’établissement, fonctionnement hors ligne." },
              { Icon: Users, tone: "mint", title: "L’esprit d’équipe", text: "Nous avançons ensemble, avec nos apprenants, nos clients et nos partenaires : la réussite de l’un profite à tous." },
            ].map(({ Icon, tone, title, text }) => (
              <article key={title} className="jp-value" data-tone={tone}>
                <span className="jp-service-icon"><Icon aria-hidden /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeading align="center" kicker="L’équipe" title="Les visages derrière le code." text="Formateurs, développeurs et accompagnateurs : une équipe engagée pour votre progression." />
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
      <CtaBand title="Travaillons ensemble." text="Formation, application, site ou logiciel : parlons de votre projet et de la meilleure façon de le mener." href="/contact" label="Nous contacter" secondary={{ href: "/services", label: "Nos services" }} />
    </>
  );
}
