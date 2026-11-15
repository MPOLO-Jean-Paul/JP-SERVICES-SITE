"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown, LogOut, Menu as MenuIcon, Shield, UserRound, X } from "lucide-react";
import { MEGA_MENUS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { LogoMark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/ui/dropdown";
import { LanguageMenu } from "./language-menu";
import { ThemeMenu } from "./theme-menu";
import type { SessionUser } from "@/server/auth/session";


type Props = { user: Pick<SessionUser, "displayName" | "email" | "isAdmin" | "photoProfil"> | null; logoutAction: () => Promise<void>; unread?: number };

export function DesktopNav({ user }: { user: Props["user"] }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(null);
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onClick = (e: MouseEvent) => navRef.current && !navRef.current.contains(e.target as Node) && setOpen(null);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClick);
    };
  }, []);

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  };
  const cancelClose = () => closeTimer.current && clearTimeout(closeTimer.current);

  return (
    <nav ref={navRef} className="relative hidden items-center gap-1 lg:flex" aria-label="Menu principal" onMouseLeave={scheduleClose} onMouseEnter={cancelClose}>
      {MEGA_MENUS.map((menu) => {
        const isActive = menu.activePrefixes.some((p) => pathname.startsWith(p));
        const isOpen = open === menu.id;
        return (
          <div key={menu.id} onMouseEnter={() => setOpen(menu.id)}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`menu-${menu.id}`}
              onClick={() => setOpen(isOpen ? null : menu.id)}
              className={cn("relative inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-md px-3 text-[14px] font-medium text-copy transition hover:text-ink", (isActive || isOpen) && "text-ink")}
            >
              {t(menu.label)}
              <ChevronDown className={cn("size-3.5 text-muted transition-transform duration-200", isOpen && "rotate-180")} aria-hidden />
              {isActive ? <span className="absolute -bottom-[17px] left-3 right-3 h-px bg-ink" aria-hidden /> : null}
            </button>
            <div
              id={`menu-${menu.id}`}
              role="region"
              aria-hidden={!isOpen}
              className={cn("absolute left-1/2 top-[calc(100%+14px)] z-50 w-[min(820px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border bg-panel p-2 shadow-lg transition-all duration-200 ease-out-expo", isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0")}
            >
              <div className="grid grid-cols-[1fr_1fr_1.05fr] gap-1">
                {menu.groups.map((group) => (
                  <div key={group.label} className="p-3">
                    <p className="px-3 pb-2 text-[11px] font-medium text-muted">{t(group.label)}</p>
                    <ul className="space-y-0.5">
                      {group.links
                        .filter((l) => !l.authOnly || user)
                        .map((link) => (
                          <li key={link.href + link.title}>
                            <Link href={link.href} className="group/link flex items-start gap-3 rounded-xl p-3 transition hover:bg-panel-2">
                              <span className="icon-box size-9 group-hover/link:border-line-strong">
                                <Icon name={link.icon} />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-medium text-ink">{t(link.title)}</span>
                                <span className="block text-xs leading-relaxed text-muted">{t(link.text)}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
                <div className="bg-grid relative flex flex-col justify-between overflow-hidden rounded-xl border bg-canvas-soft p-6">
                  
                  <div className="relative">
                    <span className="kicker">{t(menu.intro.kicker)}</span>
                    <p className="mt-3 text-lg font-semibold leading-snug tracking-tight">{t(menu.intro.title)}</p>
                    <p className="mt-2 text-sm text-copy">{t(menu.intro.text)}</p>
                  </div>
                  <Link href={menu.intro.ctaHref} className="relative mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-canvas transition hover:bg-ink/85">
                    {t(menu.intro.ctaLabel)} <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function AccountMenu({ user, logoutAction, unread = 0 }: Props) {
  const t = useTranslations("nav");
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
          <ChevronDown className="size-3.5 text-muted" aria-hidden />
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
            <UserRound /> {t("profile")}
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link href="/profil/modifier">
            <Icon name="circle-help" className="size-4" /> {t("settings")}
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
              <Icon name="newspaper" className="size-4" /> {t("notifications")}
            </span>
            {unread > 0 ? <span className="rounded-full bg-accent-500 px-1.5 text-[10px] font-bold text-white">{unread}</span> : null}
          </Link>
        </MenuItem>
        {user.isAdmin ? (
          <>
            <MenuSeparator />
            <MenuItem asChild>
              <Link href="/admin">
                <Shield /> {t("admin")}
              </Link>
            </MenuItem>
          </>
        ) : null}
        <MenuSeparator />
        <form action={logoutAction}>
          <MenuItem asChild>
            <button type="submit" className="w-full text-danger data-[highlighted]:text-danger">
              <LogOut /> {t("logout")}
            </button>
          </MenuItem>
        </form>
      </MenuContent>
    </Menu>
  );
}

export function MobileDrawer({ user, logoutAction }: Props) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const sections = [
    { label: t("learn"), links: [{ href: "/formations", title: t("catalog"), icon: "graduation-cap" }, { href: "/formations-en-ligne", title: t("live"), icon: "video" }, ...(user ? [{ href: "/abonnements", title: t("myTrainings"), icon: "book-open" }] : [])] },
    { label: t("resources"), links: [{ href: "/logiciels", title: t("software"), icon: "download" }, { href: "/scolia", title: t("scolia"), icon: "school" }, { href: "/aide", title: t("help"), icon: "life-buoy" }, { href: "/partenariat", title: t("partnership"), icon: "handshake" }] },
    { label: t("exploreSection"), links: [{ href: "/projets", title: t("projects"), icon: "rocket" }, { href: "/actualites", title: t("news"), icon: "newspaper" }, { href: "/forum", title: t("forum"), icon: "messages-square" }, { href: "/a-propos", title: t("about"), icon: "users" }, { href: "/contact", title: t("contact"), icon: "send" }] },
  ];

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={tc("openMenu")} aria-expanded={open} aria-controls="mobile-drawer" className="inline-flex size-10 items-center justify-center rounded-full text-ink transition hover:bg-panel-2 lg:hidden">
        <MenuIcon className="size-5" />
      </button>
      <div className={cn("fixed inset-0 z-50 bg-black/55 backdrop-blur-sm transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => setOpen(false)} aria-hidden />
      <aside id="mobile-drawer" aria-hidden={!open} className={cn("fixed inset-y-0 left-0 z-50 flex w-[min(22rem,88vw)] flex-col bg-panel shadow-lg transition-transform duration-300 ease-out-expo lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="flex items-center gap-2"><LogoMark className="size-9" /></span>
          <button type="button" onClick={() => setOpen(false)} aria-label={tc("closeMenu")} className="inline-flex size-9 items-center justify-center rounded-full hover:bg-panel-2">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {user ? (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-panel-2 p-3">
              <Avatar name={user.displayName} src={user.photoProfil} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.displayName}</p>
                <p className="truncate text-xs text-muted">{user.isAdmin ? t("administrator") : t("member")}</p>
              </div>
            </div>
          ) : (
            <div className="bg-grid mb-4 rounded-xl border bg-brand-950 p-4 text-white">
              <p className="text-[11px] text-white/60 font-medium">{t("drawerKicker")}</p>
              <p className="mt-1 text-lg font-semibold leading-snug tracking-tight">{t("drawerTitle")}</p>
              <p className="mt-1 text-sm text-white/80">{t("drawerText")}</p>
              <div className="mt-3 flex gap-2">
                <Link href="/inscription" className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-brand-950">
                  {t("signup")}
                </Link>
                <Link href="/connexion" className="rounded-md border border-white/40 px-3 py-2 text-xs font-semibold">
                  {t("login")}
                </Link>
              </div>
            </div>
          )}
          {sections.map((s) => (
            <div key={s.label} className="mb-4">
              <p className="px-3 pb-1 text-[11px] font-medium text-muted">{s.label}</p>
              <ul>
                {s.links.map((l) => (
                  <li key={l.href + l.title}>
                    <Link href={l.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-copy hover:bg-panel-2 hover:text-ink", pathname === l.href && "bg-panel-2 text-ink")}>
                      <Icon name={l.icon} className="size-4" /> {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {user ? (
            <div className="mb-4">
              <p className="px-3 pb-1 text-[11px] font-medium text-muted">{t("mySpace")}</p>
              <ul>
                {[
                  { href: "/profil", title: t("profile") },
                  { href: "/profil/modifier", title: t("settings") },
                  { href: "/mes-projets", title: t("myProjects") },
                  { href: "/notifications", title: t("notifications") },
                  ...(user.isAdmin ? [{ href: "/admin", title: t("admin") }] : []),
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-copy hover:bg-panel-2 hover:text-ink">
                      {l.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <form action={logoutAction}>
                    <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger hover:bg-panel-2">
                      <LogOut className="size-4" /> {t("logout")}
                    </button>
                  </form>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <LanguageMenu />
          <ThemeMenu />
        </div>
        <p className="border-t px-4 py-2 text-[11px] text-muted">{t("location")}</p>
      </aside>
    </>
  );
}
