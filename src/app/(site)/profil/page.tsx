import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, BookOpen, CalendarDays, Compass, FolderKanban, GraduationCap, MessagesSquare, Settings, ShieldCheck } from "lucide-react";
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
  const [enrollments, projects, unread] = await Promise.all([
    listUserEnrollments(user.id).catch(() => []),
    listUserProjects(user.id).catch(() => []),
    countUnreadNotifications(user.id).catch(() => 0),
  ]);

  const stats = [
    { Icon: GraduationCap, value: enrollments.length, title: "Formations", hint: "Formations suivies", href: "/abonnements" },
    { Icon: FolderKanban, value: projects.length, title: "Projets", hint: "Projets soumis", href: "/mes-projets" },
    { Icon: Bell, value: unread, title: "Notifications", hint: "Non lues", href: "/notifications" },
  ];
  const shortcuts = [
    { Icon: BookOpen, title: "Organiser mes formations", text: "Retrouvez vos programmes et vos inscriptions.", href: "/abonnements" },
    { Icon: MessagesSquare, title: "Participer au forum", text: "Échangez avec les autres membres.", href: "/forum" },
    { Icon: Settings, title: "Paramètres du compte", text: "Mettez à jour votre profil et vos accès.", href: "/profil/modifier" },
  ];

  return (
    <MemberShell user={user} current="/profil" title={`Bonjour ${user.prenom || user.displayName}`} text="Continuez votre parcours : formations, projets et notifications sont réunis ici." unread={unread}>
      {sp.bienvenue ? (
        <Alert tone="success" className="mb-5 sm:mb-6" title="Bienvenue dans votre espace JP-Services !">
          Votre compte est actif. Complétez votre profil et choisissez votre première formation.
        </Alert>
      ) : null}

      <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" aria-label="Vue d’ensemble de mon compte">
        {stats.map(({ Icon, value, title, hint, href }, index) => (
          <Link
            key={href}
            href={href}
            aria-label={`${title} : ${value}. Ouvrir ${hint.toLowerCase()}.`}
            className={`card card-hover jp-member-stat group min-w-0 rounded-2xl p-4 shadow-xs transition-colors hover:border-primary/30 sm:p-5 ${index === 2 ? "col-span-2 sm:col-span-1" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </div>
            <p className="mt-4 font-display text-3xl font-semibold tabular-nums leading-none tracking-tight text-ink sm:mt-5">{value}</p>
            <h2 className="mt-2 break-words text-sm font-semibold text-ink">{title}</h2>
            <p className="mt-0.5 break-words text-xs leading-relaxed text-muted">{hint}</p>
          </Link>
        ))}
      </div>

      <section className="card mt-5 min-w-0 rounded-2xl p-4 shadow-xs sm:mt-7 sm:p-6" aria-labelledby="jp-member-formations-title">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <h2 id="jp-member-formations-title" className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">Mes formations en cours</h2>
          <Link href="/abonnements" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Tout voir <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {enrollments.length ? (
          <ul className="mt-4 divide-y divide-line">
            {enrollments.slice(0, 3).map((enrollment) => (
              <li key={enrollment.id} className="flex min-w-0 flex-col items-start gap-3 py-4 first:pt-2 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <Link href={`/formations/${enrollment.formation.id}`} className="break-words text-sm font-semibold leading-snug text-ink hover:text-primary sm:text-base">{enrollment.formation.titre}</Link>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs leading-relaxed text-muted">
                    <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                    <span>Inscrit le {formatDate(enrollment.dateInscription)}</span>
                    <span aria-hidden="true">·</span>
                    <span>Planning : {enrollment.planningStatut ?? "à organiser"}</span>
                  </p>
                </div>
                <Link href={`/formations/${enrollment.formation.id}/programme`} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Programme <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-dots mt-4 rounded-xl border border-line bg-panel-2/50 px-4 py-7 text-center sm:py-8">
            <span className="mx-auto inline-flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary"><Compass className="size-5" aria-hidden="true" /></span>
            <h3 className="mt-3 text-base font-semibold text-ink">Prêt à commencer une formation ?</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-copy">Parcourez le catalogue et choisissez votre première formation.</p>
            <Link href="/formations" className={buttonVariants({ className: "mt-4" })}>Découvrir les formations <ArrowRight /></Link>
          </div>
        )}
      </section>

      <section className="mt-5 sm:mt-7" aria-labelledby="jp-member-shortcuts-title">
        <h2 id="jp-member-shortcuts-title" className="mb-3 font-display text-lg font-semibold tracking-tight text-ink">Accès rapides</h2>
        <div className="grid min-w-0 gap-3 md:grid-cols-3">
          {shortcuts.map(({ Icon, title, text, href }) => (
            <Link key={href} href={href} className="card card-hover group flex min-w-0 items-center gap-3 rounded-2xl p-4 shadow-xs md:flex-col md:items-start md:gap-0 md:p-5">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-panel-2 text-primary"><Icon className="size-5" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1 md:mt-3">
                <h3 className="break-words text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-1 break-words text-xs leading-relaxed text-copy">{text}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-1 md:mt-3" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>Vos données sont protégées. JP-Services ne vous demandera jamais votre mot de passe.</span>
      </p>
    </MemberShell>
  );
}
