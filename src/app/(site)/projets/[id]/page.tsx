import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProject } from "@/server/services/content";
import { getCurrentUser } from "@/server/auth/session";
import { excerpt, formatDate } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const row = await getProject(Number((await params).id)).catch(() => null);
  return row ? pageMetadata({ title: row.projet.titre, description: excerpt(row.projet.description, 160), path: `/projets/${row.projet.id}` }) : { title: "Projet introuvable" };
}

export default async function ProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const row = await getProject(id);
  if (!row) notFound();
  const user = await getCurrentUser();
  const isValidated = ["valide", "approuve"].includes(row.projet.statut);
  if (!isValidated && row.projet.auteurId !== user?.id && !user?.isAdmin) notFound();
  const p = row.projet;
  return (
    <article>
      <header className="border-b bg-canvas-soft">
        <div className="shell-narrow py-12">
          <Link href="/projets" className="inline-flex items-center gap-2 text-sm font-medium text-copy hover:text-ink"><ArrowLeft className="size-4" /> Projets</Link>
          <div className="mt-5"><Badge tone={isValidated ? "success" : "warning"}>{isValidated ? "Projet validé" : "En cours d’analyse"}</Badge></div>
          <h1 className="h1 mt-3">{p.titre}</h1>
          <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"><span className="inline-flex items-center gap-2"><UserRound className="size-4" /> {`${row.auteurPrenom} ${row.auteurNom}`.trim() || "Membre JP-Services"}</span><span className="inline-flex items-center gap-2"><CalendarDays className="size-4" /> {formatDate(p.dateSoumission)}</span></p>
        </div>
      </header>
      <div className="shell-narrow py-12"><h2 className="h3">Description du projet</h2><div className="prose-jp mt-4 whitespace-pre-line text-lg">{p.description}</div></div>
    </article>
  );
}
