import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { MaterialIcon } from "@/components/ui/material-symbol";
import { LogoMark } from "@/components/brand/logo";
import { Facebook, Linkedin, TikTok, Youtube } from "@/components/brand/social-icons";
import { getCurrentUser } from "@/server/auth/session";
import { getSettings } from "@/server/services/settings";
import { NewsletterForm } from "./newsletter-form";
import { OpenCookiesButton } from "./cookie-consent";
import { LanguageMenu } from "./language-menu";
import { PwaInstall } from "./pwa-install";

export async function SiteFooter() {
  const [t, tn, user, s, locale] = await Promise.all([getTranslations("footer"), getTranslations("nav"), getCurrentUser(), getSettings(), getLocale()]);
  const preview = process.env.JP_PREVIEW_MODE === "1";
  const year = new Date().getFullYear();
  const socials = [
    { href: s.social_facebook, label: "Facebook", Icon: Facebook },
    { href: s.social_linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: s.social_youtube, label: "YouTube", Icon: Youtube },
    { href: s.social_tiktok, label: "TikTok", Icon: TikTok },
  ].filter((x) => x.href);

  const cols = [
    {
      title: t("learnCol"),
      links: [
        { href: "/formations", label: t("allTrainings") },
        { href: "/formations-en-ligne", label: tn("live") },
        { href: "/logiciels", label: t("softwareDownload") },
        { href: "/scolia", label: tn("scolia") },
        ...(user ? [{ href: "/abonnements", label: tn("myTrainings") }] : []),
        { href: "/aide", label: tn("help") },
      ],
    },
    {
      title: t("servicesCol"),
      links: [
        { href: "/services", label: tn("ourServices") },
        { href: "/projets", label: tn("projects") },
        { href: "/forum", label: tn("forum") },
        { href: "/actualites", label: tn("news") },
        { href: "/partenariat", label: tn("partnership") },
        { href: "/a-propos", label: t("mission") },
      ],
    },
    {
      title: t("accountCol"),
      links: user
        ? [
            { href: "/profil", label: tn("profile") },
            { href: "/profil/modifier", label: tn("settings") },
            { href: "/notifications", label: tn("notifications") },
            { href: "/mes-projets", label: tn("myProjects") },
          ]
        : preview
          ? [
              { href: "/contact", label: tn("contact") },
              { href: "/aide", label: tn("help") },
              { href: "/formations", label: tn("formations") },
            ]
          : [
              { href: "/inscription", label: t("createAccount") },
              { href: "/connexion", label: tn("login") },
              { href: "/mot-de-passe-oublie", label: t("forgot") },
            ],
    },
  ];

  return (
    <footer className="jp-site-footer border-t bg-canvas-soft">
      <div className="shell">
        <div className="jp-footer-intro grid gap-12 border-b py-14 sm:py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div className="relative">
            <p className="jp-overline">Restons en contact</p>
            <h2 className="jp-footer-title mt-5 max-w-xl">{preview ? (locale === "en" ? "Let’s talk about your project." : "Parlons de votre projet.") : t("ctaTitle")}</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-copy">{preview ? (locale === "en" ? "Explore our services and tell us what you want to build or learn." : "Découvrez nos services et présentez-nous ce que vous souhaitez apprendre ou réaliser.") : t("ctaText")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={preview ? "/contact" : user ? "/formations" : "/inscription"} className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-5 text-[13px] font-medium text-canvas transition-colors hover:bg-primary hover:text-white">
                {preview ? tn("contact") : user ? t("ctaPrimaryLogged") : t("ctaPrimary")} <MaterialIcon name="arrow_forward" size={20} className="size-4" />
              </Link>
              <Link href={preview ? "/formations" : "/contact"} className="inline-flex h-11 items-center rounded-md border border-line-strong bg-panel px-5 text-[13px] font-medium transition-colors hover:border-primary hover:text-primary">
                {preview ? tn("formations") : t("ctaSecondary")}
              </Link>
            </div>
          </div>
          <div id="newsletter" className="jp-footer-newsletter">
            <p className="jp-overline">{t("newsletterKicker")}</p>
            <p className="mt-3 max-w-sm text-[15px] font-semibold tracking-tight">{t("newsletterTitle")}</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      <div className="shell jp-footer-directory grid grid-cols-2 gap-x-7 gap-y-10 py-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-x-12 lg:py-16">
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="JP-Services — Accueil">
            <LogoMark className="size-9" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-copy">{t("brandText")}</p>
          <p className="mt-4 text-[11px] text-muted font-medium">{s.contact_adresse}</p>
          {socials.length ? (
            <div className="mt-6 flex gap-1.5" aria-label={t("followCol")}>
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="inline-flex size-9 items-center justify-center rounded-lg border bg-panel text-copy transition hover:border-line-strong hover:text-ink">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          ) : null}
          <div className="mt-5">
            <PwaInstall variant="text" />
          </div>
        </div>
        {cols.map((col) => (
          <nav className="jp-footer-navigation" key={col.title} aria-label={col.title}>
            <p className="border-b pb-3 text-[12px] font-semibold text-ink">{col.title}</p>
            <ul className="mt-3 space-y-1">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="group inline-flex min-h-9 items-center gap-1 py-1 text-[12px] leading-[1.45] text-copy transition-colors hover:text-primary">
                    {l.label}
                    <MaterialIcon name="north_east" size={20} className="size-3 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t">
        <div className="shell jp-footer-bottom flex flex-col gap-5 py-6 text-xs text-muted lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {year} JP‑Services · {t("rights")}
          </p>
          <div className="jp-footer-legal flex flex-wrap gap-x-5 gap-y-3">
            <Link href="/conditions" className="hover:text-ink">
              {t("terms")}
            </Link>
            <Link href="/confidentialite" className="hover:text-ink">
              {t("dataProtection")}
            </Link>
            <Link href="/cookies" className="hover:text-ink">
              {t("cookiesPolicy")}
            </Link>
            <OpenCookiesButton className="hover:text-ink">{t("manageCookies")}</OpenCookiesButton>
            <Link href="/contact" className="hover:text-ink">
              {tn("contact")}
            </Link>
          </div>
          <div className="jp-footer-language flex items-center gap-2"><LanguageMenu variant="select" /></div>
        </div>
      </div>
    </footer>
  );
}
