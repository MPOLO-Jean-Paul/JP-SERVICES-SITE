"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { locales, localeLabels } from "@/i18n/config";
import { setLocale } from "@/server/actions/locale";
import { MaterialIcon } from "@/components/ui/material-symbol";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { LogoMark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/ui/dropdown";
import type { SessionUser } from "@/server/auth/session";


const NAV_ICONS: Record<string, string> = {
  "/formations": "school", "/formations-en-ligne": "videocam", "/logiciels": "apps",
  "/projets": "workspaces", "/a-propos": "info", "/abonnements": "menu_book",
  "/scolia": "account_tree", "/aide": "help", "/actualites": "newspaper",
  "/forum": "forum", "/partenariat": "handshake", "/contact": "mail",
};

type Props = { user: Pick<SessionUser, "displayName" | "email" | "isAdmin" | "photoProfil"> | null; logoutAction: () => Promise<void>; unread?: number; preview?: boolean };

export function DesktopNav({ user }: { user: Props["user"] }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const links = [
    { href: "/formations", icon: "school", label: t("formations") },
    { href: "/formations-en-ligne", icon: "videocam", label: t("live") },
    { href: "/logiciels", icon: "apps", label: t("software") },
    { href: "/projets", icon: "workspaces", label: t("projects") },
    { href: "/a-propos", icon: "info", label: t("about") },
  ];
  return (
    <nav className="hidden items-center gap-1 xl:flex" aria-label="Menu principal">
      {links.map(link => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return <Link
          href={link.href}
          key={link.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "jp-nav-link relative inline-flex min-h-10 items-center whitespace-nowrap px-3 text-[13px] font-medium text-copy transition-colors hover:text-ink",
            active && "jp-nav-link-active text-ink",
          )}
        ><MaterialIcon name={link.icon} size={17} filled={active} />{link.label}</Link>;
      })}
      {user ? <Link href="/profil" className="sr-only">Mon espace</Link> : null}
    </nav>
  );
}

export function AccountMenu({ user, logoutAction, unread = 0, preview = false }: Props) {
  const t = useTranslations("nav");
  const [logoutPending, startLogout] = useTransition();
  if (!user && preview) return <Link href="/contact" className="hidden min-h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-canvas sm:inline-flex">{t("contact")}</Link>;
  if (!user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Link href="/connexion" className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-copy transition hover:bg-panel-2 hover:text-ink">
          {t("login")}
        </Link>
        <Link href="/inscription" className="inline-flex h-9 items-center gap-2 rounded-lg bg-ink px-3.5 text-sm font-medium text-canvas shadow-sm transition hover:bg-ink/85">
          {t("signup")}
        </Link>
      </div>
    );
  }
  return (
    <Menu modal={false}>
      <MenuTrigger asChild>
        <button type="button" className="relative inline-flex h-9 items-center gap-2 rounded-full border pl-0.5 pr-2.5 text-sm font-medium text-ink transition hover:bg-panel-2" aria-label={t("mySpace")}>
          <Avatar name={user.displayName} src={user.photoProfil} size={30} />
          <span className="hidden max-w-32 truncate md:inline">{user.displayName}</span>
          <MaterialIcon name="keyboard_arrow_down" size={20} className="size-3.5 text-muted" />
          {unread > 0 ? <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">{unread}</span> : null}
        </button>
      </MenuTrigger>
      <MenuContent className="min-w-64">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar name={user.displayName} src={user.photoProfil} size={38} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{user.displayName}</p>
            <p className="truncate text-xs text-muted">{user.isAdmin ? t("administrator") : t("member")}</p>
          </div>
        </div>
        <MenuSeparator />
        <MenuLabel>{t("mySpace")}</MenuLabel>
        <MenuItem asChild>
          <Link href="/profil">
            <MaterialIcon name="account_circle" size={20} /> {t("profile")}
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link href="/profil/modifier">
            <Icon name="settings" className="size-4" /> {t("settings")}
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link href="/abonnements">
            <Icon name="book-open" className="size-4" /> {t("myTrainings")}
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link href="/mes-projets">
            <Icon name="folder-kanban" className="size-4" /> {t("myProjects")}
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link href="/notifications" className="justify-between">
            <span className="flex items-center gap-3">
              <Icon name="notifications" className="size-4" /> {t("notifications")}
            </span>
            {unread > 0 ? <span className="rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-white">{unread}</span> : null}
          </Link>
        </MenuItem>
        {user.isAdmin ? (
          <>
            <MenuSeparator />
            <MenuItem asChild>
              <Link href="/admin">
                <MaterialIcon name="shield" size={20} /> {t("admin")}
              </Link>
            </MenuItem>
          </>
        ) : null}
        <MenuSeparator />
        <MenuItem
          disabled={logoutPending}
          className="text-danger data-[highlighted]:text-danger"
          onSelect={() => {
            // Un submit natif depuis un menu Radix qui se démonte peut être perdu.
            // La transition garantit l'appel de l'action serveur de déconnexion.
            startLogout(() => { void logoutAction(); });
          }}
        >
          <MaterialIcon name="logout" size={20} /> {t("logout")}
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

export function MobileDrawer({ user, logoutAction, preview = false }: Props) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const [pendingLanguage, startLanguageTransition] = useTransition();
  const [showLanguage, setShowLanguage] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }

  const sections = [
    { label: t("learn"), links: [
      { href: "/formations", title: t("catalog") },
      { href: "/formations-en-ligne", title: t("live") },
      ...(user ? [{ href: "/abonnements", title: t("myTrainings") }] : []),
    ] },
    { label: t("resources"), links: [
      { href: "/logiciels", title: t("software") },
      { href: "/scolia", title: t("scolia") },
      { href: "/aide", title: t("help") },
    ] },
    { label: t("exploreSection"), links: [
      { href: "/projets", title: t("projects") },
      { href: "/actualites", title: t("news") },
      { href: "/forum", title: t("forum") },
      { href: "/partenariat", title: t("partnership") },
      { href: "/a-propos", title: t("about") },
      { href: "/contact", title: t("contact") },
    ] },
  ];
  const close = () => setOpen(false);
  const changeLanguage = (next: string) => {
    if (next === locale) return;
    startLanguageTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
    <DialogPrimitive.Trigger asChild>
      <button type="button" aria-label={tc("openMenu")} aria-controls="mobile-drawer" aria-expanded={open}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-ink transition-colors hover:bg-panel-2 xl:hidden">
        <MaterialIcon name="menu" size={20} className="size-[21px]" />
      </button>
    </DialogPrimitive.Trigger>
    {/* Portal indispensable : le backdrop-filter de l'en-tête est un contenant
        pour position:fixed, ce qui tronquait auparavant le tiroir mobile. */}
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[110] bg-[#0e1829]/65 data-[state=open]:animate-fade-in xl:hidden" />
      <DialogPrimitive.Content id="mobile-drawer" aria-describedby="mobile-drawer-description"
        className="fixed inset-y-0 left-0 z-[111] flex w-[min(360px,92vw)] max-w-full flex-col overflow-hidden border-r bg-panel shadow-lg outline-none data-[state=open]:animate-slide-in-left xl:hidden">
        <DialogPrimitive.Title className="sr-only">{tc("openMenu")}</DialogPrimitive.Title>
        <DialogPrimitive.Description id="mobile-drawer-description" className="sr-only">Choisissez une rubrique de JP-Services.</DialogPrimitive.Description>
        <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
          <Link href="/" onClick={close} aria-label="JP-Services — Accueil" className="flex items-center gap-3">
            <LogoMark className="size-9" />
            <span className="text-[13px] font-semibold tracking-tight">JP-SERVICES</span>
          </Link>
          <DialogPrimitive.Close asChild>
            <button type="button" aria-label={tc("closeMenu")} className="inline-flex size-10 items-center justify-center rounded-md hover:bg-panel-2">
              <MaterialIcon name="close" size={20} className="size-5" />
            </button>
          </DialogPrimitive.Close>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 scrollbar-thin" data-testid="mobile-navigation">
          {sections.map((section, index) => <section key={section.label} className="mb-7">
            <p className="mb-2 flex gap-3 border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              <span className="font-mono">{String(index + 1).padStart(2, "0")}</span>{section.label}
            </p>
            <nav aria-label={section.label}>
              {section.links.map(link => <Link key={link.href} href={link.href} onClick={close}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn("jp-md3-drawer-link group flex min-h-11 items-center justify-between rounded-2xl px-3 text-[14px] font-medium text-copy transition-colors hover:bg-panel-2 hover:text-ink", pathname === link.href && "bg-panel-2 text-ink")}>
                <span className="flex min-w-0 items-center gap-3"><MaterialIcon name={NAV_ICONS[link.href] ?? "arrow_forward"} size={20} />{link.title}</span><MaterialIcon name="arrow_forward" size={18} className="text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>)}
            </nav>
          </section>)}
          {user ? <section className="mb-7">
            <p className="mb-2 border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">{t("mySpace")}</p>
            <Link href="/profil" onClick={close} className="flex min-h-11 items-center px-2 text-sm font-medium">{user.displayName}</Link>
            <Link href="/notifications" onClick={close} className="flex min-h-11 items-center px-2 text-sm">{t("notifications")}</Link>
            {user.isAdmin ? <Link href="/admin" onClick={close} className="flex min-h-11 items-center px-2 text-sm">{t("admin")}</Link> : null}
            <form action={logoutAction}><button type="submit" className="flex min-h-11 items-center gap-2 px-2 text-sm text-danger"><MaterialIcon name="logout" size={20} className="size-4" />{t("logout")}</button></form>
          </section> : null}
        </div>
        <div className="shrink-0 border-t px-5 py-4">
          {!user ? <div className="mb-4 grid grid-cols-2 gap-2">
            <Link href={preview ? "/formations" : "/connexion"} onClick={close} className="inline-flex min-h-11 items-center justify-center rounded-md border px-3 text-xs font-semibold">{preview ? t("formations") : t("login")}</Link>
            <Link href={preview ? "/contact" : "/inscription"} onClick={close} className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-3 text-xs font-semibold text-canvas">{preview ? t("contact") : t("signup")}</Link>
          </div> : null}
          <div className="jp-drawer-preferences" aria-label="Préférences d’affichage">
            <div className="flex items-center justify-between gap-3">
              <button type="button" data-testid="drawer-language-trigger" aria-expanded={showLanguage}
                aria-controls="drawer-languages" className="jp-drawer-pref-trigger"
                onClick={() => {setShowLanguage(v=>!v);setShowTheme(false);}}>
                <MaterialIcon name="language" size={19}/><span>{localeLabels[locale as keyof typeof localeLabels]?.short ?? "FR"}</span>
                <MaterialIcon name="keyboard_arrow_down" size={16}/>
              </button>
              <button type="button" data-testid="drawer-theme-trigger" aria-expanded={showTheme}
                aria-controls="drawer-themes" className="jp-drawer-pref-trigger"
                onClick={() => {setShowTheme(v=>!v);setShowLanguage(false);}}>
                <MaterialIcon name="contrast" size={19}/><span>{t("theme")}</span>
                <MaterialIcon name="keyboard_arrow_down" size={16}/>
              </button>
            </div>
            {showLanguage ? <div id="drawer-languages" className="jp-drawer-pref-options" role="group" aria-label={t("language")}>
              {locales.map(value=><button key={value} type="button" data-testid={`drawer-language-${value}`}
                aria-pressed={locale===value} disabled={pendingLanguage}
                onClick={()=>changeLanguage(value)}>{localeLabels[value].label}</button>)}
            </div>:null}
            {showTheme ? <div id="drawer-themes" className="jp-drawer-pref-options" role="group" aria-label={t("theme")}>
              {(["light","dark","system"] as const).map(value=><button key={value} type="button"
                data-testid={`drawer-theme-${value}`} aria-pressed={theme===value}
                onClick={()=>setTheme(value)}>{value==="light"?t("themeLight"):value==="dark"?t("themeDark"):t("themeSystem")}</button>)}
            </div>:null}
          </div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}
