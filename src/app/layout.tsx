import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { NavigationProgress } from "@/components/site/navigation-progress";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";
import "./senior-ui.css";
import "./responsive-type.css";
import "./visual-polish.css";
import "./material3.css";
import "./consistency.css";
import "./experience.css";
import "./journey-polish.css";
import "./home-campaign.css";
import "./home-illustrations.css";
import "./native-feel.css";
import "./desktop-elegance.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Formations et services digitaux`, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  // Un aperçu public n'est jamais une publication indexable.
  robots: process.env.JP_PREVIEW_MODE === "1" ? { index: false, follow: false, noarchive: true } : undefined,
  applicationName: SITE_NAME,
  keywords: ["formation", "informatique", "Lubumbashi", "RDC", "logiciels", "gestion scolaire", "SCOLIA", "développement web", "bureautique"],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }], apple: "/icons/apple-touch-icon.png" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "fr_FR", url: SITE_URL },
  twitter: { card: "summary_large_image" },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  return (
    <html lang={locale} suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <Suspense fallback={null}><NavigationProgress /></Suspense>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
