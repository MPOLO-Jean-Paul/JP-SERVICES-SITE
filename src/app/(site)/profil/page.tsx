import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, BookOpen, CalendarDays, FolderKanban, GraduationCap, MessagesSquare, Settings, ShieldCheck, Compass } from "lucide-react";
import { MemberShell } from "@/components/member/member-shell";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/server/auth/session";
import { countUnreadNotifications, listUserEnrollments } from "@/server/services/formations";
import { listUserProjects } from "@/server/services/content";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mon profil", robots: { index: false } };

export default async function ProfilPage({ searchParams }: { searchParams: Promise<{ bienvenue?: string }> }) {
  const [sp, user] = await Promise.all([searchParams, requireUser("/profil")]);
  const [enrollments, projects, unread] = await Promise.all([listUserEnrollments(user.id).catch(() => []), listUserProjects(user.id).catch(() => []), countUnreadNotifications(user.id).catch(() => 0)]);
  return (
    <MemberShell user={user} current="/profil" title={`Bonjour ${user.prenom || user.displayName}`} text="Continuez votre parcours : formations, projets et notifications sont réunis ici." unread={unread}>
      {sp.bienvenue ? <Alert tone="success" className="mb-6" title="Bienvenue dans votre espace JP-Services !">Votre compte est actif. Complétez votre profil et choisissez votre première formation.</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {[[GraduationCap, enrollments.length, "formation(s) suivie(s)", "/abonnements"], [FolderKanban, projects.length, "projet(s) soumis", "/mes-projets"], [Bell, unread, "notification(s) non lue(s)", "/notifications"]].map(([I, n, l, href]) => { const Ic = I as typeof Bell; return <Link key={l as string} href={href as string} className="card card-hover p-5"><Ic className="size-5" /><p className="mt-4 font-display text-3xl font-semibold tracking-tight">{n as number}</p><p className="text-sm text-muted">{l as string}</p></Link>; })}
      </div>
      <section className="card mt-8 p-6">
        <div className="flex items-center justify-between"><h2 className="h3">Mes formations en cours</h2><Link href="/abonnements" className="text-sm font-semibold text-primary">Tout voir</Link></div>
        {enrollments.length ? <ul className="mt-4 divide-y">{enrollments.slice(0, 3).map((e) => <li key={e.id} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><Link href={`/formations/${e.formation.id}`} className="font-medium hover:text-primary">{e.formation.titre}</Link><p className="text-xs text-muted"><CalendarDays className="mr-1 inline size-3" /> Inscrit le {formatDate(e.dateInscription)} · Planning : {e.planningStatut ?? "à organiser"}</p></div><Link href={`/formations/${e.formation.id}/programme`} className="shrink-0 text-sm font-semibold text-primary">Programme <ArrowRight className="inline size-4" /></Link></li>)}</ul> : <div className="bg-dots mt-4 rounded-lg border p-8 text-center"><Compass className="mx-auto size-5" /><p className="mt-2 text-copy">Aucune formation pour le moment. Explorez le catalogue pour commencer.</p><Link href="/formations" className={buttonVariants({ className: "mt-4" })}>Choisir une formation</Link></div>}
      </section>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[[BookOpen, "Organiser un programme", "Choisissez vos modules et créneaux après inscription.", "/abonnements"], [MessagesSquare, "Participer au forum", "Posez vos questions et aidez les autres membres.", "/forum"], [Settings, "Paramètres du compte", "Mettez à jour vos informations et votre mot de passe.", "/profil/modifier"]].map(([I, t, d, href]) => { const Ic = I as typeof BookOpen; return <Link key={t as string} href={href as string} className="card card-hover p-5"><Ic className="size-5" /><h3 className="mt-3 font-semibold">{t as string}</h3><p className="mt-1 text-sm text-copy">{d as string}</p></Link>; })}
      </div>
      <p className="mt-8 flex items-center gap-2 text-xs text-muted"><ShieldCheck className="size-4" /> Vos données sont protégées. JP-Services ne vous demandera jamais votre mot de passe.</p>
    </MemberShell>
  );
}
