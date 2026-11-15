"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowRight, BookOpen, Download, FileText, GraduationCap, Handshake, LifeBuoy, MessagesSquare, Newspaper, Search, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Result = { type: "formations" | "logiciels" | "actualites" | "posts"; id: number; title: string; excerpt: string; href: string };
const typeIcon = { formations: GraduationCap, logiciels: Download, actualites: Newspaper, posts: MessagesSquare } as const;

const PAGES = [
  { href: "/formations", label: "Formations", Icon: GraduationCap },
  { href: "/formations-en-ligne", label: "Formations en ligne", Icon: Video },
  { href: "/logiciels", label: "Logiciels", Icon: Download },
  { href: "/scolia", label: "SCOLIA Pro", Icon: BookOpen },
  { href: "/projets", label: "Projets digitaux", Icon: FileText },
  { href: "/forum", label: "Forum d’entraide", Icon: MessagesSquare },
  { href: "/partenariat", label: "Partenariat", Icon: Handshake },
  { href: "/aide", label: "Centre d’aide", Icon: LifeBuoy },
];

export function SearchPalette({ triggerClassName, compact }: { triggerClassName?: string; compact?: boolean }) {
  const t = useTranslations("search");
  const tn = useTranslations("nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName) && !(e.target as HTMLElement)?.isContentEditable)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      const clear = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(clear);
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const id = setTimeout(() => {
      setLoading(true);
      fetch(`/api/recherche?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((d: { results: Result[] }) => setResults(d.results ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(id);
  }, [query, open]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const grouped = results.reduce<Record<string, Result[]>>((acc, r) => ((acc[r.type] ??= []).push(r), acc), {});

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button type="button" aria-label={tn("searchLabel")} title={`${tn("searchLabel")} (Ctrl+K)`} className={cn("inline-flex h-10 items-center gap-2 rounded-full text-copy transition hover:bg-panel-2 hover:text-ink", compact ? "size-10 justify-center" : "border px-3.5 pr-2 text-sm", triggerClassName)}>
          <Search className="size-[1.1rem]" aria-hidden />
          {compact ? null : (
            <>
              <span className="hidden lg:inline">{tn("searchLabel")}</span>
              <kbd className="ml-1 hidden rounded-md border bg-panel-2 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted lg:inline">⌘K</kbd>
            </>
          )}
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[8vh] z-50 w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-xl border bg-panel shadow-lg focus:outline-none data-[state=open]:animate-fade-up">
          <DialogPrimitive.Title className="sr-only">{tn("searchLabel")}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{t("hint")}</DialogPrimitive.Description>
          <Command shouldFilter={false} label={tn("searchLabel")}>
            <div className="flex items-center gap-3 border-b px-4">
              <Search className="size-5 text-muted" aria-hidden />
              <Command.Input value={query} onValueChange={setQuery} placeholder={t("placeholder")} className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted focus-visible:ring-0 focus-visible:ring-offset-0" autoFocus />
              {loading ? <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden /> : null}
              <DialogPrimitive.Close className="inline-flex size-8 items-center justify-center rounded-full text-muted hover:bg-panel-2" aria-label="Fermer">
                <X className="size-4" />
              </DialogPrimitive.Close>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
              {query.trim().length >= 2 && !loading && results.length === 0 ? <Command.Empty className="px-4 py-10 text-center text-sm text-muted">{t("empty")}</Command.Empty> : null}
              {(["formations", "logiciels", "actualites", "posts"] as const).map((type) =>
                grouped[type]?.length ? (
                  <Command.Group key={type} heading={t(`sections.${type}`)} className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted">
                    {grouped[type]!.map((r) => {
                      const Icon = typeIcon[r.type];
                      return (
                        <Command.Item key={`${r.type}-${r.id}`} value={`${r.type}-${r.id}`} onSelect={() => go(r.href)} className="flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-sm data-[selected=true]:bg-panel-2">
                          <span className="icon-box mt-0.5 size-8">
                            <Icon />
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
              {query.trim().length < 2 ? (
                <Command.Group heading={t("sections.pages")} className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted">
                  {PAGES.map(({ href, label, Icon }) => (
                    <Command.Item key={href} value={href} onSelect={() => go(href)} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm data-[selected=true]:bg-panel-2">
                      <Icon className="size-4 text-muted" />
                      <span className="font-medium text-ink">{label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : null}
              {query.trim().length >= 2 ? (
                <Command.Item value="__all" onSelect={() => go(`/recherche?q=${encodeURIComponent(query.trim())}`)} className="mt-1 flex cursor-pointer items-center justify-between rounded-md border-t px-3 py-3 text-sm font-medium text-ink data-[selected=true]:bg-panel-2">
                  {t("seeAllResults")} <ArrowRight className="size-4" />
                </Command.Item>
              ) : null}
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
