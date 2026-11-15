"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, MapPin, Menu, Moon, Sun, X } from "lucide-react";
import { GlobalSearch } from "@/components/global-search";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/content";
import { CONTACT_EMAIL } from "@/lib/identity";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("jp-theme-next");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const choice = saved === "light" ? false : saved === "dark" ? true : prefersDark;
    setDark(choice);
    document.documentElement.dataset.theme = choice ? "dark" : "light";
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [menuOpen]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("jp-theme-next", next ? "dark" : "light");
  }

  return (
    <header className="site-header editorial-header">
      <div className="editorial-utility">
        <div className="shell editorial-utility-inner">
          <span><MapPin size={12} aria-hidden="true"/> LUBUMBASHI · RÉPUBLIQUE DÉMOCRATIQUE DU CONGO</span>
          <a href={"mailto:" + CONTACT_EMAIL}>{CONTACT_EMAIL} <ArrowUpRight size={13} aria-hidden="true"/></a>
        </div>
      </div>
      <div className="shell site-header-inner editorial-header-inner">
        <Link className="brand editorial-brand" href="/" aria-label="JP-SERVICES — Accueil">
          <span className="brand-symbol" aria-hidden="true">J<span>P</span></span>
          <span className="editorial-brand-text">JP<span className="brand-separator">/</span>SERVICES<small>STUDIO & ACADÉMIE NUMÉRIQUE</small></span>
        </Link>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Navigation principale" id="main-nav">
          {navLinks.map(link => (
            <Link href={link.href} key={link.href} className={pathname === link.href ? "nav-link active" : "nav-link"} aria-current={pathname === link.href ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
          <Link href="/contact" className="nav-contact-mobile">Discuter de mon projet <ArrowRight size={16}/></Link>
        </nav>
        <div className="header-actions editorial-header-actions">
          <GlobalSearch />
          <button type="button" className="icon-button theme-switch" aria-label={dark ? "Activer le thème clair" : "Activer le thème sombre"} title="Changer le thème" onClick={toggleTheme}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
          <Link className="header-cta" href="/contact">Nous contacter <ArrowUpRight size={16}/></Link>
          <button className="icon-button mobile-menu-button" type="button" aria-expanded={menuOpen} aria-controls="main-nav" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22}/> : <Menu size={22}/>}</button>
        </div>
      </div>
    </header>
  );
}
