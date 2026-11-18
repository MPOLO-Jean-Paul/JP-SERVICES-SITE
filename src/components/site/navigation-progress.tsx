"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Indicateur de chargement entre deux pages : une fine barre aux couleurs de la marque,
 * affichée seulement si la page suivante tarde (au-delà de 150 ms), qui progresse puis
 * se termine dès que la nouvelle page est prête. Annoncé aux lecteurs d’écran.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const delay = useRef<number | undefined>(undefined);
  const route = `${pathname}?${search}`;

  // Fin de navigation : la nouvelle page est rendue.
  const previous = useRef(route);
  useEffect(() => {
    if (previous.current === route) return;
    previous.current = route;
    window.clearTimeout(delay.current);
    // Si un squelette de chargement est affiché, on attend que le vrai contenu le remplace.
    const skeleton = () => document.querySelector("[data-jp-loading]");
    let observer: MutationObserver | undefined;
    let id = 0;
    const finish = () => { id = requestAnimationFrame(() => setState((s) => (s === "loading" ? "done" : "idle"))); };
    if (skeleton()) {
      id = requestAnimationFrame(() => setState("loading"));
      observer = new MutationObserver(() => { if (!skeleton()) { observer?.disconnect(); finish(); } });
      observer.observe(document.body, { childList: true, subtree: true });
    } else finish();
    return () => { cancelAnimationFrame(id); observer?.disconnect(); };
  }, [route]);

  useEffect(() => {
    if (state !== "done") return;
    const id = window.setTimeout(() => setState("idle"), 420);
    return () => window.clearTimeout(id);
  }, [state]);

  // Début de navigation : clic sur un lien interne vers une autre page.
  useEffect(() => {
    let safety: number | undefined;
    const start = () => {
      window.clearTimeout(delay.current);
      window.clearTimeout(safety);
      delay.current = window.setTimeout(() => setState("loading"), 150);
      // Garde-fou : si aucune page ne s’affiche (lien annulé, erreur réseau), la barre se termine.
      safety = window.setTimeout(() => setState((s) => (s === "loading" ? "done" : s)), 12000);
    };
    const onClick = (e: MouseEvent) => {
      // Écoute en phase de capture : les liens Next.js annulent ensuite le comportement par défaut.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // ancre sur la même page
      if (/^\/(?:telecharger|uploads|api)\//.test(url.pathname)) return;
      start();
    };
    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (!e.defaultPrevented && form.method === "get") start();
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit);
    window.addEventListener("jp:navigation-start", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(safety);
      document.removeEventListener("submit", onSubmit);
      window.removeEventListener("jp:navigation-start", start);
    };
  }, []);

  return (
    <div className="jp-nav-progress" data-state={state} role="progressbar" aria-hidden={state === "idle"} aria-label="Chargement de la page" aria-busy={state === "loading"}>
      <span />
    </div>
  );
}
