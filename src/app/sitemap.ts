import type { MetadataRoute } from "next";
import { db, schema } from "@/server/db";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    ...["/services", "/formations", "/formations-en-ligne", "/logiciels", "/scolia", "/projets", "/forum", "/actualites", "/partenariat", "/a-propos", "/contact", "/aide", "/solution-digitale", "/produits", "/conditions", "/confidentialite", "/cookies"].map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "/formations" || p === "/scolia" || p === "/services" ? 0.9 : 0.7 })),
  ];
  try {
    const [formations, actualites, posts] = await Promise.all([
      db.select({ id: schema.formations.id, d: schema.formations.dateCreation }).from(schema.formations),
      db.select({ id: schema.actualites.id, d: schema.actualites.datePublication }).from(schema.actualites),
      db.select({ id: schema.posts.id, d: schema.posts.datePublication }).from(schema.posts),
    ]);
    return [
      ...statics,
      ...formations.map((f) => ({ url: `${SITE_URL}/formations/${f.id}`, lastModified: f.d, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...actualites.map((a) => ({ url: `${SITE_URL}/actualites/${a.id}`, lastModified: a.d, changeFrequency: "monthly" as const, priority: 0.6 })),
      ...posts.map((p) => ({ url: `${SITE_URL}/forum/${p.id}`, lastModified: p.d, changeFrequency: "monthly" as const, priority: 0.4 })),
    ];
  } catch {
    return statics;
  }
}
