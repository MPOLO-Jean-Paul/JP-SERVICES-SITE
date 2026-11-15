import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Crown, Globe, Lock, UserRound } from "lucide-react";
import { JitsiRoom } from "@/components/live/jitsi-room";
import { ShareButtons } from "@/components/site/share-buttons";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getLiveSession } from "@/server/services/content";
import { getCurrentUser } from "@/server/auth/session";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const row = await getLiveSession(Number((await params).id)).catch(() => null);
  return { title: row ? `Salle : ${row.session.titre}` : "Salle de visioconférence", robots: { index: false } };
}

export default async function VisioPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const row = await getLiveSession(id);
  if (!row || row.session.statut === "annulee") notFound();
  const s = row.session;
  const user = await getCurrentUser();
  if (s.acces === "membres" && !user) redirect(`/connexion?redirect_to=${encodeURIComponent(`/visio/${id}`)}`);
  const locale = await getLocale();
  const isHost = Boolean(user?.isAdmin);
  const isOver = s.statut === "terminee";
  const end = new Date(s.dateDebut.getTime() + Math.max(15, s.dureeMinutes) * 60_000);
  return (
    <>
      <section className="border-b bg-canvas-soft">
        <div className="shell flex flex-col gap-4 py-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/formations-en-ligne" className="inline-flex items-center gap-2 text-sm font-medium text-copy hover:text-ink"><ArrowLeft className="size-4" /> Formations en ligne</Link>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {s.statut === "en_cours" ? <Badge tone="danger">En direct</Badge> : isOver ? <Badge tone="neutral">Terminée</Badge> : <Badge tone="brand">Planifiée</Badge>}
              <Badge tone={s.acces === "public" ? "success" : "neutral"}>{s.acces === "public" ? <Globe /> : <Lock />}{s.acces === "public" ? "Tout public" : "Membres"}</Badge>
              {isHost ? <Badge tone="warning"><Crown /> Vous êtes l’hôte</Badge> : null}
            </div>
            <h1 className="h1 mt-3">{s.titre}</h1>
            {row.formationTitre ? <p className="mt-1 font-semibold text-primary">{row.formationTitre}</p> : null}
          </div>
          <ShareButtons title={s.titre} path={`/visio/${id}`} text={`Rejoignez la formation en ligne « ${s.titre} » organisée par JP-Services`} />
        </div>
      </section>
      <section className="section pt-8">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            {isOver ? (
              <div className="card flex flex-col items-center p-12 text-center"><CheckCircle2 className="size-12 text-emerald-600" /><h2 className="h2 mt-4">Cette session est terminée</h2><p className="mt-2 max-w-md text-copy">Merci d’avoir participé. Consultez le programme pour rejoindre la prochaine session en direct.</p><Link href="/formations-en-ligne" className={buttonVariants({ className: "mt-6" })}>Voir les prochaines sessions</Link></div>
            ) : (
              <JitsiRoom roomName={s.roomName} displayName={user?.displayName ?? ""} isHost={isHost} locale={locale} subject={s.titre} />
            )}
            {s.description ? <div className="card mt-6 p-6"><h2 className="h3">À propos de cette session</h2><p className="mt-2 whitespace-pre-line text-copy">{s.description}</p></div> : null}
          </div>
          <aside className="space-y-6">
            <div className="card p-6">
              <h2 className="h3">Informations</h2>
              <dl className="mt-4 space-y-3 text-sm text-copy">
                <div className="flex gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" /><dd>{formatDate(s.dateDebut, "fr", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd></div>
                <div className="flex gap-3"><Clock className="mt-0.5 size-4 shrink-0 text-primary" /><dd>{s.dureeMinutes} min · fin prévue vers {formatDate(end, "fr", { hour: "2-digit", minute: "2-digit" })}</dd></div>
                {s.formateur ? <div className="flex gap-3"><UserRound className="mt-0.5 size-4 shrink-0 text-primary" /><dd>{s.formateur}</dd></div> : null}
              </dl>
            </div>
            <div className="card p-6">
              <h2 className="h3">{isHost ? "Conseils pour l’hôte" : "Avant d’entrer"}</h2>
              <ul className="mt-3 space-y-2 text-sm text-copy">
                {isHost ? (
                  <><li>Entrez en premier pour devenir modérateur de la salle.</li><li>Activez votre caméra et vérifiez le partage d’écran avant le début.</li><li>Passez la session « en direct » depuis l’administration pour la mettre en avant.</li></>
                ) : (
                  <><li>Autorisez le micro et la caméra si vous souhaitez intervenir.</li><li>Le micro est coupé par défaut à l’entrée dans la salle.</li><li>Sur téléphone, l’application gratuite Jitsi Meet peut être proposée pour plus de confort.</li></>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
