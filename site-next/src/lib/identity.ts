/** Identité publique JP-SERVICES. Les URL de préproduction restent distinctes du domaine officiel. */
export const SITE_NAME = "JP-SERVICES";
export const SITE_LEGAL_NAME = "Jeunesse et Progrès Services";
export const OFFICIAL_DOMAIN = "jp-services.org";
export const OFFICIAL_SITE_URL = "https://jp-services.org";
export const CONTACT_EMAIL = "contact@jp-services.org";

export function publicContactEmail(): string {
  const configured = process.env.CONTACT_EMAIL?.trim();
  return configured && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configured) ? configured : CONTACT_EMAIL;
}

export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      const origin = new URL(configured).origin;
      if (origin.startsWith("https://") || origin.startsWith("http://localhost")) return origin;
    } catch { /* Default to official domain. */ }
  }
  return OFFICIAL_SITE_URL;
}

export function isPreviewOrigin(): boolean {
  const origin = siteOrigin();
  return /localhost|127\.0\.0\.1|\.onrender\.com|\.workers\.dev/i.test(origin);
}
