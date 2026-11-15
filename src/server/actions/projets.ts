"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { getCurrentUser, clientIp } from "@/server/auth/session";
import { rateLimit } from "@/server/security/rate-limit";
import type { FormState } from "./contact";

const projectSchema = z.object({ titre: z.string().trim().min(5, "Le titre doit contenir entre 5 et 180 caractères.").max(180, "Le titre doit contenir entre 5 et 180 caractères."), description: z.string().trim().min(30, "La description doit contenir entre 30 et 10 000 caractères.").max(10_000, "La description doit contenir entre 30 et 10 000 caractères.") });

export async function submitProjectAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?redirect_to=/projets");
  const raw = { titre: String(formData.get("titre") ?? ""), description: String(formData.get("description") ?? "") };
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message, values: raw };
  if (!(await rateLimit(`project:${user.id}:${await clientIp()}`, 5, 3600))) return { status: "error", message: "Trop de projets ont été soumis récemment. Réessayez un peu plus tard.", values: raw };
  try {
    await db.insert(schema.projets).values({ titre: parsed.data.titre, description: parsed.data.description, auteurId: user.id });
    revalidatePath("/projets");
    return { status: "success", message: "Votre projet a été transmis à notre équipe." };
  } catch (error) {
    console.error("projet", error);
    return { status: "error", message: "Le projet n’a pas pu être enregistré. Veuillez réessayer.", values: raw };
  }
}
