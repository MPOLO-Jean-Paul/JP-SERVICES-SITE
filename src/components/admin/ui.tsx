import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPage({ title, text, actions, children }: { title: string; text?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="h2">{title}</h1>{text ? <p className="mt-1.5 max-w-2xl text-copy">{text}</p> : null}</div>{actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}</div>
      <div className="mt-8 space-y-8">{children}</div>
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, href, tone = "brand", hint }: { icon: LucideIcon; label: string; value: number | string; href?: string; tone?: "brand" | "success" | "warning" | "danger" | "info"; hint?: string }) {
  const tones = { brand: "text-ink", success: "text-emerald-600", warning: "text-amber-600", danger: "text-red-600", info: "text-brand-600" };
  const body = (<><div className="flex items-center justify-between"><span className={cn("icon-box", tones[tone])}><Icon /></span>{hint ? <span className="text-xs text-muted">{hint}</span> : null}</div><p className="mt-4 font-display text-3xl font-semibold tracking-tight">{typeof value === "number" ? value.toLocaleString("fr-FR") : value}</p><p className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</p></>);
  return href ? <Link href={href} className="card card-hover block p-5">{body}</Link> : <div className="card p-5">{body}</div>;
}

export function Panel({ title, text, actions, children, className }: { title?: string; text?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("card", className)}>
      {title ? <header className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">{title}</h2>{text ? <p className="text-sm text-muted">{text}</p> : null}</div>{actions}</header> : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function DataTable({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: string }) {
  const rows = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="table-jp min-w-full"><thead className="bg-panel-2/60"><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.length ? rows : <tr><td colSpan={head.length} className="py-10 text-center text-muted">{empty ?? "Aucun élément."}</td></tr>}</tbody></table>
    </div>
  );
}
