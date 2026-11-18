"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { ANNOUNCEMENT_COOKIE, announcementKey } from "@/lib/announcement";

/**
 * Bandeau d’annonce. Affiché dès le rendu serveur (aucun décalage de mise en page) ;
 * la fermeture est mémorisée pour la session dans un cookie lu côté serveur,
 * et le bandeau se replie en douceur.
 */
export function AnnouncementBar({ text, href, label }: { text: string; href: string; label: string }) {
  const [closing, setClosing] = useState(false);
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  const external = /^https?:\/\//i.test(href);
  const dismiss = () => {
    document.cookie = `${ANNOUNCEMENT_COOKIE}=${announcementKey(text)}; path=/; SameSite=Lax`;
    setClosing(true);
  };
  return (
    <aside
      className="jp-announcement relative z-30 border-b bg-brand-950 text-white"
      data-closing={closing}
      aria-label="Annonce"
      onTransitionEnd={(e) => { if (closing && e.propertyName === "grid-template-rows") setHidden(true); }}
    >
      <div className="jp-announcement-inner">
        <div className="shell flex items-center gap-3 py-2 text-[13px]">
          <span className="hidden shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80 ring-1 ring-white/15 sm:inline">Nouveau</span>
          <p className="min-w-0 flex-1 truncate text-white/85">{text}</p>
          {external ? (
            <a href={href} className="group hidden shrink-0 items-center gap-1 font-semibold underline-offset-4 hover:underline sm:inline-flex" target="_blank" rel="noopener noreferrer">
              {label} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          ) : (
            <Link href={href} className="group hidden shrink-0 items-center gap-1 font-semibold underline-offset-4 hover:underline sm:inline-flex">
              {label} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          <button type="button" aria-label="Fermer l’annonce" className="inline-flex size-7 shrink-0 items-center justify-center rounded-full transition hover:bg-white/15" onClick={dismiss}>
            <X className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
