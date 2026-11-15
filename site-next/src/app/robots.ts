import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const isPreview = !url || /localhost|127\.0\.0\.1|\.onrender\.com/i.test(url);
  return {
    rules: isPreview ? { userAgent: "*", disallow: "/" } : { userAgent: "*", allow: "/" },
    ...(!isPreview ? { sitemap: new URL("/sitemap.xml", url).href } : {})
  };
}
