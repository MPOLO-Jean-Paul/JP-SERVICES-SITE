import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { MemberShell } from "@/components/member/member-shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/server/auth/session";
import { countUnreadNotifications } from "@/server/services/formations";
import { listUserProjects } from "@/server/services/content";
import { excerpt, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mes projets", robots: { index: false } };
const STATUS: Record<string, { label: string; tone: "warning" | "success" | "danger" | "neutral" }> = { en_attente: { label: "En attente", tone: "warning" }, valide: { label: "Validé", tone: "success" }, approuve: { label: "Validé", tone: "success" }, rejete: { label: "À revoir", tone: "danger" }, refuse: { label: "À revoir", tone: "danger" } };

export default async function MesProjetsPage() {
  const user = await requireUser("/mes-projets");
  const [projects, unread] = await Promise.all([listUserProjects(user.id).catch(() => []), countUnreadNotifications(user.id).catch(() => 0)]);
  return (
    <MemberShell user={user} current="/mes-projets" title="Mes projets" text="Suivez l’analyse de vos initiatives et accédez aux fiches des projets validés." unread={unread}>
      <div className="mb-6 flex justify-end"><Link href="/projets#soumettre" className={buttonVariants()}>Présenter un nouveau projet <ArrowRight /></Link></div>
      {projects.length ? (
        <ul className="space-y-4">{projects.map((p) => { const st = STATUS[p.statut] ?? { label: p.statut, tone: "neutral" as const }; return <li key={p.id} className="card p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="h3">{st.tone === "success" ? <Link href={`/projets/${p.id}`} className="hover:text-primary">{p.titre}</Link> : p.titre}</h2><p className="mt-1 text-xs text-muted">Soumis le {formatDate(p.dateSoumission)}</p></div><Badge tone={st.tone}>{st.label}</Badge></div><p className="mt-3 text-sm text-copy">{excerpt(p.description, 220)}</p></li>; })}</ul>
      ) : <EmptyState icon={FolderKanban} title="Aucun projet pour le moment" text="Présentez votre première initiative : notre équipe l’analyse et vous répond dans votre espace." action={<Link href="/projets#soumettre" className={buttonVariants()}>Présenter un projet</Link>} />}
    </MemberShell>
  );
}
