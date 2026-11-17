import Link from "next/link";
import { Bell, BookOpen, FolderKanban, Settings, UserRound, LayoutDashboard, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { SessionUser } from "@/server/auth/session";
import { cn } from "@/lib/utils";

const NAV: Array<{ href: string; label: string; shortLabel?: string; Icon: LucideIcon }> = [
  { href: "/profil", label: "Mon profil", Icon: UserRound },
  { href: "/abonnements", label: "Mes formations", shortLabel: "Formations", Icon: BookOpen },
  { href: "/notifications", label: "Notifications", Icon: Bell },
  { href: "/mes-projets", label: "Mes projets", shortLabel: "Projets", Icon: FolderKanban },
  { href: "/profil/modifier", label: "Paramètres du compte", shortLabel: "Paramètres", Icon: Settings },
];

type MemberShellProps = {
  user: SessionUser;
  current: string;
  title: string;
  text?: string;
  children: React.ReactNode;
  unread?: number;
};

export function MemberShell({ user, current, title, text, children, unread = 0 }: MemberShellProps) {
  const activeClass = "border-primary/30 bg-primary-soft text-primary shadow-xs lg:border-primary/20";
  const inactiveClass = "border-line bg-panel text-copy hover:border-primary/25 hover:bg-panel-2 hover:text-ink lg:border-transparent lg:bg-transparent";

  return (
    <div className="shell grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 py-6 sm:gap-8 sm:py-9 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-9 lg:py-12">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start" aria-label="Navigation de l’espace membre">
        <div className="card flex min-w-0 items-center gap-3 rounded-2xl p-3.5 shadow-xs sm:p-4 lg:p-5">
          <Avatar name={user.displayName} src={user.photoProfil} size={52} className="ring-2 ring-primary/15" />
          <div className="min-w-0 flex-1">
            <p className="break-words text-[15px] font-semibold leading-snug text-ink sm:text-base">{user.displayName}</p>
            <p className="mt-1 break-all text-xs leading-relaxed text-muted">{user.email}</p>
          </div>
        </div>

        <nav className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:mt-4 lg:grid-cols-1 lg:gap-1" aria-label="Rubriques de mon espace">
          {NAV.map(({ href, label, shortLabel, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={current === href ? "page" : undefined}
              title={label}
              className={cn(
                "group flex min-h-12 min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium leading-snug transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-sm lg:gap-3 lg:px-3.5",
                current === href ? activeClass : inactiveClass
              )}
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              <span className="min-w-0 break-words"><span className="lg:hidden">{shortLabel ?? label}</span><span className="hidden lg:inline">{label}</span></span>
              {href === "/notifications" && unread > 0 ? (
                <span className="ml-auto inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white" aria-label={`${unread} notifications non lues`}>{unread}</span>
              ) : null}
            </Link>
          ))}
          {user.isAdmin ? (
            <Link href="/admin" className={cn("flex min-h-12 min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-sm lg:gap-3 lg:px-3.5", inactiveClass)}>
              <LayoutDashboard className="size-[18px] shrink-0" aria-hidden="true" />
              <span className="min-w-0 break-words">Administration</span>
            </Link>
          ) : null}
        </nav>
      </aside>

      <section className="min-w-0" aria-labelledby="jp-member-heading">
        <header className="min-w-0 border-b border-line pb-5 sm:pb-6">
          <h1 id="jp-member-heading" className="max-w-full break-words font-display text-[clamp(1.75rem,4.4vw,2.55rem)] font-semibold leading-tight tracking-tight text-ink">{title}</h1>
          {text ? <p className="mt-2 max-w-2xl break-words text-sm leading-relaxed text-copy sm:text-base">{text}</p> : null}
        </header>
        <div className="mt-5 min-w-0 sm:mt-6">{children}</div>
      </section>
    </div>
  );
}
