"use client";

import { useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/ui/material-symbol";

const paths = [
  {
    label: "Apprendre",
    title: "Développez vos compétences",
    description: "Explorez les formations et choisissez une compétence à mettre en pratique.",
    href: "/formations",
    action: "Voir les formations",
    icon: "school",
  },
  {
    label: "Utiliser",
    title: "Trouvez les bons outils",
    description: "Découvrez les logiciels et ressources numériques adaptés à votre activité.",
    href: "/logiciels",
    action: "Explorer les logiciels",
    icon: "apps",
  },
  {
    label: "Créer",
    title: "Concrétisez un projet",
    description: "Présentez votre idée et découvrez les solutions et projets de JP-Services.",
    href: "/projets",
    action: "Découvrir les projets",
    icon: "rocket_launch",
  },
] as const;

export function PathFinder() {
  const [active, setActive] = useState(0);
  const selected = paths[active]!;
  return (
    <div className="jp-path-finder">
      <p className="jp-path-caption">Je souhaite…</p>
      <div className="jp-path-options" role="group" aria-label="Choisir mon objectif">
        {paths.map((path, index) => (
          <button
            type="button"
            key={path.label}
            onClick={() => setActive(index)}
            aria-pressed={active === index}
            className="jp-path-option"
            data-testid={`path-choice-${index}`}
          >
            <MaterialIcon name={path.icon} size={18} filled={active === index} />
            <span>{path.label}</span>
          </button>
        ))}
      </div>
      <div className="jp-path-detail" key={active} aria-live="polite">
        <strong>{selected.title}</strong>
        <p>{selected.description}</p>
        <Link href={selected.href} className="jp-path-action">
          {selected.action} <MaterialIcon name="arrow_forward" size={17} />
        </Link>
      </div>
    </div>
  );
}
