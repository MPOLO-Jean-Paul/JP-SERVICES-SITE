"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useRotatingGallery } from "./use-rotating-gallery";

const INTERVAL_MS = 7200;
const posters = [
  {
    label: "Formations",
    kicker: "01 — Apprendre",
    title: "Des compétences pour passer à l’action.",
    text: "Des parcours pratiques et des projets concrets pour progresser dans le numérique.",
    action: "Découvrir les formations",
    href: "/formations",
    image: "/illustrations/apprendre-partout.svg",
    alt: "Illustration d’une apprenante qui suit sa formation sur ordinateur",
  },
  {
    label: "Logiciels",
    kicker: "02 — Utiliser",
    title: "Les bons outils. Au bon endroit.",
    text: "Logiciels et ressources numériques pour simplifier le quotidien et gagner en efficacité.",
    action: "Explorer les logiciels",
    href: "/logiciels",
    image: "/illustrations/formateur-en-ligne.svg",
    alt: "Illustration d’une séance en visioconférence avec un formateur",
  },
  {
    label: "Solutions",
    kicker: "03 — Construire",
    title: "Des idées qui deviennent des solutions.",
    text: "De la première idée à un outil adapté, donnons une forme concrète à vos projets.",
    action: "Présenter un projet",
    href: "/contact?sujet=Projet%20num%C3%A9rique",
    image: "/illustrations/projet-equipe.svg",
    alt: "Illustration de deux personnes qui présentent un projet sur un tableau",
  },
] as const;

export function PromoCarousel() {
  const { rootRef, trackRef, active, playing, manualPause, reduceMotion, goTo, onScroll, togglePause, onMouseEnter, onMouseLeave, onFocusCapture, onBlurCapture } = useRotatingGallery(posters.length, INTERVAL_MS);
  return (
    <section className="jp-campaigns jp-section" aria-labelledby="jp-campaign-heading">
      <div className="shell">
        <div className="jp-campaign-heading jp-section-heading">
          <div>
            <p className="jp-overline">À la une</p>
            <h2 id="jp-campaign-heading">Le numérique, <em>en mouvement.</em></h2>
          </div>
          <p className="jp-section-aside">Trois façons d’apprendre, d’utiliser et de construire avec nos services.</p>
        </div>
        <div className="jp-auto-gallery jp-promo-gallery" ref={rootRef}
          data-paused={!playing} data-reduced-motion={reduceMotion}
          onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
          onFocusCapture={onFocusCapture} onBlurCapture={onBlurCapture}>
          <div ref={trackRef} className="jp-promo-track" onScroll={onScroll}
            role="region" aria-roledescription="carrousel" aria-label="Affiches des activités JP-Services" aria-live="off">
            {posters.map((poster, index) => (
              <article key={poster.label} className="jp-promo-slide" role="group"
                aria-roledescription="diapositive" aria-label={String(index + 1) + " sur " + posters.length}>
                <Image src={poster.image} alt={poster.alt} width={400} height={400}
                  unoptimized priority={index === 0} className="jp-promo-illustration" />
                <div className="jp-promo-shade" aria-hidden="true" />
                <div className="jp-promo-art" aria-hidden="true"><span /><span /><span /></div>
                <div className="jp-promo-copy">
                  <div className="jp-promo-label"><span className="jp-promo-dot" />{poster.label}</div>
                  <p className="jp-promo-kicker">{poster.kicker}</p>
                  <h3>{poster.title}</h3>
                  <p className="jp-promo-description">{poster.text}</p>
                  <Link href={poster.href} className="jp-promo-cta">
                    {poster.action} <ChevronRight aria-hidden="true" className="size-5" />
                  </Link>
                </div>
                <span className="jp-promo-counter" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")} / {String(posters.length).padStart(2, "0")}
                </span>
              </article>
            ))}
          </div>
          <div className="jp-promo-controls">
            <p>Explorez nos domaines</p>
            <div className="jp-gallery-dots" role="group" aria-label="Choisir une affiche">
              {posters.map((poster, index) => (
                <button key={poster.label} type="button"
                  className="jp-gallery-dot" aria-current={active === index ? "true" : undefined}
                  aria-label={"Afficher l’affiche " + (index + 1) + " : " + poster.kicker}
                  onClick={() => goTo(index)}>
                  <span />
                </button>
              ))}
            </div>
            <div className="jp-gallery-actions">
              <button type="button" className="jp-gallery-icon" onClick={() => goTo(active - 1)} aria-label="Affiche précédente">
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <button type="button" className="jp-gallery-icon" onClick={togglePause}
                aria-label={manualPause ? "Reprendre le défilement automatique" : "Mettre le défilement automatique en pause"}
                aria-pressed={manualPause}>
                {manualPause ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
              </button>
              <button type="button" className="jp-gallery-icon" onClick={() => goTo(active + 1)} aria-label="Affiche suivante">
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
          <div className="jp-promo-progress" aria-hidden="true">
            <span key={active} style={{ animationDuration: String(INTERVAL_MS) + "ms" }} />
          </div>
        </div>
        <div className="jp-campaign-ticker" aria-label="Formations, logiciels, solutions numériques, accompagnement et SCOLIA Pro">
          <div className="jp-campaign-ticker-track" aria-hidden="true">
            {[0,1].map((copy) => (
              <div key={copy} className="jp-campaign-ticker-group">
                {["Formations pratiques","Développement logiciel","Solutions métiers","Accompagnement","SCOLIA Pro"].map((label) => (
                  <span key={label}>{label}<span className="jp-ticker-dot" /></span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
