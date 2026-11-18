"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { MaterialIcon } from "@/components/ui/material-symbol";

type Result = { type: "formations" | "logiciels" | "actualites" | "posts"; id: number; title: string; excerpt: string; href: string };
const typeIcon = { formations: "school", logiciels: "download", actualites: "newspaper", posts: "forum" } as const;

const PAGES = [
  { href: "/formations", label: "Formations", icon: "school", keywords: "formation cours compétence apprendre programme" },
  { href: "/formations-en-ligne", label: "Formations en ligne", icon: "videocam", keywords: "distance vidéo web en direct cours" },
  { href: "/logiciels", label: "Logiciels", icon: "download", keywords: "logiciel outil télécharger application numérique" },
  { href: "/scolia", label: "SCOLIA Pro", icon: "menu_book", keywords: "schoolia école gestion scolaire élèves apprenants finances" },
  { href: "/projets", label: "Projets digitaux", icon: "folder_open", keywords: "projet digital services solutions" },
  { href: "/forum", label: "Forum d’entraide", icon: "forum", keywords: "entraide communauté discussion" },
  { href: "/partenariat", label: "Partenariat", icon: "handshake", keywords: "collaboration partenaires" },
  { href: "/aide", label: "Centre d’aide", icon: "help", keywords: "assistance support problème contact" },
];

const normalizeSearch = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Fenêtre de recherche (chargée seulement à la première ouverture, voir SearchPalette). */
export function SearchDialog({ open, onOpenChange: setOpen }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("search");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    if (!open) return;
    const q = query.trim().slice(0, 100);
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = window.setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        setLoading(false);
        setError(false);
        return;
      }
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`/api/recherche?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search unavailable");
        const data: { results?: Result[] } = await response.json();
        if (!controller.signal.aborted) setResults(Array.isArray(data.results) ? data.results : []);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, q.length < 2 ? 0 : 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, open]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router, setOpen],
  );

  const typed = query.trim().slice(0, 100);
  const pageMatches = typed.length < 2 ? PAGES : PAGES.filter((page) => normalizeSearch(`${page.label} ${page.keywords}`).includes(normalizeSearch(typed))).slice(0, 5);
  const grouped = results.reduce<Record<string, Result[]>>((acc, r) => ((acc[r.type] ??= []).push(r), acc), {});

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[8vh] z-50 w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-xl border bg-panel shadow-lg focus:outline-none data-[state=open]:animate-fade-up">
          <DialogPrimitive.Title className="sr-only">{tn("searchLabel")}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{t("hint")}</DialogPrimitive.Description>
          <Command shouldFilter={false} label={tn("searchLabel")}>
            <div className="flex items-center gap-3 border-b px-4">
              <MaterialIcon name="search" size={22} className="text-muted" />
              <Command.Input value={query} onValueChange={setQuery} placeholder={t("placeholder")} className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted focus-visible:ring-0 focus-visible:ring-offset-0" autoFocus />
              {loading ? <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden /> : null}
              <DialogPrimitive.Close className="inline-flex size-8 items-center justify-center rounded-full text-muted hover:bg-panel-2" aria-label="Fermer">
                <MaterialIcon name="close" size={19} />
              </DialogPrimitive.Close>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
              {typed.length >= 2 && !loading && !error && results.length === 0 && pageMatches.length === 0 ? <Command.Empty className="px-4 py-10 text-center text-sm text-muted">{t("empty")}</Command.Empty> : null}
              {error ? <div role="status" className="jp-search-status mx-2 my-2 rounded-lg px-3 py-3 text-xs text-copy">{locale === "en" ? "Live results are temporarily unavailable. You can still open the pages below." : "La recherche en direct est momentanément indisponible. Vous pouvez toujours ouvrir les rubriques proposées."}</div> : null}
              {(["formations", "logiciels", "actualites", "posts"] as const).map((type) =>
                grouped[type]?.length ? (
                  <Command.Group key={type} heading={t(`sections.${type}`)} className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted">
                    {grouped[type]!.map((r) => {
                      const icon = typeIcon[r.type];
                      return (
                        <Command.Item key={`${r.type}-${r.id}`} value={`${r.type}-${r.id}`} onSelect={() => go(r.href)} className="flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-sm data-[selected=true]:bg-panel-2">
                          <span className="icon-box mt-0.5 size-8">
                            <MaterialIcon name={icon} size={19} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-ink">{r.title}</span>
                            <span className="block truncate text-xs text-muted">{r.excerpt}</span>
                          </span>
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                ) : null,
              )}
              {pageMatches.length > 0 ? (
                <Command.Group heading={t("sections.pages")} className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted">
                  {pageMatches.map(({ href, label, icon }) => (
                    <Command.Item key={href} value={href} onSelect={() => go(href)} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm data-[selected=true]:bg-panel-2">
                      <MaterialIcon name={icon} size={19} className="text-muted" />
                      <span className="font-medium text-ink">{label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}
              {typed.length >= 2 ? (
                <Command.Item value="__all" onSelect={() => go(`/recherche?q=${encodeURIComponent(typed)}`)} className="mt-1 flex cursor-pointer items-center justify-between rounded-md border-t px-3 py-3 text-sm font-medium text-ink data-[selected=true]:bg-panel-2">
                  {t("seeAllResults")} <MaterialIcon name="arrow_forward" size={19} />
                </Command.Item>
              ) : null}
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
