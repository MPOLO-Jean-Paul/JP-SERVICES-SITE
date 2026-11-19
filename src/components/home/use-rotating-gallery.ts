"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Automatic scrolling stays optional and stops offscreen, on hover/focus,
 * in hidden tabs and when the visitor prefers reduced motion. */
export function useRotatingGallery(count: number, intervalMs: number) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [manualPause, setManualPause] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(media.matches);
    const updateVisibility = () => setTabVisible(document.visibilityState === "visible");
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const target = rootRef.current;
    const observer = typeof IntersectionObserver !== "undefined" && target
      ? new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { threshold: 0.2 })
      : null;
    if (observer && target) observer.observe(target);
    else setVisible(true);
    return () => {
      observer?.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  const goTo = useCallback((next: number) => {
    if (count < 1) return;
    const normalized = ((next % count) + count) % count;
    setActive(normalized);
    const track = trackRef.current;
    if (track) track.scrollTo({
      left: normalized * track.clientWidth,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  }, [count, reduceMotion]);

  const playing = count > 1 && visible && tabVisible && !reduceMotion && !manualPause && !hover && !focus;
  useEffect(() => {
    if (!playing) return;
    const handle = window.setInterval(() => goTo(active + 1), intervalMs);
    return () => window.clearInterval(handle);
  }, [active, goTo, intervalMs, playing]);

  // Une seule lecture de position par frame, même sur les trackpads haute fréquence.
  const onScroll = useCallback(() => {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      const el = trackRef.current;
      if (!el?.clientWidth) return;
      const index = Math.max(0, Math.min(count - 1, Math.round(el.scrollLeft / el.clientWidth)));
      setActive((previous) => previous === index ? previous : index);
    });
  }, [count]);

  return {
    rootRef, trackRef, active, playing, manualPause, reduceMotion, goTo, onScroll,
    togglePause: () => setManualPause((previous) => !previous),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocusCapture: () => setFocus(true),
    onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocus(false);
    },
  };
}
