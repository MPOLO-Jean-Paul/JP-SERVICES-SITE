export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";
export const LOCALE_COOKIE = "jp_locale";
export const localeLabels: Record<Locale, { label: string; short: string; description: string }> = {
  fr: { label: "Français", short: "FR", description: "Interface française" },
  en: { label: "English", short: "EN", description: "English interface" },
};
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
