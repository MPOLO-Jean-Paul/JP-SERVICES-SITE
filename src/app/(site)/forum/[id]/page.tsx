import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle, Pen } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { LikeButton } from "@/components/forum/like-button";
import { CommentForm } from "@/components/forum/comment-form";
import { DeleteButton } from "@/components/forum/delete-button";
import { ShareButtons } from "@/components/site/share-buttons";
import { getCurrentUser } from "@/server/auth/session";
import { getPost, listComments } from "@/server/services/content";
import { deleteCommentAction, deletePostAction } from "@/server/actions/forum";
import { excerpt, formatDateTime } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const post = await getPost(Number((await params).id)).catch(() => null);
  return post ? pageMetadata({ title: post.titre, description: excerpt(post.contenu, 160), path: `/forum/${post.id}` }) : { title: "Discussion introuvable" };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const user = await getCurrentUser();
  const [post, comments] = await Promise.all([getPost(id, user?.id ?? 0), listComments(id)]);
  if (!post) notFound();
  const author = `${post.auteurPrenom} ${post.auteurNom}`.trim() || "Membre";
  const canEdit = user && (user.id === post.auteurId || user.isAdmin);
  return (
    <article>
      <header className="border-b bg-canvas-soft">
        <div className="shell-narrow py-10">
          <Link href="/forum" className="inline-flex items-center gap-2 text-sm font-medium text-copy hover:text-ink"><ArrowLeft className="size-4" /> Forum d’entraide</Link>
          <h1 className="h1 mt-5">{post.titre}</h1>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3"><Avatar name={author} src={post.auteurPhoto} size={44} /><div><p className="font-semibold">{author}</p><p className="text-xs text-muted">{formatDateTime(post.datePublication)}</p></div></div>
            <div className="flex items-center gap-2"><LikeButton postId={post.id} liked={Number(post.likedByViewer) === 1} total={Number(post.totalLikes)} disabled={!user} /><ShareButtons title={post.titre} path={`/forum/${post.id}`} /></div>
          </div>
        </div>
      </header>
      <div className="shell-narrow py-10">
        <div className="prose-jp whitespace-pre-line text-lg">{post.contenu}</div>
        {canEdit ? <div className="mt-6 flex gap-2 border-t pt-4"><Link href={`/forum/${post.id}/modifier`} className={buttonVariants({ variant: "outline", size: "sm" })}><Pen /> Modifier</Link><DeleteButton action={deletePostAction.bind(null, post.id)} title="Supprimer cette publication ?" text="Les réponses associées seront également supprimées." /></div> : null}

        <section id="reponses" className="mt-14 scroll-mt-28">
          <h2 className="h2 flex items-center gap-3"><MessageCircle className="size-6 text-primary" /> {comments.length} réponse{comments.length > 1 ? "s" : ""}</h2>
          {comments.length ? (
            <ul className="mt-6 space-y-4">
              {comments.map((c) => { const name = `${c.prenom} ${c.nom}`.trim() || "Membre"; return (
                <li key={c.id} className="card p-5">
                  <div className="flex items-start gap-3"><Avatar name={name} src={c.photo} size={36} /><div className="min-w-0 flex-1"><p className="text-xs text-muted"><strong className="text-ink">{name}</strong> · {formatDateTime(c.date)}</p><p className="mt-2 whitespace-pre-line text-copy">{c.contenu}</p></div>{user && (user.id === c.userId || user.isAdmin) ? <DeleteButton action={deleteCommentAction.bind(null, c.id, post.id)} label="" title="Supprimer cette réponse ?" /> : null}</div>
                </li>
              ); })}
            </ul>
          ) : <div className="card mt-6 p-8 text-center"><h3 className="h3">Soyez le premier à répondre</h3><p className="mt-1 text-copy">Partagez votre expérience ou proposez une piste à l’auteur.</p></div>}
          <div className="card mt-8 p-6">
            <h3 className="h3">Contribuer à l’échange</h3>
            {user ? <div className="mt-4"><CommentForm postId={post.id} /></div> : <p className="mt-2 text-copy">Connectez-vous pour répondre. <Link href={`/connexion?redirect_to=${encodeURIComponent(`/forum/${post.id}`)}`} className="font-semibold text-primary">Se connecter</Link></p>}
          </div>
        </section>
      </div>
    </article>
  );
}
