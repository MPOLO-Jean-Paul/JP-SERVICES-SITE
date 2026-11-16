"use client";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowDownToLine, Calendar, ExternalLink, HardDrive, MonitorSmartphone, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { cn, formatBytes, formatDate } from "@/lib/utils";

export type SoftwareItem = { id: number; nom: string; description: string; version: string; taille: number; plateforme: string; licence: string; image: string; telechargements: number; misAJour: string; categorieSlug: string; categorieNom: string; external: boolean; hasFile: boolean };
export type CategoryChip = { slug: string; nom: string; count: number };

export function SoftwareCatalog({ items, categories, platforms }: { items: SoftwareItem[]; categories: CategoryChip[]; platforms: string[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [sort, setSort] = useState("recent");
  const dq = useDeferredValue(q.trim().toLowerCase());
  const filtered = useMemo(() => {
    const list = items.filter((i) => (!dq || `${i.nom} ${i.description} ${i.categorieNom} ${i.plateforme}`.toLowerCase().includes(dq)) && (cat === "all" || i.categorieSlug === cat) && (platform === "all" || i.plateforme === platform));
    list.sort((a, b) => (sort === "name" ? a.nom.localeCompare(b.nom, "fr") : sort === "popular" ? b.telechargements - a.telechargements : b.misAJour.localeCompare(a.misAJour)));
    return list;
  }, [items, dq, cat, platform, sort]);
  const dirty = q || cat !== "all" || platform !== "all" || sort !== "recent";
  const reset = () => { setQ(""); setCat("all"); setPlatform("all"); setSort("recent"); };

  return (
    <div id="catalogue-logiciels">
      <div className="card reveal p-4 sm:p-5" role="search" aria-label="Filtrer les logiciels">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr]">
          <label className="relative block">
            <span className="sr-only">Rechercher un logiciel</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un logiciel, une catégorie, une plateforme…" className="field h-11 pl-10" />
          </label>
          <label className="block text-xs font-medium text-muted">Plateforme<Select value={platform} onChange={(e) => setPlatform(e.target.value)} className="mt-1 h-11 text-sm text-ink"><option value="all">Toutes les plateformes</option>{platforms.map((p) => <option key={p} value={p}>{p}</option>)}</Select></label>
          <label className="block text-xs font-medium text-muted">Trier par<Select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-1 h-11 text-sm text-ink"><option value="recent">Plus récents</option><option value="name">Nom</option><option value="popular">Plus téléchargés</option></Select></label>
        </div>
      </div>
      <div className="reveal mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Filtrer par catégorie">
        <button type="button" aria-pressed={cat === "all"} onClick={() => setCat("all")} className={cn("inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition", cat === "all" ? "border-ink bg-ink text-canvas" : "bg-panel text-copy hover:border-line-strong")}>Tous <span className="rounded-full bg-black/10 px-1.5 text-xs dark:bg-white/15">{items.length}</span></button>
        {categories.map((c) => (
          <button key={c.slug} type="button" aria-pressed={cat === c.slug} onClick={() => setCat(c.slug)} className={cn("inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition", cat === c.slug ? "border-ink bg-ink text-canvas" : "bg-panel text-copy hover:border-line-strong")}>{c.nom} <span className="rounded-full bg-black/10 px-1.5 text-xs dark:bg-white/15">{c.count}</span></button>
        ))}
      </div>
      <div className="reveal mt-8 flex items-center justify-between">
        <h2 className="h3" aria-live="polite"><strong>{filtered.length}</strong> logiciel{filtered.length > 1 ? "s" : ""}</h2>
        {dirty ? <Button variant="ghost" size="sm" onClick={reset}><RotateCcw /> Réinitialiser</Button> : null}
      </div>
      {filtered.length ? (
        <div className="jp-catalogue-results mt-6">
          {filtered.map((l, index) => (
            <article key={l.id} id={`logiciel-${l.id}`} className="jp-catalogue-item jp-software-item animate-fade-in scroll-mt-28">
              <div className="jp-catalogue-number" aria-hidden="true">{String(index+1).padStart(2,"0")}</div>
              <div className="jp-catalogue-content">
                <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="h3 truncate">{l.nom}</h3>{l.version ? <Badge tone="brand">v{l.version}</Badge> : null}</div>
                  <p className="mt-0.5 text-[11px] text-muted font-medium">{l.categorieNom}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-copy">{l.description || "Fiche en préparation."}</p>
              <dl className="jp-catalogue-metadata mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-4 text-xs text-copy">
                <div className="flex items-center gap-1.5"><MonitorSmartphone className="size-3.5 text-muted" /><dd className="truncate">{l.plateforme || "Multi-plateforme"}</dd></div>
                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-muted" /><dd className="truncate">{l.licence}</dd></div>
                <div className="flex items-center gap-1.5"><HardDrive className="size-3.5 text-muted" /><dd>{formatBytes(l.taille)}</dd></div>
                <div className="flex items-center gap-1.5"><Calendar className="size-3.5 text-muted" /><dd>{formatDate(l.misAJour, "fr", { day: "numeric", month: "short", year: "numeric" })}</dd></div>
              </dl>
              <div className="jp-catalogue-footer mt-5 flex items-center justify-between gap-3">
                <span className="text-xs text-muted"><strong className="text-sm text-ink">{l.telechargements.toLocaleString("fr-FR")}</strong> téléchargement{l.telechargements > 1 ? "s" : ""}</span>
                {l.hasFile || l.external ? (
                  <a href={`/telecharger/${l.id}`} className="jp-catalogue-action inline-flex min-h-10 items-center gap-2 border-b border-line-strong px-1 text-[12px] font-semibold transition-colors hover:border-primary hover:text-primary" rel="nofollow">{l.external ? <ExternalLink className="size-4" /> : <ArrowDownToLine className="size-4" />}{l.external ? "Accéder" : "Télécharger"}</a>
                ) : (
                  <span className="text-xs text-muted">Bientôt disponible</span>
                )}
              </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState className="mt-6" icon={Search} title="Aucun logiciel ne correspond" text="Modifiez votre recherche ou réinitialisez les filtres pour afficher toute la médiathèque." action={<Button onClick={reset}>Afficher tous les logiciels</Button>} />
      )}
    </div>
  );
}
