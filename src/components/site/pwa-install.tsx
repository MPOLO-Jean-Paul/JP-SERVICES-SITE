"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDownToLine } from "lucide-react";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
let deferred: BeforeInstallPromptEvent | null = null;

/** Enregistre le service worker et affiche le bouton d'installation lorsque le navigateur le permet. */
export function PwaInstall({ className, variant = "icon" }: { className?: string; variant?: "icon" | "text" }) {
  const t = useTranslations("nav");
  const [available, setAvailable] = useState(Boolean(deferred));
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred = e as BeforeInstallPromptEvent;
      setAvailable(true);
    };
    const onInstalled = () => {
      deferred = null;
      setAvailable(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  if (!available) return null;
  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    deferred = null;
    setAvailable(false);
  };
  return (
    <button type="button" onClick={install} aria-label={t("install")} title={t("install")} className={cn(variant === "icon" ? "inline-flex size-10 items-center justify-center rounded-full text-copy transition hover:bg-panel-2 hover:text-ink" : "inline-flex items-center gap-2 text-sm font-medium text-copy hover:text-ink", className)}>
      <ArrowDownToLine className="size-[1.1rem]" aria-hidden />
      {variant === "text" ? t("install") : null}
    </button>
  );
}
