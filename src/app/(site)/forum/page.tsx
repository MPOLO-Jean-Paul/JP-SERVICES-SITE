import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { ThreadPreview } from "@/components/visuals/mockups";
import Link from "next/link";
import { LogIn, MessagesSquare, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { ForumList, type ForumPost } from "@/components/forum/forum-list";
import { getCurrentUser } from "@/server/auth/session";
import { listPosts } from "@/server/services/content";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({ title: "Forum d’entraide", description: "Un espace pour demander, partager et progresser ensemble : questions techniques, projets et ressources de la communauté JP-Services.", path: "/forum" });

export default async function ForumPage({ searchParams }: { searchParams: Promise<{ supprime?: string }> }) {
  const [sp, user] = await Promise.all([searchParams, getCurrentUser()]);
  const rows = await listPosts(user?.id ?? 0).catch(() => []);
  const posts: ForumPost[] = rows.map((r) => ({ id: r.id, titre: r.titre, contenu: r.contenu, date: r.datePublication.toISOString(), auteur: `${r.auteurPrenom} ${r.auteurNom}`.trim() || "Membre", auteurPhoto: r.auteurPhoto, likes: Number(r.totalLikes), comments: Number(r.totalComments), liked: Number(r.likedByViewer) === 1 }));
  return (
    <>
      <PageHero
        eyebrow="Communauté d’entraide"
        title="Demandez, partagez, progressez ensemble."
        text={`${posts.length} publication${posts.length > 1 ? "s" : ""} pour échanger conseils, projets et questions numériques avec la communauté JP-Services.`}
        actions={user ? <Link href="/forum/nouveau" className={buttonVariants({ variant: "dark", size: "lg" })}><Plus /> Nouvelle publication</Link> : <Link href="/connexion?redirect_to=/forum" className={buttonVariants({ variant: "dark", size: "lg" })}><LogIn /> Se connecter pour participer</Link>}
        aside={<ThreadPreview />}
      />
      <section className="section"><div className="shell">
        {sp.supprime ? <Alert tone="success" className="mb-6">La publication a été supprimée.</Alert> : null}
        {posts.length ? <ForumList posts={posts} canLike={Boolean(user)} /> : <EmptyState icon={MessagesSquare} title="La première discussion peut commencer" text="Posez une question technique, présentez votre projet ou partagez une ressource utile." action={user ? <Link href="/forum/nouveau" className={buttonVariants()}><Plus /> Créer la première publication</Link> : <Link href="/connexion?redirect_to=/forum/nouveau" className={buttonVariants()}>Se connecter</Link>} />}
      </div></section>
    </>
  );
}
