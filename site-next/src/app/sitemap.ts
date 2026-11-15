import type { MetadataRoute } from "next";

const paths = ["/", "/services", "/formations", "/logiciels", "/projets", "/actualites", "/a-propos", "/contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return paths.map(path => ({
    url: new URL(path, origin).href,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/contact" ? 0.7 : 0.8
  }));
}
