import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError, noCache, requireAdminResponse } from "@/lib/admin-api";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

const contentSchema = z.object({
  id: z.uuid().optional(),
  type: z.enum(["service", "formation", "logiciel", "projet", "actualite"]),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(90),
  category: z.string().trim().min(2).max(80),
  title: z.string().trim().min(4).max(180),
  description: z.string().trim().min(12).max(480),
  detail: z.string().trim().max(4000),
  status: z.string().trim().max(100),
  published: z.boolean(),
  sort_order: z.number().int().min(0).max(100000)
}).strict();

export async function GET() {
  const blocked = await requireAdminResponse();
  if (blocked) return blocked;
  const db = getDatabase();
  if (!db) return apiError("Base de données indisponible.", 503);
  try {
    const rows = await db.query(
      "SELECT id::text, type, slug, category, title, description, coalesce(detail,'') AS detail, coalesce(status,'') AS status, published, sort_order, created_at, updated_at FROM public.catalogue_items ORDER BY published DESC, sort_order ASC, created_at DESC LIMIT 150"
    );
    return NextResponse.json({ items: rows }, { headers: noCache });
  } catch { return apiError("Catalogue indisponible.", 503); }
}

export async function POST(request: NextRequest) {
  const blocked = await requireAdminResponse(request);
  if (blocked) return blocked;
  if (!(request.headers.get("content-type") || "").startsWith("application/json")) return apiError("Format invalide.", 415);
  let input: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return apiError("Contenu trop volumineux.", 413);
    input = JSON.parse(raw);
  } catch { return apiError("Données JSON invalides.", 400); }
  const parsed = contentSchema.safeParse(input);
  if (!parsed.success) return apiError("Certains champs sont invalides ou incomplets.", 422);
  const db = getDatabase();
  if (!db) return apiError("Base de données indisponible.", 503);
  const d = parsed.data;
  try {
    const rows = d.id
      ? await db.query(
        "UPDATE public.catalogue_items SET type=$1, slug=$2, category=$3, title=$4, description=$5, detail=$6, status=$7, published=$8, sort_order=$9, updated_at=now() WHERE id=$10::uuid RETURNING id::text",
        [d.type,d.slug,d.category,d.title,d.description,d.detail,d.status,d.published,d.sort_order,d.id]
      )
      : await db.query(
        "INSERT INTO public.catalogue_items (type,slug,category,title,description,detail,status,published,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id::text",
        [d.type,d.slug,d.category,d.title,d.description,d.detail,d.status,d.published,d.sort_order]
      );
    if (!rows[0]) return apiError("Contenu introuvable.", 404);
    return NextResponse.json({ saved: true, id: rows[0].id }, { headers: noCache });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "23505") return apiError("Cet identifiant d'URL est déjà utilisé.", 409);
    return apiError("Impossible d'enregistrer le contenu.", 503);
  }
}
