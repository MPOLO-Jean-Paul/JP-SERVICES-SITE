"use client";
import { Children, useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/**
 * Rangée de cartes qui défile seule, une carte à la fois, quand elle déborde (mobile).
 * Pause : au toucher (reprise après quelques secondes), au survol, au focus clavier,
 * hors écran, onglet masqué, mouvement réduit, ou via le bouton pause.
 */
export function AutoScrollRow({ children, className, intervalMs = 3200, label }: { children: React.ReactNode; className?: string; intervalMs?: number; label: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<number | undefined>(undefined);
  const count = Children.count(children);
  const [active, setActive] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const [visible, setVisible] = useState(false);
  const [held, setHeld] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  const items = () => Array.from(trackRef.current?.children ?? []) as HTMLElement[];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduceMotion(media.matches);
      setScrollable(track.scrollWidth > track.clientWidth + 4);
    };
    const onTab = () => setTabVisible(document.visibilityState === "visible");
    sync(); onTab();
    const ro = new ResizeObserver(sync); ro.observe(track);
    const io = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)), { threshold: 0.35 });
    io.observe(track);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", onTab);
    return () => { ro.disconnect(); io.disconnect(); media.removeEventListener("change", sync); document.removeEventListener("visibilitychange", onTab); window.clearTimeout(resumeRef.current); };
  }, []);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    const list = items();
    if (!track || !list.length) return;
    const next = ((index % list.length) + list.length) % list.length;
    const padding = parseFloat(getComputedStyle(track).scrollPaddingInlineStart || "0") || 0;
    track.scrollTo({ left: list[next]!.offsetLeft - track.offsetLeft - padding, behavior: reduceMotion ? "instant" : "smooth" });
    setActive(next);
  }, [reduceMotion]);

  const playing = scrollable && visible && tabVisible && !reduceMotion && !held && !manualPause && count > 1;
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const track = trackRef.current;
      // En fin de rangée, retour au début.
      const atEnd = track ? track.scrollLeft + track.clientWidth >= track.scrollWidth - 8 : false;
      goTo(atEnd ? 0 : active + 1);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [playing, active, goTo, intervalMs]);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const list = items();
    let best = 0, dist = Infinity;
    list.forEach((el, i) => { const d = Math.abs(el.offsetLeft - track.offsetLeft - track.scrollLeft - 20); if (d < dist) { dist = d; best = i; } });
    setActive((a) => (a === best ? a : best));
  };
  const hold = () => { window.clearTimeout(resumeRef.current); setHeld(true); };
  const release = (delay = 5000) => { window.clearTimeout(resumeRef.current); resumeRef.current = window.setTimeout(() => setHeld(false), delay); };

  return (
    <div className="jp-autoscroll" data-playing={playing}>
      <div
        ref={trackRef}
        className={className}
        role="list"
        aria-label={label}
        onScroll={onScroll}
        onPointerDown={hold}
        onPointerUp={() => release()}
        onPointerCancel={() => release()}
        onMouseEnter={hold}
        onMouseLeave={() => release(600)}
        onFocusCapture={hold}
        onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) release(600); }}
      >
        {children}
      </div>
      {scrollable ? (
        <div className="jp-autoscroll-controls">
          <div className="jp-autoscroll-dots" role="group" aria-label="Choisir un service">
            {Array.from({ length: count }, (_, i) => (
              <button key={i} type="button" aria-label={`Afficher la carte ${i + 1} sur ${count}`} aria-current={active === i ? "true" : undefined} onClick={() => { hold(); goTo(i); release(); }}>
                <span />
              </button>
            ))}
          </div>
          <button type="button" className="jp-autoscroll-pause" aria-pressed={manualPause} aria-label={manualPause ? "Reprendre le défilement" : "Mettre le défilement en pause"} onClick={() => setManualPause((p) => !p)}>
            {manualPause ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
          </button>
        </div>
      ) : null}
    </div>
  );
}
