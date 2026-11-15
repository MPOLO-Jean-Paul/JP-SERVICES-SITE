import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/identity";
import { getDatabase } from "@/lib/db";
import { formationPrograms } from "@/lib/formation-programs";

export const dynamic = "force-dynamic";
const paths = ["/", "/services", "/formations", "/logiciels", "/projets", "/actualites", "/a-propos", "/contact"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const base: MetadataRoute.Sitemap = paths.map(path => ({
    url: new URL(path, origin).href,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/contact" ? 0.7 : 0.8
  }));

  const db = getDatabase();
  let slugs: string[];
  if (!db) {
    slugs = formationPrograms.map(program => program.slug);
  } else {
    try {
      const rows = await db.query(
        "SELECT slug FROM public.catalogue_items WHERE type='formation' AND published=true ORDER BY sort_order LIMIT 150"
      );
      slugs = rows.map(row => String(row.slug));
    } catch {
      // Ne jamais annoncer dans le sitemap des formations non confirmées en cas d'indisponibilité de la base.
      slugs = [];
    }
  }
  return [...base, ...slugs.filter(slug => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)).map(slug => ({
    url: new URL("/formations/" + slug, origin).href,
    changeFrequency: "monthly" as const,
    priority: 0.7
  }))];
}
