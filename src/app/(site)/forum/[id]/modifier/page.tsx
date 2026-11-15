import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Pen } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { PostForm } from "@/components/forum/post-form";
import { requireUser } from "@/server/auth/session";
import { getPost } from "@/server/services/content";
import { updatePostAction } from "@/server/actions/forum";

export const metadata: Metadata = { title: "Modifier la publication", robots: { index: false } };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const user = await requireUser(`/forum/${id}/modifier`);
  const post = await getPost(id);
  if (!post) notFound();
  if (post.auteurId !== user.id && !user.isAdmin) redirect(`/forum/${id}`);
  const action = updatePostAction.bind(null, id);
  return (
    <>
      <PageHeader title="Modifier la publication" icon={Pen} crumbs={[{ href: "/forum", label: "Forum" }, { href: `/forum/${id}`, label: post.titre }, { label: "Modifier" }]} />
      <section className="section"><div className="shell-narrow"><div className="card p-6 sm:p-8"><PostForm action={action} initial={{ titre: post.titre, contenu: post.contenu }} submitLabel="Enregistrer les modifications" /></div></div></section>
    </>
  );
}
