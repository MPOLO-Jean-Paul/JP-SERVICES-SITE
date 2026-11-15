"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Flame, LayoutList, MessageCircle, Search, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { LikeButton } from "./like-button";
import { cn, excerpt, formatDate } from "@/lib/utils";

export type ForumPost = { id: number; titre: string; contenu: string; date: string; auteur: string; auteurPhoto: string; likes: number; comments: number; liked: boolean };

export function ForumList({ posts, canLike }: { posts: ForumPost[]; canLike: boolean }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "popular" | "discussed">("all");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const l = posts.filter((p) => !s || `${p.titre} ${p.contenu} ${p.auteur}`.toLowerCase().includes(s));
    if (filter === "popular") l.sort((a, b) => b.likes - a.likes);
    if (filter === "discussed") l.sort((a, b) => b.comments - a.comments);
    return l;
  }, [posts, q, filter]);
  return (
    <div>
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <label className="relative flex-1"><span className="sr-only">Rechercher une discussion</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par mot-clé, titre, sujet ou auteur…" className="field h-11 pl-10 pr-10" />{q ? <button type="button" onClick={() => setQ("")} aria-label="Effacer" className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-panel-2"><X className="size-4" /></button> : null}</label>
        <div role="tablist" aria-label="Filtrer les publications" className="flex gap-1 rounded-lg bg-panel-2 p-1">
          {([["all", "Tous", LayoutList], ["popular", "Populaires", Flame], ["discussed", "Plus commentés", MessageCircle]] as const).map(([k, label, I]) => <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition", filter === k ? "bg-panel text-ink shadow-xs" : "text-copy hover:text-ink")}><I className="size-4" /> {label}</button>)}
        </div>
      </div>
      {list.length ? (
        <ul className="mt-6 space-y-4">
          {list.map((p) => (
            <li key={p.id} className="card card-hover p-6">
              <div className="flex items-start gap-4">
                <Avatar name={p.auteur} src={p.auteurPhoto} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted"><strong className="text-ink">{p.auteur}</strong> · {formatDate(p.date, "fr", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  <h2 className="h3 mt-1"><Link href={`/forum/${p.id}`} className="hover:text-primary">{p.titre}</Link></h2>
                  <p className="mt-2 text-sm text-copy">{excerpt(p.contenu, 220)}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <LikeButton postId={p.id} liked={p.liked} total={p.likes} disabled={!canLike} />
                    <Link href={`/forum/${p.id}#reponses`} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium text-copy hover:border-primary/50 hover:text-primary"><MessageCircle className="size-4" /> {p.comments} réponse{p.comments > 1 ? "s" : ""}</Link>
                    <Link href={`/forum/${p.id}`} className="ml-auto text-sm font-semibold text-primary">Lire la discussion</Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : <EmptyState className="mt-6" icon={Search} title="Aucune publication trouvée" text="Essayez un autre mot-clé ou réinitialisez le filtre." />}
    </div>
  );
}
