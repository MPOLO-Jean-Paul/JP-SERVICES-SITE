import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Globe, Lock, MonitorSmartphone, Radio, Share2, UserRound, Video, Mic } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { listLiveSessions } from "@/server/services/content";
import { formatDate } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({ title: "Formations en ligne", description: "Rejoignez les sessions de formation JP-Services en visioconférence, depuis votre ordinateur ou votre téléphone, sans rien installer.", path: "/formations-en-ligne" });

export default async function LivePage() {
  const rows = await listLiveSessions({ upcomingOnly: true }).catch(() => []);
  return (
    <>
      <PageHero
        eyebrow="Formations en ligne"
        title="Rejoignez une formation en direct, où que vous soyez."
        text="Explorez les sessions publiées, vérifiez leurs horaires et les modalités d’accès, puis rejoignez la salle lorsque la session est disponible."
        actions={
          <>
            <a href="#sessions" className={buttonVariants({ variant: "dark", size: "lg" })}>Voir les sessions <ArrowRight /></a>
            <Link href="/formations" className={buttonVariants({ variant: "outline", size: "lg" })}>Catalogue des formations</Link>
          </>
        }
        aside={<div className="jp-directory-guide"><span>PARTICIPER À UNE SESSION</span><p>Les prochaines dates sont publiées dans le calendrier ci-dessous.</p>{["Consulter les dates disponibles","Vérifier les conditions d’accès","Ouvrir votre session"].map((step,i)=><div className="jp-directory-guide-row" key={step}><small>{String(i+1).padStart(2,"0")}</small><strong>{step}</strong></div>)}</div>}
      />

      <section className="section" id="sessions">
        <div className="shell">
          <SectionHeading kicker="Programme en ligne" title="Les prochaines sessions en visioconférence." text="Consultez les horaires et les conditions d’accès. Certaines sessions peuvent nécessiter un compte membre." />
          {rows.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {rows.map(({ session: s, formationTitre }) => {
                const live = s.statut === "en_cours";
                return (
                  <article key={s.id} className="card card-hover reveal flex flex-col p-6">
                    <div className="flex items-center justify-between gap-2">
                      {live ? <Badge tone="danger"><Radio className="animate-pulse-soft" /> En direct</Badge> : <Badge tone="brand"><CalendarDays /> Planifiée</Badge>}
                      <Badge tone={s.acces === "public" ? "success" : "neutral"}>{s.acces === "public" ? <Globe /> : <Lock />}{s.acces === "public" ? "Tout public" : "Membres"}</Badge>
                    </div>
                    <h3 className="h3 mt-4"><Link href={`/visio/${s.id}`} className="hover:text-primary">{s.titre}</Link></h3>
                    {formationTitre ? <p className="mt-1 text-xs font-semibold text-primary">{formationTitre}</p> : null}
                    {s.description ? <p className="mt-2 flex-1 text-sm text-copy">{s.description}</p> : <span className="flex-1" />}
                    <dl className="mt-4 space-y-1.5 border-t pt-4 text-sm text-copy">
                      <div className="flex items-center gap-2"><CalendarDays className="size-4 text-muted" /><dd>{formatDate(s.dateDebut, "fr", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</dd></div>
                      <div className="flex items-center gap-2"><Clock className="size-4 text-muted" /><dd>{s.dureeMinutes} minutes</dd></div>
                      {s.formateur ? <div className="flex items-center gap-2"><UserRound className="size-4 text-muted" /><dd>{s.formateur}</dd></div> : null}
                    </dl>
                    <Link href={`/visio/${s.id}`} className={buttonVariants({ variant: live ? "accent" : "dark", className: "mt-5 w-full" })}>{live ? "Rejoindre maintenant" : "Ouvrir la salle"} <ArrowRight /></Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState className="mt-10" icon={Video} title="Aucune session en ligne programmée" text="Les prochaines visioconférences seront annoncées ici. Inscrivez-vous à une formation pour être notifié." action={<Link href="/formations" className={buttonVariants()}>Voir les formations</Link>} />
          )}
        </div>
      </section>

      <section className="section border-t bg-canvas-soft">
        <div className="shell">
          <SectionHeading kicker="Bien participer" title="Une connexion, un navigateur, et c’est parti." text="Nos salles de visioconférence fonctionnent sans installation, sur ordinateur comme sur téléphone." />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-line md:grid-cols-3">
            {[{ Icon: MonitorSmartphone, t: "Depuis n’importe quel appareil", d: "Ordinateur, tablette ou téléphone : la salle s’ouvre dans le navigateur. Sur mobile, l’application gratuite Jitsi Meet est proposée automatiquement si besoin." }, { Icon: Mic, t: "Caméra et micro maîtrisés", d: "Vous choisissez votre nom d’affichage, votre micro et votre caméra avant d’entrer. Le micro est coupé par défaut à l’arrivée." }, { Icon: Share2, t: "Invitation facile", d: "Chaque salle possède un lien unique à copier ou à partager directement par WhatsApp ou Telegram." }].map(({ Icon, t, d }) => (
              <article key={t} className="bg-panel p-8"><Icon className="size-5" /><h3 className="h3 mt-6">{t}</h3><p className="mt-2 text-copy">{d}</p></article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
