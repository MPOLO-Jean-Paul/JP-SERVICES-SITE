"use client";

import Link from "next/link";
import { ArrowUpRight, Command, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { offerings, type CatalogueItem, type Kind } from "@/lib/content";

const pageByKind: Record<Kind, string> = {
  service: "/services",
  formation: "/formations",
  logiciel: "/logiciels",
  projet: "/projets",
  actualite: "/actualites"
};

const names: Record<Kind, string> = {
  service: "Expertise", formation: "Formation", logiciel: "Logiciel", projet: "Projet", actualite: "Actualité"
};

type State = "suggestions" | "typing" | "loading" | "ready" | "error";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [state, setState] = useState<State>("suggestions");
  const [source, setSource] = useState<"preview" | "database">("preview");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const suggestions = useMemo(() => offerings.filter(x => x.kind !== "actualite").slice(0, 5), []);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing = target?.closest("input,textarea,select,[contenteditable='true']");
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(value => !value);
      } else if (event.key === "/" && !editing && !event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);

  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      } else if (event.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled])'
        )).filter(el => el.getClientRects().length > 0);
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKeyDown);
      buttonRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const clean = query.trim().replace(/\s+/g, " ");
    if (!clean) {
      setItems([]);
      setState("suggestions");
      return;
    }
    if (clean.length < 2) {
      setItems([]);
      setState("typing");
      return;
    }
    if (clean.length > 80) {
      setItems([]);
      setState("error");
      return;
    }
    const controller = new AbortController();
    setState("loading");
    const id = window.setTimeout(() => {
      fetch("/api/search?q=" + encodeURIComponent(clean), { signal: controller.signal })
        .then(response => {
          if (!response.ok) throw new Error("search unavailable");
          return response.json() as Promise<{source: "preview" | "database"; items: CatalogueItem[]}>;
        })
        .then(data => {
          if (!Array.isArray(data.items)) throw new Error("invalid response");
          setItems(data.items);
          setSource(data.source);
          setState("ready");
        })
        .catch(error => {
          if (controller.signal.aborted) return;
          setItems([]);
          setState("error");
        });
    }, 230);
    return () => { window.clearTimeout(id); controller.abort(); };
  }, [open, query]);

  const shown = state === "suggestions" ? suggestions : items;

  return <>
    <button ref={buttonRef} type="button" className="icon-button global-search-button" title="Recherche globale (Ctrl+K)" aria-label="Ouvrir la recherche globale" aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <Search size={18} />
      <span className="search-shortcut" aria-hidden="true">⌘ K</span>
    </button>
    {open && (
      <div className="search-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
        <div ref={dialogRef} className="global-search-dialog" role="dialog" aria-modal="true" aria-labelledby="global-search-heading">
          <div className="global-search-top">
            <div className="global-search-input-row">
              <Search size={22} aria-hidden="true" />
              <h2 id="global-search-heading" className="sr-only">Rechercher sur JP-SERVICES</h2>
              <input ref={inputRef} aria-label="Rechercher sur toutes les rubriques" placeholder="Rechercher une expertise, un projet, une formation…" value={query} onChange={event => setQuery(event.target.value)} maxLength={80} />
              <button type="button" aria-label="Fermer la recherche" onClick={() => setOpen(false)} className="search-close"><X size={19}/></button>
            </div>
          </div>
          <div className="global-search-results" aria-live="polite">
            <div className="global-search-kicker">
              {state === "suggestions" ? "À DÉCOUVRIR" : state === "loading" ? "RECHERCHE EN COURS" : "RÉSULTATS"}
              <span>{state === "ready" ? items.length + " résultat(s)" : "JP / SEARCH"}</span>
            </div>
            {(state === "typing" || state === "error" || state === "loading" || (state === "ready" && shown.length === 0)) && (
              <p className="global-search-help">
                {state === "typing" ? "Saisissez au moins deux caractères." : state === "error" ? "La recherche est momentanément indisponible." : state === "loading" ? "Recherche dans les contenus…" : "Aucun résultat. Essayez un autre terme."}
              </p>
            )}
            {(state === "suggestions" || state === "ready") && shown.map(item =>
              <Link key={item.kind + item.id} className="global-result" onClick={() => setOpen(false)} href={pageByKind[item.kind] + "?q=" + encodeURIComponent(item.title) + "#catalogue"}>
                <span className="result-glyph"><Command size={17}/></span>
                <span className="result-text"><strong>{item.title}</strong><small>{names[item.kind]} · {item.category}</small></span>
                <ArrowUpRight size={18} className="result-arrow" aria-hidden="true"/>
              </Link>
            )}
            {(state === "ready" || state === "suggestions") && source === "preview" && state !== "suggestions" && <p className="global-search-notice">Sélection de présentation, informations à confirmer.</p>}
          </div>
          <div className="global-search-footer"><span><kbd>Échap</kbd> pour fermer</span><span><kbd>↵</kbd> choisir un résultat</span></div>
        </div>
      </div>
    )}
  </>;
}
