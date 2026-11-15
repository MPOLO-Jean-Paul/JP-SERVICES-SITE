import Link from "next/link";
import { Bell, BookOpen, FolderKanban, Settings, UserRound, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { SessionUser } from "@/server/auth/session";
import { cn } from "@/lib/utils";

const NAV: Array<{ href: string; label: string; Icon: LucideIcon }> = [
  { href: "/profil", label: "Mon profil", Icon: UserRound },
  { href: "/abonnements", label: "Mes formations", Icon: BookOpen },
  { href: "/notifications", label: "Notifications", Icon: Bell },
  { href: "/mes-projets", label: "Mes projets", Icon: FolderKanban },
  { href: "/profil/modifier", label: "Paramètres du compte", Icon: Settings },
];

export function MemberShell({ user, current, title, text, children, unread = 0 }: { user: SessionUser; current: string; title: string; text?: string; children: React.ReactNode; unread?: number }) {
  return (
    <div className="shell grid gap-8 py-10 lg:grid-cols-[260px_1fr] lg:py-14">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card flex items-center gap-3 p-4"><Avatar name={user.displayName} src={user.photoProfil} size={48} /><div className="min-w-0"><p className="truncate font-semibold">{user.displayName}</p><p className="truncate text-xs text-muted">{user.email}</p></div></div>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:flex-col no-scrollbar" aria-label="Espace membre">
          {NAV.map(({ href, label, Icon }) => (
            <Link key={href} href={href} aria-current={current === href ? "page" : undefined} className={cn("inline-flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-copy transition hover:bg-panel-2 hover:text-ink", current === href && "bg-panel-2 text-ink hover:bg-panel-2")}>
              <Icon className="size-4" /> {label}
              {href === "/notifications" && unread > 0 ? <span className="ml-auto rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-white">{unread}</span> : null}
            </Link>
          ))}
          {user.isAdmin ? <Link href="/admin" className="inline-flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-copy hover:bg-panel-2 hover:text-ink">Administration</Link> : null}
        </nav>
      </aside>
      <div className="min-w-0">
        <div><h1 className="h1">{title}</h1>{text ? <p className="mt-2 text-copy">{text}</p> : null}</div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
