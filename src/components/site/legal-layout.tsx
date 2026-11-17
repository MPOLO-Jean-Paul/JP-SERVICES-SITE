import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";

export type LegalSection = { title: string; body: React.ReactNode };

export function LegalPage({ title, icon, intro, updated, sections, aside }: { title: string; icon: LucideIcon; intro: string; updated: string; sections: LegalSection[]; aside?: React.ReactNode }) {
  return (
    <>
      <PageHeader title={title} icon={icon} text={intro} />
      <section className="section">
        <div className="shell jp-legal-layout grid min-w-0 gap-7 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-10">
          <nav aria-label="Sommaire" className="jp-legal-toc min-w-0 rounded-2xl border bg-panel p-4 lg:sticky lg:top-24 lg:self-start lg:border-0 lg:bg-transparent lg:p-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Sommaire</p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {sections.map((s, i) => (
                <li key={s.title}><a href={`#section-${i + 1}`} className="jp-legal-anchor flex min-h-10 items-center gap-2 rounded-lg px-2 py-2 text-sm leading-snug text-copy transition-colors hover:bg-panel-2 hover:text-primary"><span className="text-muted">{String(i + 1).padStart(2, "0")}</span>{s.title}</a></li>
              ))}
            </ol>
            <p className="mt-6 text-xs text-muted">{updated}</p>
          </nav>
          <div className="min-w-0 max-w-3xl">
            <div className="space-y-10">
              {sections.map((s, i) => (
                <section key={s.title} id={`section-${i + 1}`} className="jp-legal-section scroll-mt-28">
                  <h2 className="flex items-baseline gap-3 text-xl font-bold leading-snug"><span className="font-display text-primary/50">{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>
                  <div className="prose-jp mt-3">{s.body}</div>
                </section>
              ))}
            </div>
            {aside ? <div className="mt-12">{aside}</div> : null}
          </div>
        </div>
      </section>
    </>
  );
}
