import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { DeleteButton } from "@/components/forum/delete-button";
import { db, schema } from "@/server/db";
import { deleteNotificationAction, sendNotificationAction } from "@/server/actions/admin/formations";
import { smtpIsConfigured } from "@/server/mail/mailer";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Abonnements et notifications" };

export default async function AbonnementsAdminPage() {
  const [formations, notifs, subs] = await Promise.all([
    db.select({ id: schema.formations.id, titre: schema.formations.titre, abonnes: sql<number>`(SELECT COUNT(*) FROM abonnements a WHERE a.formation_id = ${schema.formations.id} AND a.notifications_active = 1)` }).from(schema.formations).orderBy(schema.formations.titre),
    db.select({ n: schema.notifications, formation: schema.formations.titre }).from(schema.notifications).innerJoin(schema.formations, eq(schema.formations.id, schema.notifications.formationId)).orderBy(desc(schema.notifications.dateEnvoi)).limit(50),
    db.select().from(schema.abonnements).orderBy(desc(schema.abonnements.dateAbonnement)).limit(50),
  ]);
  return (
    <AdminPage title="Abonnements et notifications" text="Informez les membres abonnés aux alertes d’une formation : changement de date, ouverture de session, rappel.">
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Panel title="Envoyer une notification" text={smtpIsConfigured() ? "La notification apparaît dans l’espace des abonnés et peut aussi être envoyée par e-mail." : "SMTP non configuré : la notification sera visible dans l’espace des abonnés uniquement."}>
          <ResourceForm action={sendNotificationAction} resetOnSuccess submitLabel="Envoyer" fields={[
            { name: "formation_id", label: "Formation destinataire", type: "select", required: true, options: [{ value: "", label: "Sélectionnez une formation…" }, ...formations.map((f) => ({ value: String(f.id), label: `${f.titre} — ${Number(f.abonnes)} abonné(s)` }))] },
            { name: "titre", label: "Objet", required: true },
            { name: "message", label: "Message", type: "textarea", rows: 6, required: true },
            { name: "envoyer_email", label: "Envoyer aussi par e-mail aux abonnés", type: "checkbox", value: smtpIsConfigured() },
          ]} />
        </Panel>
        <Panel title="Notifications envoyées">
          <DataTable head={["Notification", "Formation", "Date", ""]} empty="Aucune notification envoyée.">
            {notifs.map(({ n, formation }) => <tr key={n.id}><td><p className="font-medium">{n.titre}</p><p className="line-clamp-2 text-xs text-muted">{n.message}</p></td><td className="text-sm">{formation}</td><td className="whitespace-nowrap text-xs text-muted">{formatDateTime(n.dateEnvoi)}</td><td className="text-right"><DeleteButton action={deleteNotificationAction.bind(null, n.id)} label="" title="Supprimer cette notification ?" /></td></tr>)}
          </DataTable>
        </Panel>
      </div>
      <Panel title="Derniers abonnements aux alertes">
        <DataTable head={["Membre", "Formation", "Alertes", "Date"]} empty="Aucun abonnement.">
          {subs.map((a) => <tr key={a.id}><td><p className="font-medium">{`${a.prenom} ${a.nom}`.trim() || "—"}</p><p className="text-xs text-muted">{a.email}</p></td><td className="text-sm">{a.formationTitre}</td><td className="text-sm">{a.notificationsActive ? "Actives" : "Coupées"}</td><td className="text-xs text-muted">{formatDateTime(a.dateAbonnement)}</td></tr>)}
        </DataTable>
      </Panel>
    </AdminPage>
  );
}
