import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PenSquare } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { PostForm } from "@/components/forum/post-form";
import { requireUser } from "@/server/auth/session";
import { createPostAction } from "@/server/actions/forum";

export const metadata: Metadata = { title: "Nouvelle publication", robots: { index: false } };

export default async function NewPostPage() {
  await requireUser("/forum/nouveau");
  return (
    <>
      <PageHeader title="Nouvelle publication" icon={PenSquare} crumbs={[{ href: "/forum", label: "Forum" }, { label: "Nouvelle publication" }]} text="Partagez une question, une ressource ou un retour d’expérience avec la communauté." />
      <section className="section"><div className="shell-narrow"><Link href="/forum" className="mb-6 inline-flex items-center gap-2 text-sm text-copy hover:text-ink"><ArrowLeft className="size-4" /> Retour au forum</Link><div className="card p-6 sm:p-8"><PostForm action={createPostAction} submitLabel="Publier" /></div></div></section>
    </>
  );
}
