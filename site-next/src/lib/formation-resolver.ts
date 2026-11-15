import { cache } from "react";
import { getDatabase } from "@/lib/db";
import type { CatalogueItem } from "@/lib/content";
import { formationProgramFromSlug, formationSeedItem, type FormationProgram } from "@/lib/formation-programs";

export type FormationResult =
  | { state: "ready"; source: "preview" | "database"; item: CatalogueItem; program: FormationProgram | null }
  | { state: "not-found" }
  | { state: "unavailable" };

/**
 * Aucun brouillon ni fiche fictive n'apparaît en cas de base réelle connectée.
 * La version de présentation ne s'active que lorsque DATABASE_URL est absent.
 */
export const resolveFormation = cache(async (slug: string): Promise<FormationResult> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 90) return { state: "not-found" };
  const db = getDatabase();
  if (!db) {
    const item = formationSeedItem(slug);
    const program = formationProgramFromSlug(slug);
    if (!item || !program) return { state: "not-found" };
    return { state: "ready", source: "preview", item: {...item, slug}, program };
  }
  try {
    const rows = await db.query(
      "SELECT id::text, slug, type AS kind, category, title, description, coalesce(detail, '') AS detail, coalesce(status, '') AS status FROM public.catalogue_items WHERE published = true AND type = 'formation' AND slug = $1 LIMIT 1",
      [slug]
    );
    const raw = rows[0] as Record<string, unknown> | undefined;
    if (!raw) return { state: "not-found" };
    const item: CatalogueItem = {
      id: String(raw.id),
      slug: String(raw.slug),
      kind: "formation",
      category: String(raw.category),
      title: String(raw.title),
      description: String(raw.description),
      detail: String(raw.detail),
      status: String(raw.status)
    };
    return { state: "ready", source: "database", item, program: null };
  } catch {
    return { state: "unavailable" };
  }
});
