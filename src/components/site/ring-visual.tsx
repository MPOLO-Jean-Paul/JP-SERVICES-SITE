import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tone = "blue" | "violet" | "red" | "amber" | "mint";

/**
 * Médaillon illustré commun (même décor que la page Nos services) : fond à la couleur
 * de la rubrique, anneaux discrets, illustration et pastille d’icône facultative.
 */
export function RingVisual({ src, tone = "blue", Icon, size = "md", className }: { src: string; tone?: Tone; Icon?: LucideIcon; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <div className={cn("jp-ring-visual", `jp-ring-${size}`, className)} data-tone={tone} aria-hidden="true">
      <Image src={src} width={400} height={400} alt="" unoptimized priority className="jp-ring-art" />
      {Icon ? <span className="jp-svc-visual-icon"><Icon /></span> : null}
    </div>
  );
}
