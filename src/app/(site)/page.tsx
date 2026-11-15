import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, CalendarCheck, Check, CircleDot, Download, FolderKanban, GraduationCap, Handshake, Lock, MessagesSquare, Search, ShieldCheck, Sparkles, Users, Video } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { CountUp } from "@/components/home/count-up";
import { Marquee } from "@/components/home/marquee";
import { Cover } from "@/components/visuals/cover";
import { PlatformPreview, ScoliaPreview } from "@/components/visuals/mockups";
import { getHomeStats, listActualites } from "@/server/services/content";
import { listUpcomingFormations } from "@/server/services/formations";
import { getCurrentUser } from "@/server/auth/session";
import { cn, excerpt, formatDate, formatPrice } from "@/lib/utils";
import { jsonLd, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

const DOMAINS = ["Développement web", "Bureautique professionnelle", "Data & analyse", "Marketing digital", "Gestion scolaire", "Entrepreneuriat", "Sécurité informatique", "Design graphique"];

export default async function HomePage() {
  const [stats, formations, articles, user] = await Promise.all([
    getHomeStats().catch(() => ({ formations: 0, membres: 0, logiciels: 0, telechargements: 0, sessions: 0 })),
    listUpcomingFormations(3).catch(() => []),
    listActualites(4).catch(() => []),
    getCurrentUser(),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@type": "EducationalOrganization", name: "JP-Services", url: SITE_URL, logo: `${SITE_URL}/icons/icon-512.png`, address: { "@type": "PostalAddress", addressLocality: "Lubumbashi", addressCountry: "CD" }, sameAs: ["https://www.youtube.com/@jp-services-v8d", "https://www.linkedin.com/in/jp-services-b51940381"] })} />

      {/* ───────── Héros ───────── */}
      <section className="relative overflow-hidden">
        <div className="bg-grid fade-mask pointer-events-none absolute inset-0" aria-hidden />
        <div className="glow pointer-events-none absolute inset-x-0 top-0 h-[520px]" aria-hidden />
        <div className="shell relative pb-20 pt-16 sm:pt-20 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <Link href="/scolia" className="pill animate-fade-up group">
              <span className="rounded-full bg-ink px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-canvas">Nouveau</span>
              SCOLIA Pro, la gestion scolaire sans Excel
              <ArrowRight className="size-3.5 text-muted transition group-hover:translate-x-0.5" />
            </Link>
            <h1 className="h-display mx-auto mt-7 max-w-4xl animate-fade-up [animation-delay:60ms]">
              Apprenez les compétences
              <br className="hidden sm:block" /> <span className="text-gradient">qui font avancer vos projets.</span>
            </h1>
            <p className="lead mx-auto mt-6 max-w-2xl animate-fade-up [animation-delay:120ms]">Formations pratiques, sessions en direct, logiciels vérifiés et une communauté d’entraide : JP-Services vous accompagne de la première leçon jusqu’au projet abouti, à Lubumbashi et en ligne.</p>
            <div className="mt-9 flex animate-fade-up flex-wrap items-center justify-center gap-3 [animation-delay:180ms]">
              <Link href="/formations" className={buttonVariants({ variant: "dark", size: "xl" })}>
                Explorer les formations <ArrowRight />
              </Link>
              <Link href={user ? "/profil" : "/inscription"} className={buttonVariants({ variant: "outline", size: "xl" })}>
                {user ? "Ouvrir mon espace" : "Créer un compte gratuit"}
              </Link>
            </div>
            <ul className="mt-8 flex animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted [animation-delay:240ms]">
              {["Sans engagement", "À votre rythme", "Accompagnement humain"].map((p) => (
                <li key={p} className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-ink" /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto mt-16 max-w-5xl animate-fade-up [animation-delay:300ms]">
            <div className="absolute -inset-x-10 -bottom-10 top-16 rounded-[40px] bg-brand-500/10 blur-3xl" aria-hidden />
            <PlatformPreview className="relative" />
          </div>
        </div>
      </section>

      {/* ───────── Domaines ───────── */}
      <section className="border-y bg-canvas-soft py-5">
        <Marquee items={DOMAINS} />
      </section>

      {/* ───────── Bento des services ───────── */}
      <section className="section">
        <div className="shell">
          <SectionHeading kicker="Une plateforme, six espaces" title="Tout ce qu’il faut pour apprendre, pratiquer et construire." text="Chaque espace répond à un moment précis de votre parcours. Ils partagent le même compte, les mêmes notifications et la même exigence de qualité." />
          <div className="mt-14 grid gap-4 md:grid-cols-6">
            {/* Formations */}
            <Link href="/formations" className="card card-hover group relative overflow-hidden p-7 md:col-span-4">
              <div className="flex items-start justify-between">
                <span className="icon-box">
                  <GraduationCap />
                </span>
                <ArrowUpRight className="size-5 text-muted transition group-hover:text-ink" />
              </div>
              <h3 className="h3 mt-6">Formations structurées</h3>
              <p className="mt-2 max-w-md text-copy">Des parcours par domaine et par niveau, avec programme détaillé, tarif annoncé et prochaine session. Vous organisez ensuite votre planning.</p>
              <div className="mt-6 grid gap-2 sm:grid-cols-3" aria-hidden>
                {[["developpement", "Développement web", "8 semaines"], ["bureautique-gestion", "Bureautique", "4 semaines"], ["data-numerique", "Data & Power BI", "5 semaines"]].map(([p, t, d]) => (
                  <div key={t} className="overflow-hidden rounded-lg border">
                    <Cover seed={t!} palette={p} className="h-16" />
                    <div className="p-2.5">
                      <p className="truncate text-xs font-medium">{t}</p>
                      <p className="font-mono text-[10px] text-muted">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Link>
            {/* Live */}
            <Link href="/formations-en-ligne" className="card card-hover group relative overflow-hidden bg-brand-950 p-7 text-white md:col-span-2">
              <div className="bg-grid absolute inset-0 opacity-40" aria-hidden />
              <div className="relative flex h-full flex-col">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-500 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                  <CircleDot className="size-3" /> Live
                </span>
                <h3 className="h3 mt-6 text-white">Sessions en direct</h3>
                <p className="mt-2 text-sm text-white/70">Visioconférence intégrée au site, sans installation. Un lien à partager par WhatsApp ou Telegram.</p>
                <ul className="mt-6 space-y-2" aria-hidden>
                  {[["Mar.", "18:00", "Atelier HTML & CSS"], ["Jeu.", "17:30", "Excel : tableaux croisés"]].map(([d, h, t]) => (
                    <li key={t} className="flex items-center gap-3 rounded-lg bg-white/[0.06] px-3 py-2 ring-1 ring-white/10">
                      <span className="font-mono text-[10px] uppercase text-white/50">{d}<br />{h}</span>
                      <span className="text-xs font-medium">{t}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium">
                  Voir le programme <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
            {/* Logiciels */}
            <Link href="/logiciels" className="card card-hover group p-7 md:col-span-2">
              <span className="icon-box">
                <Download />
              </span>
              <h3 className="h3 mt-6">Logiciels vérifiés</h3>
              <p className="mt-2 text-sm text-copy">Version, taille, plateforme et licence sur chaque fiche. Fichiers contrôlés avant publication.</p>
              <p className="mt-5 font-mono text-xs text-muted">
                <CountUp value={stats.telechargements} /> téléchargements
              </p>
            </Link>
            {/* Projets */}
            <Link href="/projets" className="card card-hover group p-7 md:col-span-2">
              <span className="icon-box">
                <FolderKanban />
              </span>
              <h3 className="h3 mt-6">Projets accompagnés</h3>
              <p className="mt-2 text-sm text-copy">Présentez une idée, suivez son analyse et recevez un retour de l’équipe dans votre espace.</p>
              <div className="mt-5 flex items-center gap-1.5" aria-hidden>
                {["Soumission", "Analyse", "Retour"].map((s, i) => (
                  <span key={s} className={cn("rounded-full border px-2 py-0.5 font-mono text-[10px]", i < 2 ? "border-ink text-ink" : "text-muted")}>
                    {s}
                  </span>
                ))}
              </div>
            </Link>
            {/* Forum */}
            <Link href="/forum" className="card card-hover group p-7 md:col-span-2">
              <span className="icon-box">
                <MessagesSquare />
              </span>
              <h3 className="h3 mt-6">Forum d’entraide</h3>
              <p className="mt-2 text-sm text-copy">Posez vos questions, partagez vos ressources et aidez les autres membres à progresser.</p>
              <p className="mt-5 font-mono text-xs text-muted">
                <CountUp value={stats.membres} /> membres actifs
              </p>
            </Link>
            {/* Programme */}
            <div className="card relative overflow-hidden p-7 md:col-span-3">
              <span className="icon-box">
                <CalendarCheck />
              </span>
              <h3 className="h3 mt-6">Un programme à votre rythme</h3>
              <p className="mt-2 max-w-md text-sm text-copy">Après inscription, choisissez vos modules et jusqu’à trois créneaux par semaine. L’équipe valide votre planning et vous prévient à chaque étape.</p>
              <div className="mt-6 grid grid-cols-3 gap-2" aria-hidden>
                {[["Lundi", "09:00 – 12:00"], ["Mercredi", "14:00 – 17:00"], ["Samedi", "10:00 – 13:00"]].map(([d, h]) => (
                  <div key={d} className="rounded-lg border bg-canvas-soft p-3">
                    <p className="text-xs font-medium">{d}</p>
                    <p className="font-mono text-[10px] text-muted">{h}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Partenariat */}
            <Link href="/partenariat" className="card card-hover group relative overflow-hidden p-7 md:col-span-3">
              <div className="flex items-start justify-between">
                <span className="icon-box">
                  <Handshake />
                </span>
                <ArrowUpRight className="size-5 text-muted transition group-hover:text-ink" />
              </div>
              <h3 className="h3 mt-6">Partenariats institutionnels</h3>
              <p className="mt-2 max-w-md text-sm text-copy">Écoles, associations et entreprises : co-construisons des programmes de formation, du mécénat et des actions communautaires.</p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                Proposer une collaboration <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Chiffres ───────── */}
      <section className="border-y bg-canvas-soft">
        <div className="shell">
          <dl className="grid grid-cols-2 divide-x divide-y border-x lg:grid-cols-4 lg:divide-y-0">
            {[
              [stats.formations, "Formations au catalogue"],
              [stats.membres, "Membres inscrits"],
              [stats.logiciels, "Logiciels publiés"],
              [stats.telechargements, "Téléchargements"],
            ].map(([v, l]) => (
              <div key={l as string} className="px-6 py-10 sm:px-8">
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{l as string}</dt>
                <dd className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  <CountUp value={v as number} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────── Méthode ───────── */}
      <section className="section">
        <div className="shell grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeading kicker="Comment ça marche" title="De la découverte à la compétence, en quatre étapes claires." text="Une méthode simple, éprouvée en salle comme à distance, qui transforme la motivation en progression mesurable." />
            <Link href="/inscription" className={cn(buttonVariants({ variant: "dark", size: "lg" }), "mt-8")}>
              Commencer maintenant <ArrowRight />
            </Link>
          </div>
          <ol className="relative space-y-4">
            {[
              [Search, "Choisissez", "Comparez les formations par domaine, niveau, durée et tarif. Chaque fiche présente le programme complet avant l’inscription."],
              [BookOpen, "Inscrivez-vous", "Créez votre compte en une minute, inscrivez-vous et activez les alertes de la formation pour ne rien manquer."],
              [CalendarCheck, "Planifiez", "Sélectionnez vos modules et vos disponibilités. L’équipe confirme le planning et vous en informe."],
              [BadgeCheck, "Progressez", "Pratiquez sur des cas concrets, en salle ou en direct, posez vos questions au forum et passez à votre projet."],
            ].map(([I, t, d], i) => {
              const Ic = I as typeof Search;
              return (
                <li key={t as string} className="card reveal flex gap-5 p-6">
                  <span className="font-mono text-sm text-muted">0{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Ic className="size-5" />
                      <h3 className="h3">{t as string}</h3>
                    </div>
                    <p className="mt-2 text-copy">{d as string}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ───────── Prochaines sessions ───────── */}
      <section className="section border-t bg-canvas-soft">
        <div className="shell">
          <SectionHeading
            kicker="Prochaines sessions"
            title="Les formations qui démarrent bientôt."
            action={
              <Link href="/formations" className={buttonVariants({ variant: "outline" })}>
                Tout le catalogue <ArrowRight />
              </Link>
            }
          />
          {formations.length ? (
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {formations.map((f) => (
                <Link key={f.id} href={`/formations/${f.id}`} className="card card-hover group overflow-hidden">
                  <Cover seed={f.id} palette={f.domain.slug} label={f.domain.label} className="aspect-[16/9]" />
                  <div className="p-6">
                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted">
                      <span>{formatDate(f.dateDebut, "fr", { day: "numeric", month: "short" })}</span>
                      <span>{f.duree}</span>
                    </div>
                    <h3 className="h3 mt-3 transition group-hover:text-primary">{f.titre}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-copy">{excerpt(f.description, 120)}</p>
                    <div className="mt-5 flex items-center justify-between border-t pt-4">
                      <span className="text-sm font-semibold">{formatPrice(f.prix)}</span>
                      <span className="inline-flex items-center gap-1 text-sm text-muted transition group-hover:text-ink">
                        Découvrir <ArrowRight className="size-4" />
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
        <div className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-brand-600/30 blur-3xl" aria-hidden />
        <div className="shell relative grid gap-14 py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-28">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-300">Logiciel JP-Services</span>
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
          <ScoliaPreview className="border-white/10 text-ink" />
        </div>
      </section>

      {/* ───────── Engagements ───────── */}
      <section className="section">
        <div className="shell">
          <SectionHeading align="center" kicker="Nos engagements" title="Une exigence que l’on retrouve à chaque étape." />
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border bg-line md:grid-cols-3">
            {[
              [Sparkles, "Concret avant tout", "Chaque notion est démontrée puis pratiquée sur un cas réel. Vous repartez avec des réalisations, pas seulement des notes."],
              [Users, "Accompagnement humain", "Une équipe joignable, des formateurs disponibles et une communauté qui répond. Personne n’avance seul."],
              [Lock, "Données protégées", "Mots de passe chiffrés, sessions sécurisées, téléversements contrôlés. Vos informations ne sont jamais revendues."],
            ].map(([I, t, d]) => {
              const Ic = I as typeof Sparkles;
              return (
                <div key={t as string} className="bg-panel p-8">
                  <Ic className="size-5" />
                  <h3 className="h3 mt-5">{t as string}</h3>
                  <p className="mt-2 text-copy">{d as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── Actualités ───────── */}
      {articles.length ? (
        <section className="section border-t pt-20">
          <div className="shell">
            <SectionHeading
              kicker="Journal"
              title="Les dernières nouvelles de JP-Services."
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
                    <time className="font-mono text-xs uppercase tracking-wider text-muted" dateTime={a.datePublication.toISOString()}>
                      {formatDate(a.datePublication, "fr", { day: "2-digit", month: "short", year: "numeric" })}
                    </time>
                    <span>
                      <span className="block text-lg font-semibold tracking-tight transition group-hover:text-primary">{a.titre}</span>
                      <span className="mt-1 line-clamp-1 block text-sm text-copy">{excerpt(a.contenu, 160)}</span>
                    </span>
                    <ArrowUpRight className="hidden size-5 text-muted transition group-hover:text-ink sm:block" />
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
            <span className="icon-box">
              <ShieldCheck />
            </span>
            <p className="max-w-xl text-sm text-copy">
              <strong className="text-ink">Votre sécurité compte.</strong> JP-Services ne vous demandera jamais votre mot de passe ni un code de validation, par e-mail, téléphone ou messagerie.
            </p>
          </div>
          <Link href="/aide" className={buttonVariants({ variant: "outline" })}>
            <Video /> Centre d’aide
          </Link>
        </div>
      </section>
    </>
  );
}
