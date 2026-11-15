import type { Metadata } from "next";
import { desc, ilike, or, sql } from "drizzle-orm";
import { UserPlus } from "lucide-react";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { SearchForm } from "@/components/admin/search-form";
import { ResourceForm } from "@/components/admin/resource-form";
import { ActionButton, StatusSelect } from "@/components/admin/inline-actions";
import { DeleteButton } from "@/components/forum/delete-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { db, schema } from "@/server/db";
import { getCurrentUser } from "@/server/auth/session";
import { activatePendingAction, createUserAction, deleteUserAction, purgeExpiredPendingAction, setUserActiveAction, setUserRoleAction } from "@/server/actions/admin/users";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Utilisateurs" };
const PER_PAGE = 25;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const where = q ? or(ilike(schema.users.email, `%${q}%`), ilike(schema.users.nom, `%${q}%`), ilike(schema.users.prenom, `%${q}%`)) : undefined;
  const [me, rows, total, pending] = await Promise.all([
    getCurrentUser(),
    db.select().from(schema.users).where(where).orderBy(desc(schema.users.dateInscription)).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
    db.select({ c: sql<number>`COUNT(*)` }).from(schema.users).where(where),
    db.select().from(schema.tempUsers).orderBy(desc(schema.tempUsers.dateDemande)).limit(50),
  ]);
  const totalPages = Math.max(1, Math.ceil(Number(total[0]?.c ?? 0) / PER_PAGE));
  return (
    <AdminPage title="Utilisateurs" text="Comptes membres et administrateurs : rôles, activation et suppression.">
      <Panel title={`${Number(total[0]?.c ?? 0)} compte(s)`} actions={<SearchForm action="/admin/utilisateurs" placeholder="Nom, prénom ou e-mail…" defaultValue={q} />}>
        <DataTable head={["Membre", "Inscription", "Connexion", "Rôle", "Statut", ""]} empty="Aucun compte ne correspond.">
          {rows.map((u) => {
            const name = `${u.prenom} ${u.nom}`.trim() || u.email.split("@")[0]!;
            const self = u.id === me?.id;
            return (
              <tr key={u.id}>
                <td><div className="flex items-center gap-3"><Avatar name={name} src={u.photoProfil} size={34} /><div className="min-w-0"><p className="truncate font-medium">{name}{self ? <span className="ml-2 text-xs text-muted">(vous)</span> : null}</p><p className="truncate text-xs text-muted">{u.email}</p></div></div></td>
                <td className="whitespace-nowrap text-xs text-muted">{formatDateTime(u.dateInscription)}</td>
                <td><Badge tone={u.authProvider === "google" ? "info" : "neutral"}>{u.authProvider === "google" ? "Google" : "E-mail"}</Badge></td>
                <td>{self ? <Badge tone="brand">Administrateur</Badge> : <StatusSelect value={u.role === "admin" ? "admin" : "utilisateur"} options={[{ value: "utilisateur", label: "Membre" }, { value: "admin", label: "Administrateur" }]} action={setUserRoleAction.bind(null, u.id)} />}</td>
                <td>{self ? <Badge tone="success">Actif</Badge> : <ActionButton action={setUserActiveAction.bind(null, u.id, u.isActive !== 1)} successMessage={u.isActive === 1 ? "Compte désactivé." : "Compte réactivé."}>{u.isActive === 1 ? <><span className="size-2 rounded-full bg-emerald-500" /> Actif</> : <><span className="size-2 rounded-full bg-zinc-400" /> Désactivé</>}</ActionButton>}</td>
                <td className="text-right">{self ? null : <DeleteButton action={deleteUserAction.bind(null, u.id)} label="" title={`Supprimer ${name} ?`} text="Ses publications, projets et inscriptions seront également supprimés." />}</td>
              </tr>
            );
          })}
        </DataTable>
        <Pagination page={page} totalPages={totalPages} hrefFor={(p) => `/admin/utilisateurs?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}`} />
      </Panel>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Inscriptions en attente d’activation" text="Demandes dont le code n’a pas encore été saisi (expirent après 30 minutes)." actions={pending.length ? <ActionButton action={purgeExpiredPendingAction}>Purger les expirées</ActionButton> : null}>
          <DataTable head={["E-mail", "Demande", ""]} empty="Aucune demande en attente.">
            {pending.map((p) => <tr key={p.id}><td className="font-medium">{p.email}</td><td className="text-xs text-muted">{formatDateTime(p.dateDemande)}</td><td className="text-right"><ActionButton action={activatePendingAction.bind(null, p.id)}>Activer</ActionButton></td></tr>)}
          </DataTable>
        </Panel>
        <Panel title="Créer un compte" text="Le mot de passe doit respecter la politique (10 caractères, majuscule, minuscule, chiffre).">
          <ResourceForm action={createUserAction} resetOnSuccess submitLabel="Créer le compte" fields={[
            { name: "prenom", label: "Prénom", half: true },
            { name: "nom", label: "Nom", half: true },
            { name: "email", label: "Adresse e-mail", type: "email", required: true },
            { name: "mot_de_passe", label: "Mot de passe provisoire", type: "password", required: true, half: true },
            { name: "role", label: "Rôle", type: "select", half: true, options: [{ value: "utilisateur", label: "Membre" }, { value: "admin", label: "Administrateur" }] },
          ]} />
          <p className="mt-3 flex items-center gap-2 text-xs text-muted"><UserPlus className="size-3.5" /> Communiquez le mot de passe provisoire par un canal sûr ; le membre pourra le modifier.</p>
        </Panel>
      </div>
    </AdminPage>
  );
}
