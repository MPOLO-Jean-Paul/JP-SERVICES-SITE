import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { ThemeMenu } from "@/components/site/theme-menu";
import { LanguageMenu } from "@/components/site/language-menu";
import { getSettings } from "@/server/services/settings";
import { CookieConsent } from "@/components/site/cookie-consent";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const [t, tc, s] = await Promise.all([getTranslations("auth"), getTranslations("common"), getSettings()]);
  const points = t.raw("showcasePoints") as string[];
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12" aria-hidden>
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [--grid-line:rgb(255_255_255/0.05)]" />
        <div className="pointer-events-none absolute -right-32 -top-32 size-[480px] rounded-full bg-brand-600/35 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <LogoMark className="size-10" />
        </Link>
        <div className="relative max-w-md">
          <span className="text-[11px] text-brand-300 font-medium">{s.auth_showcase_badge || t("showcaseBadge")}</span>
          <h2 className="h1 mt-5 text-white">{s.auth_showcase_title || t("showcaseTitle")}</h2>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/85">
                <CheckCircle2 className="size-4 text-brand-300" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-[11px] text-white/40 font-medium">© {new Date().getFullYear()} JP‑Services · Lubumbashi</p>
      </aside>
      <div className="flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-copy hover:text-ink">
            <ArrowLeft className="size-4" /> {tc("backHome")}
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="mr-2 flex items-center gap-2 lg:hidden" aria-label="JP-Services">
              <LogoMark className="size-9" />
            </Link>
            <LanguageMenu />
            <ThemeMenu />
          </div>
        </header>
        <main id="main-content" className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
      <CookieConsent />
    </div>
  );
}
