"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

const KEY = "jp-announcement-dismissed";

export function AnnouncementBar({ text, href, label }: { text: string; href: string; label: string }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(KEY) === text;
    } catch {}
    const id = requestAnimationFrame(() => setHidden(dismissed));
    return () => cancelAnimationFrame(id);
  }, [text]);
  if (hidden) return null;
  const external = /^https?:\/\//i.test(href);
  return (
    <aside className="relative z-30 border-b bg-brand-950 text-white" aria-label="Annonce">
      <div className="shell flex items-center gap-3 py-2 text-[13px]">
        <span className="hidden shrink-0 rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/80 ring-1 ring-white/15 sm:inline">Nouveau</span>
        <p className="min-w-0 flex-1 truncate text-white/85">{text}</p>
        {external ? (
          <a href={href} className="hidden shrink-0 items-center gap-1 font-semibold underline-offset-4 hover:underline sm:inline-flex" target="_blank" rel="noopener noreferrer">
            {label} <ArrowRight className="size-3.5" />
          </a>
        ) : (
          <Link href={href} className="hidden shrink-0 items-center gap-1 font-semibold underline-offset-4 hover:underline sm:inline-flex">
            {label} <ArrowRight className="size-3.5" />
          </Link>
        )}
        <button
          type="button"
          aria-label="Fermer l’annonce"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
          onClick={() => {
            try {
              sessionStorage.setItem(KEY, text);
            } catch {}
            setHidden(true);
          }}
        >
          <X className="size-4" />
        </button>
      </div>
    </aside>
  );
}
