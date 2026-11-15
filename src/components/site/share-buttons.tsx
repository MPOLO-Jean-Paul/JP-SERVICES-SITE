"use client";
import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Telegram, WhatsApp } from "@/components/brand/social-icons";
import { cn } from "@/lib/utils";

export function ShareButtons({ title, path, className, text }: { title: string; path: string; className?: string; text?: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
  const message = `${text ?? title} : ${url}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const native = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
    } else copy();
  };
  const btn = "inline-flex size-9 items-center justify-center rounded-full border text-copy transition hover:border-primary hover:text-primary";
  return (
    <div className={cn("flex items-center gap-2", className)} aria-label="Partager">
      <a className={btn} href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" aria-label="Partager sur WhatsApp"><WhatsApp className="size-4" /></a>
      <a className={btn} href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text ?? title)}`} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Telegram"><Telegram className="size-4" /></a>
      <button type="button" className={btn} onClick={copy} aria-label="Copier le lien">{copied ? <Check className="size-4 text-emerald-600" /> : <Link2 className="size-4" />}</button>
      <button type="button" className={btn} onClick={native} aria-label="Partager"><Share2 className="size-4" /></button>
    </div>
  );
}
