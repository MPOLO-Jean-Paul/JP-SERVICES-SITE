import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { ThemeMenu } from "@/components/site/theme-menu";
import { LanguageMenu } from "@/components/site/language-menu";
import { getSettings } from "@/server/services/settings";
import { CookieConsent } from "@/components/site/cookie-consent";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const [t, tc, s] = await Promise.all([getTranslations("auth"), getTranslations("common"), getSettings()]);
  return (
    <div className="jp-auth-workspace grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="jp-auth-aside relative hidden overflow-hidden bg-brand-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="relative z-10 flex items-center gap-3 text-[12px] font-semibold tracking-[.12em]" aria-label="JP-Services — Accueil">
          <LogoMark className="size-10" />
        </Link>
        <div className="relative z-10 max-w-md">
          <p className="text-[11px] font-medium uppercase tracking-[.13em] text-brand-300">{s.auth_showcase_badge || t("showcaseBadge")}</p>
          <h2 className="mt-6 text-[clamp(37px,3.4vw,51px)] font-semibold leading-[1.16] tracking-[-.055em] text-white">{s.auth_showcase_title || t("showcaseTitle")}</h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-[#c1cce0]">Un espace pour gérer vos formations, retrouver vos ressources et suivre vos projets.</p>
          <Image src="/illustrations/apprendre-partout.svg" width={400} height={400} alt="" priority unoptimized className="jp-auth-illustration mt-10 h-auto w-[min(100%,300px)]" />
        </div>
        <p className="relative z-10 text-[11px] font-medium text-white/50">© {new Date().getFullYear()} JP-Services · Lubumbashi</p>
      </aside>
      <div className="jp-auth-pane flex min-w-0 flex-col">
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
        <main id="main-content" className="jp-auth-main flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="jp-auth-content">{children}</div>
        </main>
      </div>
      <CookieConsent />
    </div>
  );
}
