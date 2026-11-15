import { cn } from "@/lib/utils";

/**
 * Symbole JP-Services « Élan » : des marches qui montent jusqu’à un « J », la progression
 * par l’apprentissage. Rouge → violet → bleu reprend les couleurs historiques de la marque.
 * Le symbole s’utilise seul (sans nom écrit) ; il porte « JP-Services » comme nom accessible.
 */
export function LogoMark({ className, title = "JP-Services" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={title} className={cn("size-8 shrink-0", className)}>
      <rect x="8" y="34" width="9" height="16" rx="3" fill="#FF4D3D" />
      <rect x="21" y="24" width="9" height="26" rx="3" fill="#7B4DFF" />
      <path d="M38.5 10v29.5a10.5 10.5 0 0 1-10.5 10.5" fill="none" stroke="#2F5BFF" strokeWidth="9" strokeLinecap="round" />
      <circle cx="51" cy="14" r="5" fill="#2F5BFF" />
    </svg>
  );
}
