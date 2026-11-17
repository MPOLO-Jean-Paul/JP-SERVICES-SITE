"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Calendar, Clock, ListChecks, RotateCcw, Search } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn, formatDate, formatPrice } from "@/lib/utils";

export type CatalogItem = { id: number; titre: string; excerpt: string; search: string; domainSlug: string; domainLabel: string; domainIcon: string; niveau: string; prix: number; duree: string; dateDebut: string | null; dateTs: number; modules: number; image: string };
export type DomainChip = { slug: string; label: string; icon: string; count: number };


export function Catalog({ items, domains, levels }: { items: CatalogItem[]; domains: DomainChip[]; levels: string[] }) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [domain, setDomain] = useState(params.get("domaine") ?? "all");
  const [level, setLevel] = useState(params.get("niveau") ?? "all");
  const [price, setPrice] = useState(params.get("tarif") ?? "all");
  const [sort, setSort] = useState(params.get("tri") ?? "title");
  const deferredQ = useDeferredValue(q.trim().toLowerCase());

  // Garder le lien des filtres partageable sans déclencher une navigation
  // à chaque frappe ni faire défiler la page lors du premier affichage.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const sp = new URLSearchParams(window.location.search);
      for (const key of ["q", "domaine", "niveau", "tarif", "tri"]) sp.delete(key);
      if (q.trim()) sp.set("q", q.trim());
      if (domain !== "all") sp.set("domaine", domain);
      if (level !== "all") sp.set("niveau", level);
      if (price !== "all") sp.set("tarif", price);
      if (sort !== "title") sp.set("tri", sort);
      const qs = sp.toString();
      const next = `/formations${qs ? `?${qs}` : ""}${window.location.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (next !== current) router.replace(next, { scroll: false });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [q, domain, level, price, sort, router]);

  // Le raccourci indiqué dans l'interface doit réellement fonctionner.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      const editing = target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (event.key === "/" && !editing) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === "Escape" && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const list = items.filter((it) => (!deferredQ || it.search.includes(deferredQ)) && (domain === "all" || it.domainSlug === domain) && (level === "all" || it.niveau.toLowerCase() === level) && (price === "all" || (price === "free" ? it.prix <= 0 : it.prix > 0)));
    list.sort((a, b) => (sort === "price-asc" ? a.prix - b.prix : sort === "price-desc" ? b.prix - a.prix : sort === "date" ? a.dateTs - b.dateTs : a.titre.localeCompare(b.titre, "fr")));
    return list;
  }, [items, deferredQ, domain, level, price, sort]);

  const dirty = q !== "" || domain !== "all" || level !== "all" || price !== "all" || sort !== "title";
  const reset = () => {
    setQ("");
    setDomain("all");
    setLevel("all");
    setPrice("all");
    setSort("title");
  };

  return (
    <div id="catalogue">
      <div className="card jp-catalogue-filters reveal p-4 sm:p-5" role="search" aria-label="Filtrer les formations">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <label className="relative block">
            <span className="sr-only">Rechercher une formation</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input ref={searchInputRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par titre, compétence ou domaine…" className="field h-11 pl-10 pr-10" autoComplete="off" />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-panel-2 px-1.5 text-[10px] font-semibold text-muted sm:block">/</kbd>
          </label>
          <label className="block text-xs font-medium text-muted">
            Niveau
            <Select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1 h-11 text-sm text-ink">
              <option value="all">Tous les niveaux</option>
              {levels.map((l) => (
                <option key={l} value={l.toLowerCase()}>
                  {l}
                </option>
              ))}
            </Select>
          </label>
          <label className="block text-xs font-medium text-muted">
            Accès
            <Select value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 h-11 text-sm text-ink">
              <option value="all">Tous les tarifs</option>
              <option value="free">Gratuit</option>
              <option value="paid">Payant</option>
            </Select>
          </label>
          <label className="block text-xs font-medium text-muted">
            Trier par
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-1 h-11 text-sm text-ink">
              <option value="title">Pertinence</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="date">Prochaine session</option>
            </Select>
          </label>
        </div>
      </div>

      {domains.length ? (
        <div className="reveal mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Filtrer par domaine">
          <button type="button" aria-pressed={domain === "all"} onClick={() => setDomain("all")} className={cn("inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition", domain === "all" ? "border-ink bg-ink text-canvas" : "bg-panel text-copy hover:border-line-strong hover:text-ink")}>
            Tous <span className="rounded-full bg-black/10 px-1.5 text-xs dark:bg-white/15">{items.length}</span>
          </button>
          {domains.map((d) => (
            <button key={d.slug} type="button" aria-pressed={domain === d.slug} onClick={() => setDomain(d.slug)} className={cn("inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition", domain === d.slug ? "border-ink bg-ink text-canvas" : "bg-panel text-copy hover:border-line-strong hover:text-ink")}>
              {d.label} <span className="rounded-full bg-black/10 px-1.5 text-xs dark:bg-white/15">{d.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="reveal mt-8 flex items-center justify-between gap-4">
        <h2 className="h3" aria-live="polite">
          <strong>{filtered.length}</strong> formation{filtered.length > 1 ? "s" : ""} à découvrir
        </h2>
        {dirty ? (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw /> Réinitialiser les filtres
          </Button>
        ) : null}
      </div>

      {filtered.length ? (
        <div className="jp-catalogue-results mt-6" aria-label="Résultats des formations">
          {filtered.map((f, index) => (
            <article key={f.id} className="jp-catalogue-item group animate-fade-in">
              <div className="jp-catalogue-number" aria-hidden="true">{String(index+1).padStart(2,"0")}</div>
              <div className="jp-catalogue-content">
                <div className="flex items-center justify-between text-[11px] text-muted font-medium">
                  <span>{f.niveau}</span>
                  <span>{f.duree || "Durée à confirmer"}</span>
                </div>
                <h3 className="h3 mt-3">
                  <Link href={`/formations/${f.id}`} className="hover:text-primary">
                    {f.titre}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm text-copy">{f.excerpt}</p>
                <dl className="jp-catalogue-metadata mt-5 grid grid-cols-3 gap-3 border-t pt-4 text-xs">
                  <div>
                    <dt className="inline-flex items-center gap-1 text-muted">
                      <Clock className="size-3.5" /> Durée
                    </dt>
                    <dd className="mt-0.5 font-medium">{f.duree || "À confirmer"}</dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-1 text-muted">
                      <Calendar className="size-3.5" /> Session
                    </dt>
                    <dd className="mt-0.5 font-medium">{f.dateDebut ? formatDate(f.dateDebut, "fr", { day: "numeric", month: "short", year: "numeric" }) : "À annoncer"}</dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-1 text-muted">
                      <ListChecks className="size-3.5" /> Programme
                    </dt>
                    <dd className="mt-0.5 font-medium">{f.modules ? `${f.modules} module${f.modules > 1 ? "s" : ""}` : "Parcours guidé"}</dd>
                  </div>
                </dl>
                <div className="jp-catalogue-footer mt-5 flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-xs text-muted">Tarif</span>
                    <strong className={cn("text-lg font-semibold", f.prix <= 0 && "text-success")}>{formatPrice(f.prix)}</strong>
                  </div>
                  <Link href={`/formations/${f.id}`} className="jp-catalogue-action inline-flex min-h-10 items-center gap-2 border-b border-line-strong px-1 text-[12px] font-semibold transition-colors group-hover:border-primary group-hover:text-primary">
                    Voir la formation <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState className="mt-6" icon={Search} title="Aucune formation ne correspond" text="Modifiez votre recherche ou réinitialisez les filtres pour afficher tout le catalogue." action={<Button onClick={reset}>Afficher toutes les formations</Button>} />
      )}
    </div>
  );
}
