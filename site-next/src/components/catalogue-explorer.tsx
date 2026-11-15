"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ChevronDown, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import type { CatalogueItem, Kind } from "@/lib/content";
import { formationDetailHref } from "@/lib/formation-programs";

type SourceState = "loading" | "preview" | "database" | "error";

export function CatalogueExplorer({ items, kind }: { items: CatalogueItem[]; kind: Kind }) {
  const [entries, setEntries] = useState<CatalogueItem[]>(items);
  const [source, setSource] = useState<SourceState>("loading");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tout");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("q");
    if (fromUrl) setQuery(fromUrl.slice(0, 80));
    const onNavigation = () => setQuery((new URLSearchParams(window.location.search).get("q") || "").slice(0, 80));
    window.addEventListener("popstate", onNavigation);
    return () => window.removeEventListener("popstate", onNavigation);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setSource("loading");
    fetch("/api/catalogue?kind=" + encodeURIComponent(kind), { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("catalogue unavailable");
        return response.json() as Promise<{ source: "preview" | "database"; items: CatalogueItem[] }>;
      })
      .then(data => {
        if (!Array.isArray(data.items)) throw new Error("invalid catalogue");
        setEntries(data.items);
        setSource(data.source);
        setCategory("Tout");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setEntries([]);
        setSource("error");
      });
    return () => controller.abort();
  }, [kind, reloadKey]);

  const categories = useMemo(() => ["Tout", ...Array.from(new Set(entries.map(item => item.category)))], [entries]);
  const filtered = useMemo(() => entries.filter(item => {
    const matchCategory = category === "Tout" || item.category === category;
    const searchable = [item.title, item.description, item.category, item.detail].join(" ").toLocaleLowerCase("fr");
    return matchCategory && searchable.includes(query.trim().toLocaleLowerCase("fr"));
  }), [entries, category, query]);

  const updateQuery = (next: string) => {
    setQuery(next);
    const url = new URL(window.location.href);
    if (next.trim()) url.searchParams.set("q", next.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  };

  return <div id="catalogue" className="catalogue-explorer">
    <div className="catalogue-status" aria-live="polite">
      <span className="catalogue-source">{source === "loading" ? "Chargement des publications…" : source === "database" ? "Catalogue publié · données actualisées" : source === "preview" ? "Sélection de présentation · informations à confirmer" : "Catalogue temporairement indisponible"}</span>
      {source !== "loading" && source !== "error" && <span className="catalogue-count">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>}
    </div>
    {source !== "error" && <div className="catalogue-toolbar">
      <div className="filter-tabs" role="group" aria-label="Filtrer par catégorie">
        {categories.map(c => <button type="button" key={c} className={category===c?"filter-tab active":"filter-tab"} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}
      </div>
      <label className="catalogue-search"><Search size={18} aria-hidden="true"/><span className="sr-only">Rechercher dans cette rubrique</span><input aria-label="Rechercher dans cette rubrique" placeholder="Rechercher…" value={query} onChange={event=>updateQuery(event.target.value)} maxLength={80}/></label>
    </div>}
    {source === "loading" && <div className="catalogue-loading" role="status">Chargement des contenus…</div>}
    {source === "error" && <div className="empty-state" role="status"><h2>Les contenus sont indisponibles.</h2><p>La connexion au catalogue n'a pas abouti. Vous pouvez réessayer.</p><button type="button" className="btn btn-outline" onClick={()=>setReloadKey(i=>i+1)}><RotateCcw size={16}/> Réessayer</button></div>}
    {source !== "loading" && source !== "error" && <>
      <div className="catalogue-grid">{filtered.map((item,index)=>
        <article className="catalogue-card" key={item.kind+item.id}>
          <div className="catalogue-card-top"><span>{item.category}</span><span>{String(index+1).padStart(2,"0")}</span></div>
          <h2>{item.title}</h2><p>{item.description}</p>
          {item.kind === "formation" && formationDetailHref(item) && <Link className="catalogue-course-link" href={formationDetailHref(item)!}>Découvrir le parcours <ArrowUpRight size={16} aria-hidden="true"/></Link>}
          {item.detail && <details className="catalogue-detail"><summary>En savoir plus <ChevronDown size={16} aria-hidden="true"/></summary><p>{item.detail}</p></details>}
          <div className="catalogue-card-bottom"><span>{item.status || "À découvrir"}</span><Link href={"/contact?subject="+encodeURIComponent(item.title)} aria-label={"Nous contacter à propos de "+item.title} title="Nous contacter"><ArrowUpRight size={19}/></Link></div>
        </article>
      )}</div>
      {filtered.length === 0 && <div className="empty-state"><h2>{entries.length === 0 ? "Aucune publication pour le moment" : "Aucun résultat"}</h2><p>{entries.length === 0 ? "De nouveaux contenus pourront être publiés prochainement." : "Essayez un autre terme ou affichez toutes les catégories."}</p>{entries.length !== 0 && <button className="btn btn-outline" type="button" onClick={()=>{setCategory("Tout");updateQuery("");}}>Réinitialiser les filtres</button>}</div>}
    </>}
  </div>;
}
