import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { MemberShell } from "@/components/member/member-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/server/auth/session";
import { countUnreadNotifications, listUserNotifications } from "@/server/services/formations";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/server/actions/member";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mes notifications", robots: { index: false } };

export default async function NotificationsPage() {
  const user = await requireUser("/notifications");
  const [items, unread] = await Promise.all([listUserNotifications(user.id).catch(() => []), countUnreadNotifications(user.id).catch(() => 0)]);
  return (
    <MemberShell user={user} current="/notifications" title="Mes notifications" text="Les informations utiles de vos formations, sans bruit." unread={unread}>
      {items.length ? (
        <>
          {unread > 0 ? <form action={markAllNotificationsReadAction} className="mb-4 flex justify-end"><button className={buttonVariants({ variant: "outline", size: "sm" })}><CheckCheck /> Tout marquer comme lu</button></form> : null}
          <ul className="jp-notification-list space-y-3">
            {items.map((n) => { const read = Number(n.lue) === 1; return (
              <li key={n.id} className={cn("card jp-member-list-card jp-notification-row p-4 sm:p-5", !read && "border-primary/40 bg-primary-soft/30")}>
                <div className="flex items-start gap-4">
                  <span className={cn("mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full", read ? "bg-panel-2 text-muted" : "bg-primary text-white")}><Bell className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted">{n.formationTitre} · {formatDateTime(n.dateEnvoi)}</p>
                      {!read ? <span className="jp-unread-indicator">Non lue</span> : null}
                    </div>
                    <h2 className="mt-1 font-semibold leading-snug text-ink">{n.titre}</h2>
                    <p className="mt-1 whitespace-pre-line text-sm text-copy">{n.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2"><Link href={`/formations/${n.formationId}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Voir la formation <ExternalLink className="size-3.5" /></Link>{!read ? <form action={markNotificationReadAction.bind(null, n.id)}><button type="submit" className="jp-notification-read-action text-sm font-medium text-muted hover:text-ink">Marquer comme lu</button></form> : null}</div>
                  </div>
                </div>
              </li>
            ); })}
          </ul>
        </>
      ) : <EmptyState icon={Bell} title="Vous êtes à jour" text="Les prochaines informations de vos formations apparaîtront ici." action={<Link href="/formations" className={buttonVariants({ variant: "outline" })}>Découvrir les formations</Link>} />}
    </MemberShell>
  );
}
