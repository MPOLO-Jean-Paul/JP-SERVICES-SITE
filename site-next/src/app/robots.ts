import type { MetadataRoute } from "next";
import { isPreviewOrigin, siteOrigin } from "@/lib/identity";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewOrigin()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] },
    sitemap: new URL("/sitemap.xml", siteOrigin()).href
  };
}
