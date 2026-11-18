"use client";
import { useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
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
      <nav className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 scrollbar-thin" aria-label="Administration">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-4">
            <p className="px-3 pb-1.5 text-[12px] font-semibold text-muted">{group.charAt(0).toUpperCase() + group.slice(1).toLowerCase()}</p>
            <ul className="space-y-0.5">{items.map((i) => <li key={i.href}><Link href={i.href} aria-current={isActive(i.href) ? "page" : undefined} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-copy transition hover:bg-panel-2 hover:text-ink", isActive(i.href) && "bg-panel text-ink shadow-xs ring-1 ring-line hover:bg-panel")}><AdminIcon name={i.icon} className="size-4" /> {i.label}</Link></li>)}</ul>
          </div>
        ))}
        {!Object.keys(groups).length ? <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted" role="status">Aucune rubrique trouvée. Modifiez votre recherche.</p> : null}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg p-2"><Avatar name={user.displayName} src={user.photoProfil} size={36} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.displayName}</p><p className="truncate text-xs text-muted">{user.email}</p></div><ThemeMenu /></div>
        <div className="mt-1 flex gap-1"><Link href="/" className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-copy hover:bg-panel-2"><ExternalLink className="size-4" /> Voir le site</Link><form action={logoutAction} className="flex-1"><button className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-panel-2"><LogOut className="size-4" /> Quitter</button></form></div>
      </div>
    </div>
  );
  return (
    <>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <header className="glass sticky top-0 z-40 flex min-w-0 items-center gap-3 border-b px-4 py-3 lg:hidden">
          <DialogPrimitive.Trigger asChild>
            <button type="button" className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl hover:bg-panel-2"
              aria-label="Ouvrir le menu d’administration" aria-controls="jp-admin-mobile-menu" aria-expanded={open}>
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </DialogPrimitive.Trigger>
          <Link href="/admin" className="min-w-0 truncate text-sm font-semibold">Console d’administration</Link>
        </header>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="jp-scrim fixed inset-0 z-[100] bg-[#091426]/60 backdrop-blur-[2px] lg:hidden" />
          <DialogPrimitive.Content id="jp-admin-mobile-menu"
            className="fixed inset-y-0 left-0 z-[101] w-[min(330px,92vw)] overflow-hidden border-r bg-panel shadow-xl outline-none lg:hidden">
            <DialogPrimitive.Title className="sr-only">Menu d’administration</DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">Choisissez une rubrique de la console JP-Services.</DialogPrimitive.Description>
            {content}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      <aside className="jp-admin-desktop-sidebar sticky top-0 hidden h-dvh w-72 shrink-0 overflow-hidden border-r bg-canvas-soft lg:block"
        aria-label="Navigation de la console">{content}</aside>
    </>
  );
}
