import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { Facebook, Linkedin, TikTok, Youtube } from "@/components/brand/social-icons";
import { getCurrentUser } from "@/server/auth/session";
import { getSettings } from "@/server/services/settings";
import { NewsletterForm } from "./newsletter-form";
import { OpenCookiesButton } from "./cookie-consent";
import { LanguageMenu } from "./language-menu";
import { PwaInstall } from "./pwa-install";

export async function SiteFooter() {
  const [t, tn, user, s] = await Promise.all([getTranslations("footer"), getTranslations("nav"), getCurrentUser(), getSettings()]);
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
        : [
            { href: "/inscription", label: t("createAccount") },
            { href: "/connexion", label: tn("login") },
            { href: "/mot-de-passe-oublie", label: t("forgot") },
          ],
    },
  ];

  return (
    <footer className="mt-24 border-t bg-canvas-soft">
      <div className="shell">
        <div className="relative -mt-px grid gap-10 overflow-hidden border-x border-b bg-canvas px-6 py-14 sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div className="bg-grid fade-mask pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <span className="eyebrow">JP-Services</span>
            <h2 className="h2 mt-4 max-w-xl">{t("ctaTitle")}</h2>
            <p className="mt-3 max-w-lg text-copy">{t("ctaText")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={user ? "/formations" : "/inscription"} className="inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-5 text-sm font-medium text-canvas shadow-sm transition hover:bg-ink/85">
                {user ? t("ctaPrimaryLogged") : t("ctaPrimary")} <ArrowRight className="size-4" />
              </Link>
              <Link href="/contact" className="inline-flex h-11 items-center rounded-lg border border-line-strong bg-panel px-5 text-sm font-medium transition hover:bg-panel-2">
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>
          <div id="newsletter" className="relative rounded-xl border bg-panel p-5 shadow-xs">
            <p className="kicker">{t("newsletterKicker")}</p>
            <p className="mt-2 font-semibold tracking-tight">{t("newsletterTitle")}</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5" aria-label="JP-Services — Accueil">
            <LogoMark className="size-7 text-ink" />
            <Wordmark />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-copy">{t("brandText")}</p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted">{s.contact_adresse}</p>
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
          <nav key={col.title} aria-label={col.title}>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="group inline-flex items-center gap-1 text-sm text-copy transition hover:text-ink">
                    {l.label}
                    <ArrowUpRight className="size-3 opacity-0 transition group-hover:opacity-100" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t">
        <div className="shell flex flex-col gap-4 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p className="font-mono">
            © {year} JP‑Services · {t("rights")}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
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
          <LanguageMenu variant="select" />
        </div>
      </div>
    </footer>
  );
}
