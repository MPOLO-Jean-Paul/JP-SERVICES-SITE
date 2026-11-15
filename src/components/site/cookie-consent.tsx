"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const KEY = "jp_consent";
type Consent = { analytics: boolean; at: number };
const SIX_MONTHS = 1000 * 60 * 60 * 24 * 182;

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Consent;
    if (!value.at || Date.now() - value.at > SIX_MONTHS) return null;
    return value;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const current = readConsent();
    const id = requestAnimationFrame(() => {
      setVisible(!current);
      setAnalytics(Boolean(current?.analytics));
    });
    const opener = () => setPrefsOpen(true);
    window.addEventListener("jp:open-cookies", opener);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("jp:open-cookies", opener);
    };
  }, []);

  const save = (value: boolean) => {
    localStorage.setItem(KEY, JSON.stringify({ analytics: value, at: Date.now() } satisfies Consent));
    document.cookie = `${KEY}=${value ? "all" : "essential"}; path=/; max-age=${SIX_MONTHS / 1000}; SameSite=Lax`;
    setAnalytics(value);
    setVisible(false);
    setPrefsOpen(false);
  };

  return (
    <>
      {visible ? (
        <aside role="dialog" aria-labelledby="cookie-title" className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl rounded-xl border bg-panel p-5 shadow-lg animate-fade-up sm:inset-x-auto sm:left-5">
          <div className="flex gap-3">
            <span className="icon-box">
              <Cookie />
            </span>
            <div>
              <h2 id="cookie-title" className="font-semibold">
                {t("title")}
              </h2>
              <p className="mt-1 text-sm text-copy">{t("text")}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="dark" onClick={() => save(true)}>
              {t("accept")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => save(false)}>
              {t("refuse")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPrefsOpen(true)}>
              {t("customize")}
            </Button>
          </div>
        </aside>
      ) : null}
      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent title={t("title")} description={t("text")}>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-medium">{t("essential")}</p>
                <p className="text-sm text-copy">{t("essentialText")}</p>
              </div>
              <input type="checkbox" checked disabled className="mt-1 size-4 accent-[var(--primary)]" aria-label={t("essential")} />
            </div>
            <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4">
              <span>
                <span className="block font-medium">{t("analytics")}</span>
                <span className="block text-sm text-copy">{t("analyticsText")}</span>
              </span>
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 size-4 accent-[var(--primary)]" />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Link href="/cookies" className="text-sm text-primary underline-offset-4 hover:underline" onClick={() => setPrefsOpen(false)}>
              {t("policy")}
            </Link>
            <Button variant="dark" onClick={() => save(analytics)}>{t("savePrefs")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function OpenCookiesButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event("jp:open-cookies"))}>
      {children}
    </button>
  );
}
