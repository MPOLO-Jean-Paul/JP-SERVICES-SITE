"use client";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-symbol";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const t = useTranslations("footer");
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 1.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      aria-label={t("backToTop")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn("jp-md3-fab jp-back-to-top fixed bottom-5 right-5 z-40 inline-flex size-10 items-center justify-center rounded-full border bg-panel text-ink shadow-md transition-all duration-300 hover:border-primary hover:text-primary", visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0")}
    >
      <MaterialIcon name="arrow_upward" size={19} />
    </button>
  );
}
