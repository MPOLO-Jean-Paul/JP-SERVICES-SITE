import { cn } from "@/lib/utils";

/**
 * Ornement de marque : les « marches » du symbole Élan, agrandies et adoucies.
 * Purement décoratif ; les barres montent au chargement (désactivé si mouvement réduit).
 */
export function StepsOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 330" className={cn("pointer-events-none select-none [mask-image:linear-gradient(to_bottom,black_70%,transparent)]", className)} aria-hidden>
      <g className="steps-rise">
        <rect x="0" y="190" width="56" height="170" rx="28" fill="#FF4D3D" fillOpacity="0.13" />
        <rect x="76" y="110" width="56" height="250" rx="28" fill="#7B4DFF" fillOpacity="0.14" />
        <rect x="152" y="30" width="56" height="330" rx="28" fill="#2F5BFF" fillOpacity="0.16" />
        <circle cx="236" cy="22" r="18" fill="#2F5BFF" fillOpacity="0.22" />
      </g>
    </svg>
  );
}
