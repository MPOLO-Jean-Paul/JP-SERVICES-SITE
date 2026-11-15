import type { Metadata } from "next";

export const SITE_NAME = "JP-Services";
export const SITE_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const DEFAULT_DESCRIPTION = "Formations pratiques, logiciels vérifiés, sessions en visioconférence et communauté d’entraide : JP-Services accompagne votre parcours numérique à Lubumbashi et partout en RDC.";

export function pageMetadata(opts: { title: string; description?: string; path: string; image?: string; noIndex?: boolean; type?: "website" | "article"; publishedTime?: string }): Metadata {
  const description = opts.description ?? DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${opts.path}`;
  const image = opts.image ? (opts.image.startsWith("http") ? opts.image : `${SITE_URL}${opts.image}`) : `${SITE_URL}/opengraph-image`;
  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    robots: opts.noIndex ? { index: false, follow: true } : undefined,
    openGraph: { title: `${opts.title} | ${SITE_NAME}`, description, url, siteName: SITE_NAME, locale: "fr_FR", type: opts.type ?? "website", images: [{ url: image, width: 1200, height: 630 }], publishedTime: opts.publishedTime },
    twitter: { card: "summary_large_image", title: `${opts.title} | ${SITE_NAME}`, description, images: [image] },
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return { __html: JSON.stringify({ "@context": "https://schema.org", ...data }) };
}
