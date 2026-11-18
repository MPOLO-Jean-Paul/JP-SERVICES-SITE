"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/ui/material-symbol";
import { cn } from "@/lib/utils";

/**
 * Barre d’onglets mobile, comme dans une application : accès en un geste aux
 * rubriques principales. Elle s’efface quand on descend et revient quand on remonte.
 */
export function MobileTabBar({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    last.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last.current;
      if (Math.abs(delta) < 8) return;
      setHidden(delta > 0 && y > 160);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tabs = [
    { href: "/", icon: "home", label: tc("home"), match: (p: string) => p === "/" },
    { href: "/formations", icon: "school", label: t("formations"), match: (p: string) => p.startsWith("/formations") },
    { href: "/logiciels", icon: "apps", label: t("software"), match: (p: string) => p.startsWith("/logiciels") || p.startsWith("/scolia") },
    { href: "/recherche", icon: "search", label: tc("search"), match: (p: string) => p.startsWith("/recherche") },
    signedIn
      ? { href: "/profil", icon: "account_circle", label: t("mySpace"), match: (p: string) => ["/profil", "/notifications", "/mes-projets", "/abonnements"].some((r) => p.startsWith(r)) }
      : { href: "/connexion", icon: "account_circle", label: t("access"), match: (p: string) => p.startsWith("/connexion") },
  ];

  return (
    <nav className="jp-tabbar md:hidden" data-hidden={hidden} aria-label="Navigation principale mobile">
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link key={tab.href} href={tab.href} className={cn("jp-tab", active && "jp-tab-active")} aria-current={active ? "page" : undefined}>
            <span className="jp-tab-icon"><MaterialIcon name={tab.icon} size={22} filled={active} /></span>
            <span className="jp-tab-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
