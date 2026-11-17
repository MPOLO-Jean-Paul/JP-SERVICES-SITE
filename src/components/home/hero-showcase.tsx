"use client";

import { useEffect, useRef, useState } from "react";
import { CrispPhoto, type PhotoCategory } from "@/components/ui/crisp-photo";
import { MaterialIcon } from "@/components/ui/material-symbol";

const slides: ReadonlyArray<{ label: string; heading: string; category: PhotoCategory; alt: string; icon: string }> = [
  {
    label: "Formation",
    heading: "FORMATION NUMÉRIQUE",
    category: "formation",
    alt: "Illustration d'un atelier de formation informatique avec un formateur et des participants",
    icon: "school",
  },
  {
    label: "Logiciels",
    heading: "OUTILS NUMÉRIQUES",
    category: "logiciels",
    alt: "Illustration du développement de logiciels et d'outils numériques",
    icon: "apps",
  },
  {
    label: "Projets",
    heading: "SOLUTIONS MÉTIERS",
    category: "projets",
    alt: "Illustration d'une équipe travaillant sur un projet numérique",
    icon: "workspaces",
  },
] as const;

export function HeroShowcase() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { containerRef.current?.setAttribute("data-hydrated", "true"); }, []);
  const slide = slides[active]!;
  return (
    <div ref={containerRef} className="jp-hero-showcase" data-testid="hero-showcase" data-hydrated="false">
      <figure className="jp-hero-photo">
        <CrispPhoto
          key={slide.category}
          category={slide.category}
          className="jp-showcase-image"
          width={1280}
          height={780}
          alt={slide.alt}
          priority={active === 0}
          sizes="(max-width:800px) 92vw, (max-width:1280px) 50vw, 40vw"
        />
        <figcaption aria-live="polite">
          <span>{slide.heading}</span>
          <span>{String(active + 1).padStart(2, "0")} / 03</span>
        </figcaption>
      </figure>
      <div className="jp-hero-switcher" role="group" aria-label="Découvrir les activités JP-Services">
        {slides.map((item, index) => (
          <button
            key={item.label}
            className="jp-hero-switch"
            data-testid={`hero-slide-${index}`}
            type="button"
            aria-label={`Afficher : ${item.label}`}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              const next = (index + (event.key === "ArrowRight" ? 1 : slides.length - 1)) % slides.length;
              setActive(next);
              const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button");
              buttons?.[next]?.focus();
            }}
          >
            <MaterialIcon name={item.icon} size={17} filled={active === index} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
