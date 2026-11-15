"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, Menu, Search, X } from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { LogoMark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { ThemeMenu } from "@/components/site/theme-menu";
import { AdminIcon } from "./icon";
import { cn } from "@/lib/utils";

export function AdminSidebar({ user, logoutAction }: { user: { displayName: string; email: string; photoProfil: string }; logoutAction: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }
  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    const items = ADMIN_NAV.filter((i) => !s || `${i.label} ${i.description} ${i.group}`.toLowerCase().includes(s));
    return items.reduce<Record<string, typeof items>>((acc, i) => ((acc[i.group] ??= []).push(i), acc), {});
  }, [q]);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/admin" className="flex items-center gap-2.5"><LogoMark className="size-8" /><span className="text-sm font-semibold tracking-tight">Console <span className="text-muted">d’administration</span></span></Link>
        <button type="button" onClick={() => setOpen(false)} className="inline-flex size-9 items-center justify-center rounded-full hover:bg-panel-2 lg:hidden" aria-label="Fermer"><X className="size-5" /></button>
      </div>
      <label className="relative mx-3 block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une rubrique…" className="field h-9 pl-9 text-sm" aria-label="Rechercher une rubrique" /></label>
      <nav className="mt-3 flex-1 overflow-y-auto px-3 scrollbar-thin" aria-label="Administration">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-4">
            <p className="px-3 pb-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted">{group}</p>
            <ul className="space-y-0.5">{items.map((i) => <li key={i.href}><Link href={i.href} aria-current={isActive(i.href) ? "page" : undefined} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-copy transition hover:bg-panel-2 hover:text-ink", isActive(i.href) && "bg-panel text-ink shadow-xs ring-1 ring-line hover:bg-panel")}><AdminIcon name={i.icon} className="size-4" /> {i.label}</Link></li>)}</ul>
          </div>
        ))}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg p-2"><Avatar name={user.displayName} src={user.photoProfil} size={36} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.displayName}</p><p className="truncate text-xs text-muted">{user.email}</p></div><ThemeMenu /></div>
        <div className="mt-1 flex gap-1"><Link href="/" className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-copy hover:bg-panel-2"><ExternalLink className="size-4" /> Voir le site</Link><form action={logoutAction} className="flex-1"><button className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-panel-2"><LogOut className="size-4" /> Quitter</button></form></div>
      </div>
    </div>
  );
  return (
    <>
      <header className="glass sticky top-0 z-40 flex items-center gap-3 border-b px-4 py-3 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="inline-flex size-10 items-center justify-center rounded-full hover:bg-panel-2" aria-label="Ouvrir le menu"><Menu className="size-5" /></button>
        <Link href="/admin" className="text-sm font-semibold">Console d’administration</Link>
      </header>
      <div className={cn("fixed inset-0 z-50 bg-black/55 lg:hidden", open ? "block" : "hidden")} onClick={() => setOpen(false)} aria-hidden />
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 shrink-0 border-r bg-panel transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:translate-x-0 lg:bg-canvas-soft", open ? "translate-x-0" : "-translate-x-full")}>{content}</aside>
    </>
  );
}
