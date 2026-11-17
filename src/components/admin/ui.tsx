import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPage({ title, text, actions, children }: { title: string; text?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="jp-admin-page mx-auto min-w-0 max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9 xl:px-10">
      <header className="flex min-w-0 flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h1 className="h2 break-words">{title}</h1>{text ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-copy sm:text-base">{text}</p> : null}</div>{actions ? <div className="flex min-w-0 flex-wrap gap-2">{actions}</div> : null}</header>
      <div className="mt-6 min-w-0 space-y-6 sm:mt-8 sm:space-y-8">{children}</div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, href, tone = "brand", hint }: { icon: LucideIcon; label: string; value: number | string; href?: string; tone?: "brand" | "success" | "warning" | "danger" | "info"; hint?: string }) {
  const tones = { brand: "text-ink", success: "text-emerald-600", warning: "text-amber-600", danger: "text-red-600", info: "text-brand-600" };
  const body = (<><div className="flex items-center justify-between"><span className={cn("icon-box", tones[tone])}><Icon /></span>{hint ? <span className="text-xs text-muted">{hint}</span> : null}</div><p className="mt-4 font-display text-[clamp(1.8rem,3vw,2.25rem)] font-semibold leading-none tracking-tight tabular-nums text-ink">{typeof value === "number" ? value.toLocaleString("fr-FR") : value}</p><p className="mt-2 text-xs font-semibold leading-snug text-copy sm:text-sm">{label}</p></>);
  return href ? <Link href={href} className="card card-hover jp-admin-stat block min-w-0 p-4 sm:p-5">{body}</Link> : <div className="card jp-admin-stat min-w-0 p-4 sm:p-5">{body}</div>;
}

export function Panel({ title, text, actions, children, className }: { title?: string; text?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("card jp-admin-panel min-w-0", className)}>
      {title ? <header className="flex min-w-0 flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><h2 className="font-semibold">{title}</h2>{text ? <p className="text-sm text-muted">{text}</p> : null}</div>{actions}</header> : null}
      <div className="min-w-0 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function DataTable({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  const rows = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return (
    <div role="region" aria-label="Tableau de données" tabIndex={0} className="jp-admin-table-scroll overflow-x-auto rounded-xl border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      <table className="table-jp min-w-full"><thead className="bg-panel-2/60"><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.length ? rows : <tr><td colSpan={head.length} className="py-10 text-center text-muted">{empty ?? "Aucun élément."}</td></tr>}</tbody></table>
    </div>
  );
}
