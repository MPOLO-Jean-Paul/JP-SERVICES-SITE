import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";

export type LegalSection = { title: string; body: React.ReactNode };

export function LegalPage({ title, icon, intro, updated, sections, aside }: { title: string; icon: LucideIcon; intro: string; updated: string; sections: LegalSection[]; aside?: React.ReactNode }) {
  return (
    <>
      <PageHeader title={title} icon={icon} text={intro} />
      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-[240px_1fr]">
          <nav aria-label="Sommaire" className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Sommaire</p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {sections.map((s, i) => (
                <li key={s.title}><a href={`#section-${i + 1}`} className="flex gap-2 text-copy hover:text-primary"><span className="text-muted">{String(i + 1).padStart(2, "0")}</span>{s.title}</a></li>
              ))}
            </ol>
            <p className="mt-6 text-xs text-muted">{updated}</p>
          </nav>
          <div className="max-w-3xl">
            <div className="space-y-10">
              {sections.map((s, i) => (
                <section key={s.title} id={`section-${i + 1}`} className="scroll-mt-28">
                  <h2 className="flex items-baseline gap-3 text-xl font-bold"><span className="font-display text-primary/50">{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>
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
