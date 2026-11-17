"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, MessageSquareQuote, Pause, Play } from "lucide-react";
import { useRotatingGallery } from "./use-rotating-gallery";

export type PublishedTestimonial = { name: string; role: string; quote: string };

const prompts = [
  {
    topic: "Formations",
    title: "Un apprentissage qui sert au quotidien.",
    text: "Une compétence découverte, un exercice réalisé, un progrès constaté : chaque expérience mérite d’être écoutée.",
  },
  {
    topic: "Logiciels",
    title: "Des outils qui répondent à un vrai besoin.",
    text: "Votre retour sur l’utilité et la simplicité de nos solutions peut nous aider à les perfectionner.",
  },
  {
    topic: "Projets",
    title: "Des idées transformées en réalisations.",
    text: "Partagez ce que l’accompagnement vous a permis de comprendre, de construire ou d’améliorer.",
  },
] as const;

export function TestimonialsCarousel({ testimonials }: { testimonials: PublishedTestimonial[] }) {
  const hasTestimonials = testimonials.length > 0;
  const cards = hasTestimonials ? testimonials : prompts;
  const { rootRef, trackRef, active, playing, manualPause, reduceMotion, goTo, onScroll, togglePause, onMouseEnter, onMouseLeave, onFocusCapture, onBlurCapture } = useRotatingGallery(cards.length, 8500);
  return (
    <section className="jp-stories jp-section" aria-labelledby="jp-stories-heading">
      <div className="shell">
        <div className="jp-section-heading jp-stories-heading">
          <div>
            <p className="jp-overline">PAROLES ET EXPÉRIENCES</p>
            <h2 id="jp-stories-heading">{hasTestimonials ? "Ce que vous " : "Vos expériences "}
              <em>{hasTestimonials ? "en dites." : "comptent."}</em></h2>
          </div>
          <p className="jp-section-aside">{hasTestimonials
            ? "Des témoignages authentiques publiés avec l’accord de leurs auteurs."
            : "Cet espace accueillera des témoignages vérifiés. En attendant, voici les expériences dont nous souhaitons recueillir le récit."}</p>
        </div>
        <div className="jp-auto-gallery jp-story-gallery" ref={rootRef}
          data-paused={!playing} data-reduced-motion={reduceMotion}
          onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
          onFocusCapture={onFocusCapture} onBlurCapture={onBlurCapture}>
          <div ref={trackRef} onScroll={onScroll} className="jp-stories-track"
            role="region" aria-roledescription="carrousel"
            aria-label={hasTestimonials ? "Témoignages JP-Services" : "Partagez votre expérience JP-Services"}
            aria-live="off">
            {cards.map((item, index) => (
              <article className="jp-story-slide" role="group" aria-roledescription="diapositive"
                aria-label={String(index + 1) + " sur " + cards.length} key={index}>
                <div className="jp-story-mark"><MessageSquareQuote aria-hidden="true" className="size-6" /></div>
                {hasTestimonials ? (
                  <>
                    <p className="jp-story-topic">TÉMOIGNAGE / {String(index + 1).padStart(2, "0")}</p>
                    <blockquote className="jp-story-quote">« {(item as PublishedTestimonial).quote} »</blockquote>
                    <p className="jp-story-author"><strong>{(item as PublishedTestimonial).name}</strong>
                      {(item as PublishedTestimonial).role ? <span>{(item as PublishedTestimonial).role}</span> : null}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="jp-story-topic">VOS RETOURS / {(item as typeof prompts[number]).topic.toUpperCase()}</p>
                    <h3>{(item as typeof prompts[number]).title}</h3>
                    <p className="jp-story-prompt">{(item as typeof prompts[number]).text}</p>
                    <p className="jp-story-note">Aucune citation fictive n’est publiée.</p>
                  </>
                )}
              </article>
            ))}
          </div>
          <div className="jp-story-foot">
            <Link href="/contact?sujet=T%C3%A9moignage%20JP-Services" className="jp-story-share">
              Partager votre expérience <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
            <div className="jp-story-controls" role="group" aria-label="Navigation des témoignages">
              <span className="jp-story-position">{String(active + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</span>
              <button type="button" className="jp-gallery-icon" aria-label="Témoignage précédent" onClick={() => goTo(active - 1)}><ChevronLeft className="size-5" aria-hidden="true" /></button>
              <button type="button" className="jp-gallery-icon" aria-label={manualPause ? "Reprendre les témoignages" : "Mettre les témoignages en pause"} aria-pressed={manualPause} onClick={togglePause}>
                {manualPause ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              </button>
              <button type="button" className="jp-gallery-icon" aria-label="Témoignage suivant" onClick={() => goTo(active + 1)}><ChevronRight className="size-5" aria-hidden="true" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
