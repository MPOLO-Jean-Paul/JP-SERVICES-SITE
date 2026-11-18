"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight progressive enhancement: GPU-friendly gestures and subtle
 * on-scroll entrances, with no hidden content when JS is disabled.
 */
export function SiteMotion() {
  const progressRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;
    const progress = progressRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const header = document.getElementById("site-header");
    const syncProgress = () => {
      frame = 0;
      // En-tête : plus compact et ombré dès que la page défile.
      header?.toggleAttribute("data-scrolled", window.scrollY > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
    };
    const scheduleProgress = () => {
      if (!frame) frame = window.requestAnimationFrame(syncProgress);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (reducedMotion.matches || event.button !== 0 || !(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>(".jp-action, .jp-md3-button, .jp-path-option, .jp-hero-switch, .jp-path-action, .jp-finale-link, .jp-drawer-pref-trigger");
      if (!element || element.matches(":disabled")) return;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const size = Math.max(rect.width, rect.height) * 1.7;
      const wave = document.createElement("span");
      wave.className = "jp-press-wave";
      wave.setAttribute("aria-hidden", "true");
      wave.style.width = `${size}px`;
      wave.style.height = `${size}px`;
      wave.style.left = `${event.clientX - rect.left - size / 2}px`;
      wave.style.top = `${event.clientY - rect.top - size / 2}px`;
      element.appendChild(wave);
      wave.addEventListener("animationend", () => wave.remove(), { once: true });
    };

    syncProgress();
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleProgress);
    document.addEventListener("pointerdown", onPointerDown, { passive: true });

    let observer: IntersectionObserver | undefined;
    if (!reducedMotion.matches && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer?.unobserve(entry.target);
          entry.target.animate(
            [{ opacity: 0.7, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: 480, easing: "cubic-bezier(.2,.85,.2,1)", iterations: 1 },
          );
        }
      }, { threshold: 0.09, rootMargin: "0px 0px -24px 0px" });
      for (const item of document.querySelectorAll(".jp-method-step, .jp-area-link, .jp-learning-empty, .jp-scolia-index-row, .jp-news-row")) {
        observer.observe(item);
      }
    }
    return () => {
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleProgress);
      document.removeEventListener("pointerdown", onPointerDown);
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return <div className="jp-scroll-progress" aria-hidden="true"><span ref={progressRef} style={{ transform: "scaleX(0)" }} /></div>;
}
