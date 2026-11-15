import { cn } from "@/lib/utils";

/**
 * En-tête éditorial commun : aucune illustration générique ajoutée par défaut.
 * L'illustration fournie par une rubrique reste secondaire au contenu.
 */
export function PageHero({ eyebrow, title, text, actions, aside, children, center, className }: {
  eyebrow?: string;
  title: React.ReactNode;
  text?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return <section className={cn("jp-inner-hero border-b", center && "jp-inner-hero-centered", aside && "jp-inner-hero-with-aside", className)}>
    <div className={cn("shell jp-inner-hero-layout",aside && "jp-inner-hero-split")}>
      <div className="jp-inner-hero-copy">
        {eyebrow ? <p className="jp-overline">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {text ? <p className="jp-inner-hero-lead">{text}</p> : null}
        {actions ? <div className="jp-inner-hero-actions">{actions}</div> : null}
        {children}
      </div>
      {aside ? <div className="jp-inner-hero-aside"><p className="jp-inner-aside-caption">APERÇU DU SERVICE</p>{aside}</div> : null}
    </div>
  </section>;
}
