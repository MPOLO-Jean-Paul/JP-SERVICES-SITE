import Link from "next/link";
import { ArrowRight, Bell, CalendarCheck, Download, FolderKanban, GraduationCap, Handshake, LifeBuoy, Mail, MessagesSquare, Send, UserPlus, Users, Video } from "lucide-react";
import { AdminPage, Panel, StatCard } from "@/components/admin/ui";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { AdminIcon } from "@/components/admin/icon";
import { adminStats, recentActivity } from "@/server/services/admin";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const [s, recent] = await Promise.all([adminStats(), recentActivity()]);
  const todo = [
    { n: s.pendingPlannings, label: "planning(s) à valider", href: "/admin/horaires", Icon: CalendarCheck },
    { n: s.projectsPending, label: "projet(s) à analyser", href: "/admin/projets", Icon: FolderKanban },
    { n: s.tickets, label: "demande(s) de support", href: "/admin/support", Icon: LifeBuoy },
    { n: s.partnerships, label: "demande(s) de partenariat", href: "/admin/partenariats", Icon: Handshake },
  ].filter((t) => t.n > 0);
  return (
    <AdminPage title="Tableau de bord" text="Vue d’ensemble de la plateforme : communauté, catalogue, contenus et demandes à traiter.">
      {todo.length ? (
        <Panel title="À traiter" text="Les demandes en attente d’une action de l’équipe.">
          <ul className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">{todo.map(({ n, label, href, Icon }) => <li key={href}><Link href={href} className="flex items-center gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-amber-900 hover:border-amber-400 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"><Icon className="size-5" /><span><strong className="text-xl">{n}</strong> {label}</span><ArrowRight className="ml-auto size-4" /></Link></li>)}</ul>
        </Panel>
      ) : null}
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard icon={Users} label="Comptes utilisateurs" value={s.users} href="/admin/utilisateurs" hint={s.pendingActivations ? `${s.pendingActivations} en attente d’activation` : undefined} />
        <StatCard icon={GraduationCap} label="Formations publiées" value={s.formations} href="/admin/formations" tone="info" hint={`${s.enrollments} inscriptions`} />
        <StatCard icon={Download} label="Logiciels" value={s.logiciels} href="/admin/logiciels" tone="success" />
        <StatCard icon={Video} label="Sessions en ligne à venir" value={s.live} href="/admin/live" tone="warning" />
        <StatCard icon={MessagesSquare} label="Publications du forum" value={s.posts} href="/admin/forum" />
        <StatCard icon={Send} label="Messages reçus" value={s.messages} href="/admin/messages" tone="info" />
        <StatCard icon={Mail} label="Abonnés newsletter" value={s.newsletter} href="/admin/newsletter" tone="success" />
        <StatCard icon={Bell} label="Plannings en attente" value={s.pendingPlannings} href="/admin/horaires" tone={s.pendingPlannings ? "warning" : "brand"} />
      </div>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-6">
        <Panel title="Derniers inscrits" actions={<Link href="/admin/utilisateurs" className="text-sm font-semibold text-primary">Tout voir</Link>}>
          <ul className="divide-y">{recent.users.map((u) => <li key={u.id} className="flex items-center gap-3 py-2.5 text-sm"><UserPlus className="size-4 text-muted" /><span className="min-w-0 flex-1 truncate"><strong>{`${u.prenom} ${u.nom}`.trim() || u.email}</strong> <span className="text-muted">{u.email}</span></span><span className="text-xs text-muted">{formatDateTime(u.date)}</span></li>)}{!recent.users.length ? <li className="py-6 text-center text-sm text-muted">Aucun compte.</li> : null}</ul>
        </Panel>
        <Panel title="Demandes de planning" actions={<Link href="/admin/horaires" className="text-sm font-semibold text-primary">Gérer</Link>}>
          <ul className="divide-y">{recent.plannings.map((p) => <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm"><span className="min-w-0 flex-1 truncate"><strong>{p.formation}</strong> <span className="text-muted">{p.user}</span></span><Badge tone={p.statut === "valide" ? "success" : p.statut === "refuse" ? "danger" : "warning"}>{p.statut}</Badge></li>)}{!recent.plannings.length ? <li className="py-6 text-center text-sm text-muted">Aucune demande.</li> : null}</ul>
        </Panel>
        <Panel title="Derniers messages" actions={<Link href="/admin/messages" className="text-sm font-semibold text-primary">Boîte de réception</Link>}>
          <ul className="divide-y">{recent.messages.map((m) => <li key={m.id} className="py-2.5 text-sm"><strong>{m.sujet}</strong><span className="block text-xs text-muted">{m.nom} · {formatDateTime(m.date)}</span></li>)}{!recent.messages.length ? <li className="py-6 text-center text-sm text-muted">Aucun message.</li> : null}</ul>
        </Panel>
        <Panel title="Derniers projets" actions={<Link href="/admin/projets" className="text-sm font-semibold text-primary">Analyser</Link>}>
          <ul className="divide-y">{recent.projects.map((p) => <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm"><span className="min-w-0 flex-1 truncate font-medium">{p.titre}</span><Badge tone={["valide", "approuve"].includes(p.statut) ? "success" : p.statut === "en_attente" ? "warning" : "danger"}>{p.statut}</Badge></li>)}{!recent.projects.length ? <li className="py-6 text-center text-sm text-muted">Aucun projet.</li> : null}</ul>
        </Panel>
      </div>
      <Panel title="Toutes les rubriques">
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{ADMIN_NAV.filter((i) => i.href !== "/admin").map((i) => <Link key={i.href} href={i.href} className="flex items-start gap-3 rounded-lg border p-4 transition hover:border-primary/50 hover:bg-panel-2"><span className="icon-box"><AdminIcon name={i.icon} className="size-4" /></span><span><strong className="block text-sm">{i.label}</strong><span className="text-xs text-muted">{i.description}</span></span></Link>)}</div>
      </Panel>
    </AdminPage>
  );
}
