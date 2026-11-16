"use client";

import { useEffect, useState } from "react";

/** Small, passive progress indicator + Material-style press feedback. */
export function SiteMotion() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
        frame = 0;
      });
    };
    const onPointerDown = (event: PointerEvent) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>(".jp-action, .jp-md3-button, .jp-path-option, .jp-hero-switch, .jp-path-action, .jp-finale-link");
      if (!element || element.matches(":disabled")) return;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const size = Math.max(rect.width, rect.height) * 1.8;
      const ripple = document.createElement("span");
      ripple.className = "jp-press-wave";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      ripple.setAttribute("aria-hidden", "true");
      element.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("pointerdown", onPointerDown);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return <div className="jp-scroll-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>;
}
