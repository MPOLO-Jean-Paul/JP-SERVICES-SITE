import type { Metadata } from "next";
import Link from "next/link";
import { Download, GraduationCap, MessagesSquare, Newspaper, Search } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { searchSite } from "@/server/services/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recherche", robots: { index: false } };

const META = { formations: { label: "Formations", Icon: GraduationCap }, logiciels: { label: "Logiciels", Icon: Download }, actualites: { label: "Actualités", Icon: Newspaper }, posts: { label: "Forum", Icon: MessagesSquare } } as const;

export default async function RecherchePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const results = q.length >= 2 ? await searchSite(q, 20).catch(() => []) : [];
  const grouped = results.reduce<Record<string, typeof results>>((acc, r) => ((acc[r.type] ??= []).push(r), acc), {});
  return (
    <>
      <PageHeader title="Rechercher sur JP-Services" icon={Search} text="Saisissez un mot-clé pour explorer les formations, logiciels, actualités et discussions." />
      <section className="section">
        <div className="shell-narrow">
          <form action="/recherche" method="get" role="search" className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input type="search" name="q" defaultValue={q} placeholder="Rechercher…" className="field h-14 pl-12 text-lg" autoFocus maxLength={100} />
          </form>
          {q.length >= 2 ? (
            <p className="mt-4 text-sm text-muted" aria-live="polite">{results.length} résultat{results.length > 1 ? "s" : ""} pour « {q} »</p>
          ) : null}
          {q.length >= 2 && !results.length ? (
            <EmptyState className="mt-8" icon={Search} title="Aucun résultat" text={`Aucun contenu ne correspond à « ${q} ». Essayez un autre terme ou parcourez le catalogue.`} action={<Link href="/formations" className="font-semibold text-primary">Voir les formations</Link>} />
          ) : null}
          <div className="mt-8 space-y-10">
            {(Object.keys(META) as Array<keyof typeof META>).map((type) =>
              grouped[type]?.length ? (
                <section key={type}>
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted">{(() => { const I = META[type].Icon; return <I className="size-4" />; })()} {META[type].label}</h2>
                  <ul className="mt-3 divide-y rounded-xl border">
                    {grouped[type]!.map((r) => (
                      <li key={`${r.type}-${r.id}`}>
                        <Link href={r.href} className="block p-4 transition hover:bg-panel-2">
                          <span className="block font-semibold">{r.title}</span>
                          <span className="mt-0.5 block text-sm text-copy">{r.excerpt}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null,
            )}
          </div>
        </div>
      </section>
    </>
  );
}
