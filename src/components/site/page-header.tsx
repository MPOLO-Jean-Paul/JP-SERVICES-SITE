import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = { href?: string; label: string };

export function PageHeader({ title, crumbs, text, actions, className }: {
  title: string;
  icon?: LucideIcon;
  crumbs?: Crumb[];
  text?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("jp-page-heading border-b", className)}>
    <div className="shell jp-page-heading-layout">
      <div className="min-w-0">
        <nav aria-label="Fil d’Ariane" className="jp-breadcrumb">
          <Link href="/">Accueil</Link>
          {(crumbs ?? [{ label: title }]).map((c,i)=><span key={i} className="inline-flex min-w-0 items-center gap-1.5">
            <ChevronRight size={14} aria-hidden="true"/>
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </span>)}
        </nav>
        <h1>{title}</h1>
        {text ? <p className="jp-page-heading-lead">{text}</p> : null}
      </div>
      {actions ? <div className="jp-page-heading-actions">{actions}</div> : null}
    </div>
  </div>;
}
