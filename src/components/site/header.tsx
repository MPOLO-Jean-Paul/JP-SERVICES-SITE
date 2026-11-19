import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { ANNOUNCEMENT_COOKIE, announcementKey } from "@/lib/announcement";
import { MaterialIcon } from "@/components/ui/material-symbol";
import { LogoMark } from "@/components/brand/logo";
import { getCurrentUser } from "@/server/auth/session";
import { getSettings } from "@/server/services/settings";
import { countUnreadNotifications } from "@/server/services/formations";
import { logoutAction } from "@/server/actions/auth-logout";
import { AccountMenu, DesktopNav, MobileDrawer } from "./header-nav";
import { AnnouncementBar } from "./announcement-bar";
import { LanguageMenu } from "./language-menu";
import { PwaInstall } from "./pwa-install";
import { SearchPalette } from "./search-palette";
import { ThemeMenu } from "./theme-menu";

export async function SiteHeader() {
  const [t, user, settings] = await Promise.all([getTranslations("nav"), getCurrentUser(), getSettings()]);
  const unread = user ? await countUnreadNotifications(user.id).catch(() => 0) : 0;
  const preview = process.env.JP_PREVIEW_MODE === "1";
  const announcement = settings.annonce_texte?.trim();
  const announcementClosed = announcement ? (await cookies()).get(ANNOUNCEMENT_COOKIE)?.value === announcementKey(announcement) : true;
  const announcementHref = /^(?:https?:\/\/|\/)/i.test(settings.annonce_url ?? "") ? settings.annonce_url! : "/formations";
  const publicUser = user ? { displayName: user.displayName, email: user.email, isAdmin: user.isAdmin, photoProfil: user.photoProfil } : null;

  return (
    <>
      {announcement && !announcementClosed ? <AnnouncementBar text={announcement} href={announcementHref} label={settings.annonce_lien_label || "En savoir plus"} /> : null}
      <header className="glass sticky top-0 z-40 border-b" id="site-header">
        <div className="shell jp-header-inner flex h-16 items-center gap-2.5 sm:gap-3">
          <MobileDrawer user={publicUser} logoutAction={logoutAction} preview={preview} />
          <Link href="/" className="jp-site-logo flex items-center gap-2" aria-label="JP-Services — Accueil">
            <LogoMark className="size-9" />
          </Link>
          <div className="jp-header-navigation mx-auto">
            <DesktopNav user={publicUser} />
          </div>
          <div className="jp-header-actions flex items-center gap-1">
            <SearchPalette compact desktopExpanded />
            <Link href="/aide" aria-label={t("help")} title={t("help")} className="jp-header-help hidden size-10 items-center justify-center rounded-full text-copy transition hover:bg-panel-2 hover:text-ink md:inline-flex">
              <MaterialIcon name="help" size={20} />
            </Link>
            <PwaInstall className="jp-header-install hidden md:inline-flex" />
            <LanguageMenu className="jp-header-language hidden sm:inline-flex" />
            <ThemeMenu className="jp-header-theme hidden sm:inline-flex" />
            <div className="jp-header-account ml-1">
              <AccountMenu user={publicUser} logoutAction={logoutAction} unread={unread} preview={preview} />
              {!user ? (
                <Link href={preview ? "/contact" : "/connexion"} className="inline-flex h-9 items-center rounded-lg bg-ink px-3 text-sm font-medium text-canvas sm:hidden">
                  {preview ? t("contact") : t("access")}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
