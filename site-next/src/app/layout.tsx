import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CONTACT_EMAIL, OFFICIAL_SITE_URL, SITE_LEGAL_NAME, SITE_NAME, isPreviewOrigin, siteOrigin } from "@/lib/identity";
import "./globals.css";
import "./editorial.css";

const origin = siteOrigin();
const isPreview = isPreviewOrigin();

export const metadata: Metadata = {
  title: { default: "JP-SERVICES — Formations et solutions numériques", template: "%s | JP-SERVICES" },
  description: "JP-SERVICES, studio et académie numérique à Lubumbashi : formations pratiques, logiciels métiers, sites web, applications et accompagnement.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: OFFICIAL_SITE_URL }],
  creator: SITE_LEGAL_NAME,
  publisher: SITE_NAME,
  openGraph: {
    title: "JP-SERVICES — Les idées deviennent des solutions",
    description: "Formations, applications et solutions digitales pensées pour les besoins du terrain.",
    type: "website", locale: "fr_CD", siteName: SITE_NAME, url: origin
  },
  robots: isPreview ? { index: false, follow: false } : { index: true, follow: true },
  metadataBase: new URL(origin)
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: OFFICIAL_SITE_URL,
    email: CONTACT_EMAIL,
    address: { "@type": "PostalAddress", addressLocality: "Lubumbashi", addressCountry: "CD" }
  };
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#contenu">Aller au contenu</a>
        <SiteHeader />
        <main id="contenu">{children}</main>
        <SiteFooter />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      </body>
    </html>
  );
}
