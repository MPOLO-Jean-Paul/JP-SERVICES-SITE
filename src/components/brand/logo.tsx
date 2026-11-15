import { cn } from "@/lib/utils";

/**
 * Monogramme JP-Services : « J » et « P » tracés d’un seul trait dans un carré arrondi,
 * avec un point cobalt. Hérite de la couleur du texte (currentColor) pour le fond.
 */
export function LogoMark({ className, title = "JP-Services" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label={title} className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M12.5 8.5v10.25a4.25 4.25 0 0 1-4.25 4.25H7.5" fill="none" stroke="var(--canvas)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 23.5v-15h4.25a4.25 4.25 0 0 1 0 8.5H17" fill="none" stroke="var(--canvas)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25" cy="23" r="1.9" fill="#3d63ff" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-[15px] font-semibold tracking-tight text-ink", className)}>
      JP<span className="text-muted">‑</span>Services
    </span>
  );
}
