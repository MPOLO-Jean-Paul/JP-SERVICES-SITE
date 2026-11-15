import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bell, BellOff, BookOpen, CalendarDays, Clock } from "lucide-react";
import { MemberShell } from "@/components/member/member-shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton } from "@/components/forum/delete-button";
import { requireUser } from "@/server/auth/session";
import { countUnreadNotifications, listUserEnrollments } from "@/server/services/formations";
import { setFormationAlertsAction, unenrollAction } from "@/server/actions/member";
import { detectDomain, formatDate, uploadedImage } from "@/lib/utils";
import { Cover } from "@/components/visuals/cover";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mes formations", robots: { index: false } };
const STATUS: Record<string, { label: string; tone: "warning" | "success" | "danger" | "neutral" }> = { en_attente: { label: "Planning en attente", tone: "warning" }, valide: { label: "Planning validé", tone: "success" }, refuse: { label: "Planning à revoir", tone: "danger" }, brouillon: { label: "Brouillon", tone: "neutral" } };

export default async function AbonnementsPage() {
  const user = await requireUser("/abonnements");
  const [rows, unread] = await Promise.all([listUserEnrollments(user.id).catch(() => []), countUnreadNotifications(user.id).catch(() => 0)]);
  return (
    <MemberShell user={user} current="/abonnements" title="Mes formations" text="Retrouvez vos inscriptions, leurs dates clés et les préférences de notification associées." unread={unread}>
      {rows.length ? (
        <ul className="space-y-4">
          {rows.map((e) => { const f = e.formation; const st = e.planningStatut ? STATUS[e.planningStatut] ?? { label: e.planningStatut, tone: "neutral" as const } : null; const alerts = e.notificationsActive === 1; return (
            <li key={e.id} className="card overflow-hidden md:flex">
              {uploadedImage(f.image) ? <Image src={uploadedImage(f.image)!} alt="" width={320} height={240} className="aspect-[4/3] w-full object-cover md:w-56" /> : <Cover seed={f.id} palette={detectDomain(f.titre, f.description).slug} className="aspect-[4/3] w-full md:w-56" />}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-2">{st ? <Badge tone={st.tone}>{st.label}</Badge> : <Badge tone="brand">Programme à organiser</Badge>}{alerts ? <Badge tone="success"><Bell /> Alertes actives</Badge> : <Badge tone="neutral"><BellOff /> Alertes désactivées</Badge>}</div>
                <h2 className="h3 mt-3"><Link href={`/formations/${f.id}`} className="hover:text-primary">{f.titre}</Link></h2>
                <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-copy"><div className="inline-flex items-center gap-1.5"><CalendarDays className="size-4 text-muted" /> Début : {f.dateDebut ? formatDate(f.dateDebut) : "à annoncer"}</div><div className="inline-flex items-center gap-1.5"><Clock className="size-4 text-muted" /> {f.duree || "Durée à confirmer"}</div><div className="inline-flex items-center gap-1.5"><BookOpen className="size-4 text-muted" /> Inscrit le {formatDate(e.dateInscription)}</div></dl>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                  <Link href={`/formations/${f.id}/programme`} className={buttonVariants({ size: "sm" })}>{st ? "Voir mon programme" : "Organiser mon programme"} <ArrowRight /></Link>
                  <form action={setFormationAlertsAction.bind(null, f.id, !alerts)}><button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>{alerts ? <><BellOff /> Couper les alertes</> : <><Bell /> Activer les alertes</>}</button></form>
                  <div className="ml-auto"><DeleteButton action={unenrollAction.bind(null, f.id)} label="Se désinscrire" title="Se désinscrire de cette formation ?" text="Votre demande de programme associée sera également retirée." /></div>
                </div>
              </div>
            </li>
          ); })}
        </ul>
      ) : <EmptyState icon={BookOpen} title="Aucune formation suivie" text="Explorez le catalogue et choisissez le parcours adapté à votre objectif." action={<Link href="/formations" className={buttonVariants()}>Voir le catalogue <ArrowRight /></Link>} />}
    </MemberShell>
  );
}
