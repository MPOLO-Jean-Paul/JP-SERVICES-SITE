import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "JP-SERVICES — Des solutions numériques remarquables", template: "%s | JP-SERVICES" },
  description: "Studio numérique à Lubumbashi : stratégie, développement web et mobile, logiciels métiers et formation.",
  openGraph: { title: "JP-SERVICES", description: "Des produits numériques pensés pour la réalité du terrain.", type: "website", locale: "fr_CD" },
  robots: process.env.NEXT_PUBLIC_SITE_URL?.includes(".onrender.com") ? { index: false, follow: false } : { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#contenu">Aller au contenu</a>
        <SiteHeader />
        <main id="contenu">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
