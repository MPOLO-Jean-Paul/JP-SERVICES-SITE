import { cn } from "@/lib/utils";

/**
 * Symbole JP-Services « Élan » : trois marches sur une même ligne (16 → 32 → 48) jusqu’au « J »,
 * qui passe devant la marche violette (découpe géométrique de 4) ; le point est l’étape suivante.
 * Grille 64, module 8, espacement constant de 4, terminaisons arrondies. Charte : public/brand/charte-symbole-elan.png.
 * Le symbole s’utilise seul (sans nom écrit) ; il porte « JP-Services » comme nom accessible.
 */
export function LogoMark({ className, title = "JP-Services" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={title} className={cn("size-8 shrink-0", className)}>
      <rect x="9" y="36" width="8" height="16" rx="4" fill="#FF4D3D" />
      <path d="M21 46.71V24a4 4 0 0 1 8 0v20h-2a8 8 0 0 0-6 2.71z" fill="#7B4DFF" />
      <path d="M37 12v30a10 10 0 0 1-10 10" fill="none" stroke="#2F5BFF" strokeWidth="8" strokeLinecap="round" />
      <circle cx="50" cy="12" r="5" fill="#2F5BFF" />
    </svg>
  );
}
