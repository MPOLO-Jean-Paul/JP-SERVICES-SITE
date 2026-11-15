import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { DeleteButton } from "@/components/forum/delete-button";
import { buttonVariants } from "@/components/ui/button";
import { db, schema } from "@/server/db";
import { adminDeletePostAction } from "@/server/actions/admin/content";
import { excerpt, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Publications du forum" };

export default async function ForumAdminPage() {
  const rows = await db.select({ p: schema.posts, email: schema.users.email, nom: schema.users.nom, prenom: schema.users.prenom, comments: sql<number>`(SELECT COUNT(*) FROM comments c WHERE c.post_id = ${schema.posts.id})`, likes: sql<number>`(SELECT COUNT(*) FROM likes l WHERE l.post_id = ${schema.posts.id})` }).from(schema.posts).innerJoin(schema.users, eq(schema.users.id, schema.posts.auteurId)).orderBy(desc(schema.posts.datePublication));
  return (
    <AdminPage title="Publications du forum" text="Modération des discussions : retirez les contenus abusifs, trompeurs ou hors sujet.">
      <Panel>
        <DataTable head={["Publication", "Auteur", "Réponses", "J’aime", "Date", ""]} empty="Aucune publication.">
          {rows.map(({ p, email, nom, prenom, comments, likes }) => <tr key={p.id}><td className="max-w-md"><p className="font-medium">{p.titre}</p><p className="line-clamp-1 text-xs text-muted">{excerpt(p.contenu, 100)}</p></td><td className="text-sm">{`${prenom} ${nom}`.trim() || email}</td><td className="text-sm">{Number(comments)}</td><td className="text-sm">{Number(likes)}</td><td className="whitespace-nowrap text-xs text-muted">{formatDateTime(p.datePublication)}</td><td className="whitespace-nowrap text-right"><Link href={`/forum/${p.id}`} target="_blank" className={buttonVariants({ variant: "ghost", size: "sm" })} aria-label="Voir"><ExternalLink /></Link><DeleteButton action={adminDeletePostAction.bind(null, p.id)} label="" title="Retirer cette publication ?" text="Les réponses et mentions « J’aime » associées seront supprimées." /></td></tr>)}
        </DataTable>
      </Panel>
    </AdminPage>
  );
}
