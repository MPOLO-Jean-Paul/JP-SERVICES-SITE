"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";

// Les notifications (sonner) se chargent quand le navigateur est disponible, hors du chemin critique.
const Toaster = dynamic(() => import("sonner").then((m) => m.Toaster), { ssr: false });

export function Providers({ children }: { children: React.ReactNode }) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const id = ric(() => setIdle(true));
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id as number);
  }, []);
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey="jp-theme" disableTransitionOnChange>
      <TooltipProvider delayDuration={250}>{children}</TooltipProvider>
      {idle ? <Toaster position="bottom-right" richColors closeButton toastOptions={{ classNames: { toast: "font-sans" } }} /> : null}
    </ThemeProvider>
  );
}
