import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { CookieConsent } from "@/components/site/cookie-consent";
import { BackToTop } from "@/components/site/back-to-top";
import { SiteMotion } from "@/components/site/site-motion";
import { MobileTabBar } from "@/components/site/mobile-tab-bar";
import { getCurrentUser } from "@/server/auth/session";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [t, user] = await Promise.all([getTranslations("common"), getCurrentUser().catch(() => null)]);
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
        {t("skipToContent")}
      </a>
      {process.env.JP_PREVIEW_MODE === "1" && (
        <div role="status" className="jp-preview-notice border-b px-5 py-2.5 text-center text-xs font-medium leading-relaxed">
          Version de démonstration — comptes et paiements non disponibles.
        </div>
      )}
      <SiteHeader />
      <SiteMotion />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CookieConsent />
      <BackToTop />
      <MobileTabBar signedIn={Boolean(user)} />
    </>
  );
}
