import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";

/** Langue résolue depuis le cookie, sinon depuis Accept-Language (sans préfixe d'URL : les routes restent stables). */
export default getRequestConfig(async () => {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  let locale: Locale = defaultLocale;
  if (isLocale(fromCookie)) locale = fromCookie;
  else {
    const accept = ((await headers()).get("accept-language") ?? "").toLowerCase();
    if (accept.startsWith("en")) locale = "en";
  }
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages, timeZone: "Africa/Lubumbashi", now: new Date() };
});
