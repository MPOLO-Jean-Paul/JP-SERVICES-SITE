"use client";

import { useState } from "react";
import Image from "next/image";
import { MaterialIcon } from "@/components/ui/material-symbol";

const slides = [
  {
    label: "Formation",
    heading: "FORMATION NUMÉRIQUE",
    src: "/media/atelier-numerique.webp",
    alt: "Illustration d'un atelier de formation informatique avec un formateur et des participants",
    icon: "school",
  },
  {
    label: "Logiciels",
    heading: "OUTILS NUMÉRIQUES",
    src: "/media/developpement-logiciel.webp",
    alt: "Illustration du développement de logiciels et d'outils numériques",
    icon: "apps",
  },
  {
    label: "Projets",
    heading: "SOLUTIONS MÉTIERS",
    src: "/media/travail-equipe.webp",
    alt: "Illustration d'une équipe travaillant sur un projet numérique",
    icon: "workspaces",
  },
] as const;

export function HeroShowcase() {
  const [active, setActive] = useState(0);
  const slide = slides[active]!;
  return (
    <div className="jp-hero-showcase" data-testid="hero-showcase">
      <figure className="jp-hero-photo">
        <Image
          key={slide.src}
          className="jp-showcase-image"
          src={slide.src}
          width={960}
          height={540}
          alt={slide.alt}
          priority={active === 0}
          sizes="(max-width:800px) 92vw, (max-width:1280px) 40vw, 33vw"
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
          >
            <MaterialIcon name={item.icon} size={17} filled={active === index} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
