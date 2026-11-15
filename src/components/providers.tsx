"use client";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey="jp-theme" disableTransitionOnChange>
      <TooltipProvider delayDuration={250}>{children}</TooltipProvider>
      <Toaster position="bottom-right" richColors closeButton toastOptions={{ classNames: { toast: "font-sans" } }} />
    </ThemeProvider>
  );
}
