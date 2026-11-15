"use client";
import Script from "next/script";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { googleLoginAction } from "@/server/actions/auth";
import { Alert } from "@/components/ui/alert";

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (c: Record<string, unknown>) => void; renderButton: (el: HTMLElement, o: Record<string, unknown>) => void } } };
  }
}

export function GoogleButton({ clientId, redirectTo }: { clientId: string; redirectTo?: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!ready || !ref.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      ux_mode: "popup",
      callback: (res: { credential?: string }) => {
        if (!res.credential) return;
        startTransition(async () => {
          const out = await googleLoginAction(res.credential!, redirectTo);
          if (out.error) setError(out.error);
          else if (out.redirect) router.push(out.redirect);
        });
      },
    });
    ref.current.innerHTML = "";
    window.google.accounts.id.renderButton(ref.current, { theme: resolvedTheme === "dark" ? "filled_black" : "outline", size: "large", width: ref.current.clientWidth || 360, text: "continue_with", locale, shape: "rectangular" });
  }, [ready, clientId, locale, resolvedTheme, redirectTo, router]);

  return (
    <div className="space-y-3">
      <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" onLoad={() => setReady(true)} />
      <div className="relative flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
        <span className="h-px flex-1 bg-line" /> {t("or")} <span className="h-px flex-1 bg-line" />
      </div>
      <div ref={ref} className="flex min-h-11 w-full justify-center" aria-busy={pending} aria-label={t("google")} />
      {error ? <Alert tone="danger">{error}</Alert> : null}
    </div>
  );
}
