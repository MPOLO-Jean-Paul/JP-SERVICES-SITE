"use client";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-symbol";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const t = useTranslations("footer");
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      aria-label={t("backToTop")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn("jp-md3-fab fixed bottom-5 right-5 z-40 inline-flex size-11 items-center justify-center rounded-full bg-ink text-canvas shadow-md transition-all duration-300 hover:bg-primary dark:bg-white dark:text-brand-950", visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0")}
    >
      <MaterialIcon name="arrow_upward" size={21} />
    </button>
  );
}
