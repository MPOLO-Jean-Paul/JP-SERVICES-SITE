import { cn } from "@/lib/utils";

/** En-tête de page : fond quadrillé estompé, étiquette mono, titre, texte, actions et visuel facultatif. */
export function PageHero({ eyebrow, title, text, actions, aside, children, center, className }: { eyebrow?: string; title: React.ReactNode; text?: React.ReactNode; actions?: React.ReactNode; aside?: React.ReactNode; children?: React.ReactNode; center?: boolean; className?: string }) {
  return (
    <section className={cn("relative overflow-hidden border-b", className)}>
      <div className="bg-grid fade-mask pointer-events-none absolute inset-0" aria-hidden />
      <div className="glow pointer-events-none absolute inset-x-0 top-0 h-96" aria-hidden />
      <div className={cn("shell relative py-16 sm:py-20 lg:py-24", aside ? "grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center" : center ? "text-center" : "")}>
        <div className={cn(center && !aside && "mx-auto max-w-3xl")}>
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1 className="h1 mt-5">{title}</h1>
          {text ? <p className={cn("lead mt-5 max-w-xl", center && !aside && "mx-auto")}>{text}</p> : null}
          {actions ? <div className={cn("mt-8 flex flex-wrap items-center gap-3", center && !aside && "justify-center")}>{actions}</div> : null}
          {children}
        </div>
        {aside ? <div className="relative">{aside}</div> : null}
      </div>
    </section>
  );
}
