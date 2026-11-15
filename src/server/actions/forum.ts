"use server";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";
import { rateLimit } from "@/server/security/rate-limit";
import type { FormState } from "./contact";

const postSchema = z.object({ titre: z.string().trim().min(5, "Le titre doit contenir entre 5 et 180 caractères.").max(180), contenu: z.string().trim().min(20, "Le contenu doit contenir au moins 20 caractères.").max(20_000, "Le contenu est trop long.") });

async function requireMember(back: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?redirect_to=${encodeURIComponent(back)}`);
  return user;
}

export async function createPostAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireMember("/forum/nouveau");
  const raw = { titre: String(formData.get("titre") ?? ""), contenu: String(formData.get("contenu") ?? "") };
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message, values: raw };
  if (!(await rateLimit(`post:${user.id}`, 10, 3600))) return { status: "error", message: "Trop de publications récentes. Patientez un peu.", values: raw };
  const [res] = await db.insert(schema.posts).values({ ...parsed.data, auteurId: user.id }).returning({ id: schema.posts.id });
  revalidatePath("/forum");
  redirect(`/forum/${res?.id ?? ""}`);
}

export async function updatePostAction(postId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireMember(`/forum/${postId}/modifier`);
  const raw = { titre: String(formData.get("titre") ?? ""), contenu: String(formData.get("contenu") ?? "") };
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message, values: raw };
  const post = (await db.select({ auteurId: schema.posts.auteurId }).from(schema.posts).where(eq(schema.posts.id, postId)).limit(1))[0];
  if (!post || (post.auteurId !== user.id && !user.isAdmin)) return { status: "error", message: "Vous ne pouvez pas modifier cette publication." };
  await db.update(schema.posts).set(parsed.data).where(eq(schema.posts.id, postId));
  revalidatePath("/forum");
  revalidatePath(`/forum/${postId}`);
  redirect(`/forum/${postId}`);
}

export async function deletePostAction(postId: number) {
  const user = await requireMember("/forum");
  const post = (await db.select({ auteurId: schema.posts.auteurId }).from(schema.posts).where(eq(schema.posts.id, postId)).limit(1))[0];
  if (!post || (post.auteurId !== user.id && !user.isAdmin)) return { ok: false, message: "Suppression refusée." };
  await db.delete(schema.posts).where(eq(schema.posts.id, postId));
  revalidatePath("/forum");
  redirect("/forum?supprime=1");
}

export async function toggleLikeAction(postId: number): Promise<{ liked: boolean; total: number } | { error: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Connectez-vous pour aimer une publication." };
  if (!(await rateLimit(`like:${user.id}`, 60, 600))) return { error: "Trop d’actions successives." };
  const existing = await db.select({ postId: schema.likes.postId }).from(schema.likes).where(and(eq(schema.likes.postId, postId), eq(schema.likes.userId, user.id))).limit(1);
  if (existing.length) await db.delete(schema.likes).where(and(eq(schema.likes.postId, postId), eq(schema.likes.userId, user.id)));
  else await db.insert(schema.likes).values({ postId, userId: user.id }).catch(() => {});
  const c = Number((await db.select({ c: sql<number>`COUNT(*)` }).from(schema.likes).where(eq(schema.likes.postId, postId)))[0]?.c ?? 0);
  revalidatePath("/forum");
  revalidatePath(`/forum/${postId}`);
  return { liked: !existing.length, total: c };
}

export async function addCommentAction(postId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireMember(`/forum/${postId}`);
  const contenu = String(formData.get("contenu") ?? "").trim();
  if (contenu.length < 2 || contenu.length > 5000) return { status: "error", message: "Votre réponse doit contenir entre 2 et 5 000 caractères.", values: { contenu } };
  if (!(await rateLimit(`comment:${user.id}`, 30, 3600))) return { status: "error", message: "Trop de réponses récentes. Patientez un peu.", values: { contenu } };
  const exists = await db.select({ id: schema.posts.id }).from(schema.posts).where(eq(schema.posts.id, postId)).limit(1);
  if (!exists.length) return { status: "error", message: "Publication introuvable." };
  await db.insert(schema.comments).values({ postId, userId: user.id, contenu });
  revalidatePath(`/forum/${postId}`);
  revalidatePath("/forum");
  return { status: "success", message: "Votre réponse a été publiée." };
}

export async function deleteCommentAction(commentId: number, postId: number) {
  const user = await requireMember(`/forum/${postId}`);
  const c = (await db.select({ userId: schema.comments.userId }).from(schema.comments).where(eq(schema.comments.id, commentId)).limit(1))[0];
  if (!c || (c.userId !== user.id && !user.isAdmin)) return;
  await db.delete(schema.comments).where(eq(schema.comments.id, commentId));
  revalidatePath(`/forum/${postId}`);
}
