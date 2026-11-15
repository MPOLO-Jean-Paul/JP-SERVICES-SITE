import { cn } from "@/lib/utils";
import { StepsOrnament } from "@/components/visuals/steps-ornament";

/** En-tête de page : étiquette, titre, texte, actions, visuel facultatif ; ornement de marque à droite. */
export function PageHero({ eyebrow, title, text, actions, aside, children, center, className }: { eyebrow?: string; title: React.ReactNode; text?: React.ReactNode; actions?: React.ReactNode; aside?: React.ReactNode; children?: React.ReactNode; center?: boolean; className?: string }) {
  return (
    <section className={cn("relative overflow-hidden border-b", className)}>
      {!aside && !center ? <StepsOrnament className="absolute -bottom-6 right-[max(1.5rem,calc((100vw-80rem)/2+2rem))] hidden h-[85%] max-h-80 lg:block" /> : null}
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
