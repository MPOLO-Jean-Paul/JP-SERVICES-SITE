import { FormAssist } from "@/components/site/form-assist";
import { AuthAside } from "@/components/auth/auth-aside";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { ThemeMenu } from "@/components/site/theme-menu";
import { LanguageMenu } from "@/components/site/language-menu";
import { getSettings } from "@/server/services/settings";
import { CookieConsent } from "@/components/site/cookie-consent";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const [tc, s] = await Promise.all([getTranslations("common"), getSettings()]);
  return (
    <>
    <FormAssist />
    <div className="jp-auth-workspace grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="jp-auth-aside relative hidden overflow-hidden bg-brand-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="relative z-10 flex items-center gap-3 text-[12px] font-semibold tracking-[.12em]" aria-label="JP-Services — Accueil">
          <LogoMark className="size-10" />
        </Link>
        <AuthAside badge={s.auth_showcase_badge || undefined} title={s.auth_showcase_title || undefined} />
        <p className="relative z-10 text-[11px] font-medium text-white/50">© {new Date().getFullYear()} JP-Services · Lubumbashi</p>
      </aside>
      <div className="jp-auth-pane flex min-w-0 flex-col">
        <header className="jp-auth-topbar flex items-center justify-between gap-3 px-5 py-3 sm:px-10 sm:py-4">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full pr-2 text-sm font-medium text-copy transition hover:text-ink" aria-label={tc("backHome")}>
            <ArrowLeft className="size-4" />
            <span className="lg:hidden"><LogoMark className="size-8" /></span>
            <span className="hidden lg:inline">{tc("backHome")}</span>
          </Link>
          <div className="flex items-center gap-1">
            <LanguageMenu />
            <ThemeMenu />
          </div>
        </header>
        <main id="main-content" className="jp-auth-main flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="jp-auth-content">{children}</div>
        </main>
      </div>
      <CookieConsent />
    </div>
    </>
  );
}
