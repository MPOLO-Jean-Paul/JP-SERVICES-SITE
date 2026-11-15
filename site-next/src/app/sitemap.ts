import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/identity";

const paths = ["/", "/services", "/formations", "/logiciels", "/projets", "/actualites", "/a-propos", "/contact"] as const;
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  return paths.map(path => ({
    url: new URL(path, origin).href,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/contact" ? 0.7 : 0.8
  }));
}
