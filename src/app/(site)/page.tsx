import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { CountUp } from "@/components/home/count-up";
import { Cover } from "@/components/visuals/cover";
import { PlatformPreview, ScoliaPreview } from "@/components/visuals/mockups";
import { StepsOrnament } from "@/components/visuals/steps-ornament";
import { getHomeStats, listActualites } from "@/server/services/content";
import { listUpcomingFormations } from "@/server/services/formations";
import { getCurrentUser } from "@/server/auth/session";
import { cn, excerpt, formatDate, formatPrice } from "@/lib/utils";
import { jsonLd, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Un chiffre n’est montré que s’il est parlant : jamais de « 0 membre » sur une plateforme qui démarre. */
const STAT_MIN = { formations: 5, membres: 50, logiciels: 5, telechargements: 100 } as const;

export default async function HomePage() {
  const [stats, formations, articles, user] = await Promise.all([
    getHomeStats().catch(() => ({ formations: 0, membres: 0, logiciels: 0, telechargements: 0, sessions: 0 })),
    listUpcomingFormations(3).catch(() => []),
    listActualites(4).catch(() => []),
    getCurrentUser(),
  ]);

  const next = formations[0];
  const shownStats = (
    [
      [stats.formations, "formations au catalogue", STAT_MIN.formations],
      [stats.membres, "membres inscrits", STAT_MIN.membres],
      [stats.logiciels, "logiciels publiés", STAT_MIN.logiciels],
      [stats.telechargements, "téléchargements", STAT_MIN.telechargements],
    ] as const
  )
    .filter(([v, , min]) => v >= min)
    .map(([v, l]) => [v, l] as [number, string]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@type": "EducationalOrganization", name: "JP-Services", url: SITE_URL, logo: `${SITE_URL}/icons/icon-512.png`, address: { "@type": "PostalAddress", addressLocality: "Lubumbashi", addressCountry: "CD" }, sameAs: ["https://www.youtube.com/@jp-services-v8d", "https://www.linkedin.com/in/jp-services-b51940381"] })} />

      {/* ───────── Héros ───────── */}
      <section className="relative overflow-hidden">
        <div className="shell relative pb-16 pt-16 sm:pt-20 lg:pb-24 lg:pt-28">
          <div>
            <h1 className="h-display max-w-5xl">
              <span className="line-mask"><span>Apprenez les compétences</span></span>
              <span className="line-mask"><span>qui font avancer vos projets.</span></span>
            </h1>
            <p className="lead mt-7 max-w-xl animate-fade-up [animation-delay:200ms]">Formations pratiques, sessions en direct et logiciels vérifiés, à Lubumbashi et en ligne. De la première leçon jusqu’au projet abouti.</p>
            <div className="mt-9 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:280ms]">
              <Link href="/formations" className={cn(buttonVariants({ variant: "dark", size: "xl" }), "group")}>
                Explorer les formations <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link href={user ? "/profil" : "/inscription"} className={buttonVariants({ variant: "outline", size: "xl" })}>
                {user ? "Ouvrir mon espace" : "Créer un compte gratuit"}
              </Link>
            </div>
            {next ? (
              <Link href={`/formations/${next.id}`} className="group mt-10 flex max-w-full animate-fade-up flex-col gap-1 text-sm [animation-delay:360ms] sm:inline-flex sm:flex-row sm:items-center sm:gap-3">
                <span className="text-muted">Prochaine session</span>
                <span className="hidden h-4 w-px bg-line-strong sm:block" aria-hidden />
                <span className="flex min-w-0 items-center gap-3">
                  <span className="truncate font-medium">{next.titre}</span>
                  <span className="shrink-0 text-muted">{formatDate(next.dateDebut, "fr", { day: "numeric", month: "long" })}</span>
                  <ArrowRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
                </span>
              </Link>
            ) : null}
          </div>
          <div className="tilt-in relative isolate mt-16 lg:mt-20">
            <StepsOrnament className="absolute -top-[200px] right-8 -z-10 hidden h-[300px] lg:block" />
            <PlatformPreview className="relative shadow-lg" />
          </div>
        </div>
      </section>

      {/* ───────── Espaces ───────── */}
      <section className="section border-t">
        <div className="shell">
          <SectionHeading kicker="La plateforme" title="Six espaces, un seul compte." text="Chacun répond à un moment précis de votre parcours, avec les mêmes notifications et la même exigence." />
          <div className="reveal-stagger mt-14 grid gap-4 md:grid-cols-6">
            <Link href="/formations" className="card card-hover group relative overflow-hidden p-7 md:col-span-4">
              <div className="flex items-start justify-between gap-6">
                <h3 className="h3">Formations structurées</h3>
                <ArrowUpRight className="size-5 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
              <p className="mt-2 max-w-md text-copy">Parcours par domaine et par niveau : programme détaillé, tarif annoncé, prochaine session. Vous composez ensuite votre planning.</p>
              <div className="mt-7 grid gap-2 sm:grid-cols-3" aria-hidden>
                {[["developpement", "Développement web", "8 semaines"], ["bureautique-gestion", "Bureautique", "4 semaines"], ["data-numerique", "Data & Power BI", "5 semaines"]].map(([p, t, d]) => (
                  <div key={t} className="overflow-hidden rounded-lg border">
                    <Cover seed={t!} palette={p} className="h-20" />
                    <div className="p-2.5">
                      <p className="truncate text-xs font-medium">{t}</p>
                      <p className="text-[11px] text-muted">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Link>
            <Link href="/formations-en-ligne" className="card card-hover group relative overflow-hidden border-transparent bg-brand-950 p-7 text-white md:col-span-2">
              <div className="relative flex h-full flex-col">
                <span className="inline-flex w-fit items-center gap-2 text-xs font-medium text-white/80">
                  <span className="live-dot" /> En direct
                </span>
                <h3 className="h3 mt-5 text-white">Sessions en direct</h3>
                <p className="mt-2 text-sm text-white/65">Visioconférence intégrée au site, sans installation. Un lien à partager par WhatsApp ou Telegram.</p>
                <ul className="mt-6 space-y-2" aria-hidden>
                  {[["Mar.", "18:00", "Atelier HTML & CSS"], ["Jeu.", "17:30", "Excel : tableaux croisés"]].map(([d, h, t]) => (
                    <li key={t} className="flex items-center gap-3 rounded-lg bg-white/[0.06] px-3 py-2.5 ring-1 ring-white/10">
                      <span className="w-12 text-[11px] leading-tight text-white/50 tabular-nums">{d}<br />{h}</span>
                      <span className="text-xs font-medium">{t}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium">
                  Voir le programme <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
            {[
              ["/logiciels", "Logiciels vérifiés", "Version, taille, plateforme et licence sur chaque fiche. Fichiers contrôlés avant publication.", stats.telechargements >= STAT_MIN.telechargements ? `${stats.telechargements.toLocaleString("fr-FR")} téléchargements` : null],
              ["/projets", "Projets accompagnés", "Présentez une idée, suivez son analyse et recevez un retour de l’équipe dans votre espace.", null],
              ["/forum", "Forum d’entraide", "Posez vos questions, partagez vos ressources et aidez les autres membres à progresser.", stats.membres >= STAT_MIN.membres ? `${stats.membres.toLocaleString("fr-FR")} membres` : null],
            ].map(([href, t, d, meta]) => (
              <Link key={href} href={href!} className="card card-hover group flex flex-col p-7 md:col-span-2">
                <div className="flex items-start justify-between gap-6">
                  <h3 className="h3">{t}</h3>
                  <ArrowUpRight className="size-5 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                </div>
                <p className="mt-2 text-sm text-copy">{d}</p>
                {href === "/projets" ? (
                  <ol className="mt-6 flex items-center gap-2 text-[11px] font-medium" aria-hidden>
                    {["Soumission", "Analyse", "Retour"].map((s, i) => (
                      <li key={s} className="flex items-center gap-2">
                        <span className={cn("rounded-full px-2.5 py-1", i < 2 ? "bg-ink text-canvas" : "bg-panel-2 text-muted")}>{s}</span>
                        {i < 2 ? <span className="h-px w-3 bg-line-strong" /> : null}
                      </li>
                    ))}
                  </ol>
                ) : meta ? (
                  <p className="mt-6 text-xs text-muted tabular-nums">{meta}</p>
                ) : null}
              </Link>
            ))}
            <div className="card relative overflow-hidden p-7 md:col-span-3">
              <h3 className="h3">Un programme à votre rythme</h3>
              <p className="mt-2 max-w-md text-sm text-copy">Après l’inscription, choisissez vos modules et jusqu’à trois créneaux par semaine. L’équipe valide le planning et vous prévient à chaque étape.</p>
              <div className="mt-6 grid grid-cols-3 gap-2" aria-hidden>
                {[["Lundi", "09:00 – 12:00"], ["Mercredi", "14:00 – 17:00"], ["Samedi", "10:00 – 13:00"]].map(([d, h], i) => (
                  <div key={d} className={cn("rounded-lg border p-3", i === 1 ? "border-primary/40 bg-primary-soft" : "bg-canvas-soft")}>
                    <p className="text-xs font-medium">{d}</p>
                    <p className="text-[11px] text-muted tabular-nums">{h}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/partenariat" className="card card-hover group relative overflow-hidden p-7 md:col-span-3">
              <div className="flex items-start justify-between gap-6">
                <h3 className="h3">Partenariats institutionnels</h3>
                <ArrowUpRight className="size-5 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
              <p className="mt-2 max-w-md text-sm text-copy">Écoles, associations et entreprises : construisons ensemble des programmes de formation, du mécénat et des actions communautaires.</p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                Proposer une collaboration <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Chiffres : seulement ceux qui sont parlants ───────── */}
      {shownStats.length >= 2 ? (
        <section className="border-y bg-canvas-soft">
          <div className="shell">
            <dl className={cn("grid grid-cols-2 divide-x border-x", shownStats.length >= 4 ? "lg:grid-cols-4" : shownStats.length === 3 ? "lg:grid-cols-3" : "")}>
              {shownStats.map(([v, l]) => (
                <div key={l} className="px-6 py-10 sm:px-8">
                  <dd className="font-display text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                    <CountUp value={v} />
                  </dd>
                  <dt className="mt-2 text-sm text-muted">{l}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {/* ───────── Méthode ───────── */}
      <section className="section">
        <div className="shell">
          <SectionHeading
            kicker="La méthode"
            title="De la découverte à la compétence."
            action={
              <Link href="/inscription" className={cn(buttonVariants({ variant: "dark" }), "group")}>
                Commencer <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
          <div className="relative mt-14">
            <div className="absolute inset-x-0 top-0 h-px bg-line" aria-hidden />
            <div className="track-fill absolute inset-x-0 top-0 h-px bg-ink" aria-hidden />
            <ol className="grid gap-10 pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {[
                ["Choisir", "Comparez les formations par domaine, niveau, durée et tarif. Chaque fiche détaille le programme avant l’inscription."],
                ["S’inscrire", "Créez votre compte en une minute, inscrivez-vous et activez les alertes de la formation."],
                ["Planifier", "Sélectionnez vos modules et vos disponibilités. L’équipe confirme le planning et vous en informe."],
                ["Progresser", "Pratiquez sur des cas concrets, en salle ou en direct, puis passez à votre propre projet."],
              ].map(([t, d], i) => (
                <li key={t} className="reveal">
                  <span className="font-display text-sm font-semibold text-primary tabular-nums">0{i + 1}</span>
                  <h3 className="h3 mt-3">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-copy">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────── Prochaines sessions ───────── */}
      <section className="section border-t bg-canvas-soft">
        <div className="shell">
          <SectionHeading
            kicker="Calendrier"
            title="Les prochaines sessions."
            action={
              <Link href="/formations" className={buttonVariants({ variant: "outline" })}>
                Tout le catalogue <ArrowRight />
              </Link>
            }
          />
          {formations.length ? (
            <div className="reveal-stagger mt-12 grid gap-5 md:grid-cols-3">
              {formations.map((f) => (
                <Link key={f.id} href={`/formations/${f.id}`} className="card card-hover group overflow-hidden">
                  <Cover seed={f.id} palette={f.domain.slug} label={f.domain.label} className="aspect-[16/9]" />
                  <div className="p-6">
                    <p className="text-xs text-muted tabular-nums">
                      {formatDate(f.dateDebut, "fr", { day: "numeric", month: "long" })} · {f.duree}
                    </p>
                    <h3 className="h3 mt-3 transition group-hover:text-primary">{f.titre}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-copy">{excerpt(f.description, 120)}</p>
                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      <span className="text-sm font-semibold">{formatPrice(f.prix)}</span>
                      <span className="inline-flex items-center gap-1 text-sm text-muted transition group-hover:text-ink">
                        Découvrir <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card bg-dots mt-12 p-12 text-center">
              <p className="h3">Les prochaines sessions seront bientôt publiées.</p>
              <p className="mt-2 text-copy">Créez votre compte pour être averti dès l’ouverture des inscriptions.</p>
            </div>
          )}
        </div>
      </section>

      {/* ───────── SCOLIA Pro ───────── */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50 [--grid-line:rgb(255_255_255/0.05)]" aria-hidden />
        <div className="shell relative grid gap-14 py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-28">
          <div>
            <span className="text-sm font-medium text-brand-300">Logiciel JP-Services</span>
            <h2 className="h2 mt-4 text-white">SCOLIA Pro. La gestion scolaire, enfin fiable.</h2>
            <p className="mt-5 text-lg text-white/70">Secrétariat, caisse, recouvrement, notes, présences, personnel et paie dans un seul logiciel conçu pour les écoles privées de la RDC.</p>
            <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
              {["Reçus numérotés sans trou", "Journal d’audit infalsifiable", "Multiposte en réseau local", "Sauvegardes vérifiées", "Bulletins et cartes d’examen", "Fonctionne hors ligne"].map((p) => (
                <li key={p} className="flex items-center gap-2 text-white/80">
                  <Check className="size-4 text-brand-300" /> {p}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/scolia" className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-brand-950 transition hover:bg-white/90">
                Découvrir SCOLIA Pro <ArrowRight className="size-4" />
              </Link>
              <Link href="/contact?sujet=SCOLIA%20Pro" className="inline-flex h-11 items-center rounded-lg border border-white/20 px-5 text-sm font-medium transition hover:bg-white/10">
                Demander une démonstration
              </Link>
            </div>
          </div>
          <ScoliaPreview className="tilt-in border-white/10 text-ink" />
        </div>
      </section>

      {/* ───────── Engagements ───────── */}
      <section className="section">
        <div className="shell">
          <SectionHeading kicker="Nos engagements" title="La même exigence, à chaque étape." />
          <div className="reveal-stagger mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              ["Concret avant tout", "Chaque notion est démontrée puis pratiquée sur un cas réel. Vous repartez avec des réalisations, pas seulement des notes."],
              ["Un accompagnement humain", "Une équipe joignable, des formateurs disponibles et une communauté qui répond. Personne n’avance seul."],
              ["Des données protégées", "Mots de passe chiffrés, sessions sécurisées, fichiers contrôlés. Vos informations ne sont jamais revendues."],
            ].map(([t, d]) => (
              <div key={t} className="border-t border-line-strong pt-6">
                <h3 className="h3">{t}</h3>
                <p className="mt-2 text-copy">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Actualités ───────── */}
      {articles.length ? (
        <section className="section border-t pt-20">
          <div className="shell">
            <SectionHeading
              kicker="Actualités"
              title="Les dernières nouvelles."
              action={
                <Link href="/actualites" className={buttonVariants({ variant: "outline" })}>
                  Toutes les actualités <ArrowRight />
                </Link>
              }
            />
            <ul className="mt-12 divide-y border-y">
              {articles.map((a) => (
                <li key={a.id}>
                  <Link href={`/actualites/${a.id}`} className="group grid gap-2 py-6 transition sm:grid-cols-[160px_1fr_auto] sm:items-baseline sm:gap-8">
                    <time className="text-sm text-muted tabular-nums" dateTime={a.datePublication.toISOString()}>
                      {formatDate(a.datePublication, "fr", { day: "2-digit", month: "short", year: "numeric" })}
                    </time>
                    <span>
                      <span className="block text-lg font-semibold tracking-tight transition group-hover:text-primary">{a.titre}</span>
                      <span className="mt-1 line-clamp-1 block text-sm text-copy">{excerpt(a.contenu, 160)}</span>
                    </span>
                    <ArrowUpRight className="hidden size-5 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ───────── Confiance ───────── */}
      <section className="shell pb-4">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border bg-canvas-soft px-8 py-8 sm:flex-row">
          <div className="flex items-center gap-4">
            <ShieldCheck className="size-5 shrink-0" aria-hidden />
            <p className="max-w-xl text-sm text-copy">
              <strong className="text-ink">Sécurité du compte :</strong> JP-Services ne vous demandera jamais votre mot de passe ni un code de validation, par e-mail, téléphone ou messagerie.
            </p>
          </div>
          <Link href="/aide" className={buttonVariants({ variant: "outline" })}>
            Centre d’aide
          </Link>
        </div>
      </section>
    </>
  );
}
