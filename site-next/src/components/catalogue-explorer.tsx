"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import type { CatalogueItem, Kind } from "@/lib/content";

export function CatalogueExplorer({ items, kind }: { items: CatalogueItem[]; kind: Kind }) {
  const [entries, setEntries] = useState(items);
  const [source, setSource] = useState<"presentation" | "database">("presentation");
  const [query, setQuery] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalogue?kind=" + encodeURIComponent(kind), { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then((result: { source?: string; items?: CatalogueItem[] } | null) => {
        if (result?.source === "database" && Array.isArray(result.items) && result.items.length > 0) {
          setEntries(result.items);
          setSource("database");
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [kind]);
  const [category, setCategory] = useState("Tout");
  const categories = ["Tout", ...Array.from(new Set(entries.map(item => item.category)))];
  const filtered = useMemo(() => entries.filter(item => {
    const matchCategory = category === "Tout" || item.category === category;
    const searchable = [item.title, item.description, item.category].join(" ").toLocaleLowerCase("fr");
    return matchCategory && searchable.includes(query.trim().toLocaleLowerCase("fr"));
  }), [entries, category, query]);

  return (
    <>
      <p className="catalogue-source">{source === "database" ? "Catalogue publié" : "Sélection de présentation · informations à confirmer"}</p>
      <div className="catalogue-toolbar">
        <div className="filter-tabs" role="group" aria-label="Filtrer par catégorie">{categories.map(c => <button type="button" key={c} className={category===c?"filter-tab active":"filter-tab"} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <label className="catalogue-search"><Search size={18}/><span className="sr-only">Rechercher</span><input placeholder="Rechercher…" value={query} onChange={event=>setQuery(event.target.value)}/></label>
      </div>
      <div className="catalogue-grid" aria-live="polite">{filtered.map((item,index)=>
        <article className="catalogue-card" key={item.id}>
          <div className="catalogue-card-top"><span>{item.category}</span><span>{String(index+1).padStart(2,"0")}</span></div>
          <h2>{item.title}</h2><p>{item.description}</p>
          <div className="catalogue-card-bottom"><span>{item.status || "Sur mesure"}</span><Link href="/contact" aria-label={"Nous contacter à propos de " + item.title}><ArrowUpRight size={19}/></Link></div>
        </article>
      )}</div>
      {filtered.length === 0 && <div className="empty-state"><h2>Aucun résultat</h2><p>Essayez un autre terme ou affichez toutes les catégories.</p><button className="btn btn-outline" type="button" onClick={()=>{setCategory("Tout");setQuery("");}}>Réinitialiser les filtres</button></div>}
    </>
  );
}
