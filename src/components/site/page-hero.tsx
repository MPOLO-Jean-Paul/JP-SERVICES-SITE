import { cn } from "@/lib/utils";
import { RingVisual, type Tone } from "./ring-visual";

/**
 * En-tête éditorial commun : aucune illustration générique ajoutée par défaut.
 * L'illustration fournie par une rubrique reste secondaire au contenu.
 */
export function PageHero({ eyebrow, title, text, actions, aside, children, center, className, asideOnMobile = false, illustration, tone }: {
  eyebrow?: string;
  title: React.ReactNode;
  text?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  center?: boolean;
  className?: string;
  asideOnMobile?: boolean;
  /** Illustration JP-Services dans un médaillon (à droite, ou au-dessus du contenu annexe). */
  illustration?: string;
  tone?: Tone;
}) {
  const split = Boolean(aside || illustration);
  return <section className={cn("jp-inner-hero border-b", center && "jp-inner-hero-centered", split && "jp-inner-hero-with-aside", className)}>
    <div className={cn("shell jp-inner-hero-layout",split && "jp-inner-hero-split")}>
      <div className="jp-inner-hero-copy">
        {eyebrow ? <p className="jp-overline">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {text ? <p className="jp-inner-hero-lead">{text}</p> : null}
        {actions ? <div className="jp-inner-hero-actions">{actions}</div> : null}
        {children}
      </div>
      {aside ? (
        <div className={cn("jp-inner-hero-aside", illustration && "jp-inner-hero-aside-illustrated", asideOnMobile && "jp-inner-hero-aside-mobile")}>
          {illustration ? <RingVisual src={illustration} tone={tone} size="sm" className="jp-hero-medallion" /> : null}
          {aside}
        </div>
      ) : illustration ? (
        <RingVisual src={illustration} tone={tone} size="lg" className="jp-inner-hero-ring" />
      ) : null}
    </div>
  </section>;
}
