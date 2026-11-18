"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/ui/material-symbol";
import { cn } from "@/lib/utils";

// La fenêtre (cmdk + dialogue) n’est téléchargée qu’au besoin : survol, focus, raccourci ou clic.
const loadDialog = () => import("./search-dialog").then((m) => m.SearchDialog);
const SearchDialog = dynamic(loadDialog, { ssr: false });

export function SearchPalette({ triggerClassName, compact }: { triggerClassName?: string; compact?: boolean }) {
  const tn = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "") && !target?.isContentEditable)) {
        e.preventDefault();
        setRequested(true);
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const prefetch = () => { void loadDialog(); };

  return (
    <>
      <button
        type="button"
        aria-label={tn("searchLabel")}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={`${tn("searchLabel")} (Ctrl+K)`}
        onPointerEnter={prefetch}
        onFocus={prefetch}
        onClick={() => { setRequested(true); setOpen(true); }}
        className={cn("inline-flex h-10 items-center gap-2 rounded-full text-copy transition hover:bg-panel-2 hover:text-ink", compact ? "size-10 justify-center" : "border px-3.5 pr-2 text-sm", triggerClassName)}
      >
        <MaterialIcon name="search" size={20} />
        {compact ? null : (
          <>
            <span className="hidden lg:inline">{tn("searchLabel")}</span>
            <kbd className="ml-1 hidden rounded-md border bg-panel-2 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted lg:inline">⌘K</kbd>
          </>
        )}
      </button>
      {requested ? <SearchDialog open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
