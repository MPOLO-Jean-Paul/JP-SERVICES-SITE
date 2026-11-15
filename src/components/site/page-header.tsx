import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = { href?: string; label: string };

export function PageHeader({ title, icon: Icon, crumbs, text, actions, className }: { title: string; icon?: LucideIcon; crumbs?: Crumb[]; text?: string; actions?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden border-b", className)}>
      <div className="bg-grid fade-mask pointer-events-none absolute inset-0" aria-hidden />
      <div className="shell relative flex flex-col gap-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:py-16">
        <div className="min-w-0">
          <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
            <Link href="/" className="hover:text-ink">
              Accueil
            </Link>
            {(crumbs ?? [{ label: title }]).map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="size-3" aria-hidden />
                {c.href ? (
                  <Link href={c.href} className="hover:text-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-copy">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
          <div className="mt-5 flex items-center gap-4">
            {Icon ? (
              <span className="icon-box">
                <Icon aria-hidden />
              </span>
            ) : null}
            <h1 className="h1">{title}</h1>
          </div>
          {text ? <p className="lead mt-4 max-w-2xl">{text}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
