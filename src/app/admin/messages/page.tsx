import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Mail } from "lucide-react";
import { AdminPage, Panel } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { DeleteButton } from "@/components/forum/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { db, schema } from "@/server/db";
import { deleteMessageAction, replyMessageAction } from "@/server/actions/admin/content";
import { smtpIsConfigured } from "@/server/mail/mailer";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesAdminPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sp = await searchParams;
  const rows = await db.select().from(schema.messages).orderBy(desc(schema.messages.dateEnvoi)).limit(200);
  const selected = sp.id ? (await db.select().from(schema.messages).where(eq(schema.messages.id, Number(sp.id))).limit(1))[0] : rows[0];
  return (
    <AdminPage title="Messages" text="Boîte de réception du formulaire de contact. Répondez directement par e-mail depuis la console.">
      {rows.length ? (
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <Panel className="xl:max-h-[75vh] xl:overflow-y-auto scrollbar-thin">
            <ul className="-m-2 space-y-1">
              {rows.map((m) => (
                <li key={m.id}><Link href={`/admin/messages?id=${m.id}`} className={cn("block rounded-lg p-3 transition hover:bg-panel-2", selected?.id === m.id && "bg-panel-2")}><p className="flex justify-between gap-2 text-xs text-muted"><span className="truncate">{m.nom}</span><span className="shrink-0 font-mono">{formatDateTime(m.dateEnvoi).split(" à ")[0]}</span></p><p className="mt-0.5 truncate text-sm font-medium">{m.sujet}</p><p className="line-clamp-1 text-xs text-muted">{m.message}</p></Link></li>
              ))}
            </ul>
          </Panel>
          {selected ? (
            <div className="space-y-6">
              <Panel title={selected.sujet} text={`${selected.nom} · ${selected.email} · ${formatDateTime(selected.dateEnvoi)}`} actions={<DeleteButton action={deleteMessageAction.bind(null, selected.id)} title="Supprimer ce message ?" />}>
                <p className="whitespace-pre-line text-copy">{selected.message}</p>
              </Panel>
              <Panel title="Répondre" text={smtpIsConfigured() ? `La réponse sera envoyée à ${selected.email}.` : "SMTP non configuré : configurez l’envoi d’e-mails pour répondre depuis la console."}>
                <ResourceForm key={selected.id} action={replyMessageAction} resetOnSuccess submitLabel="Envoyer la réponse" fields={[
                  { name: "to", label: "Destinataire", type: "email", required: true, value: selected.email, half: true },
                  { name: "subject", label: "Objet", value: `Re : ${selected.sujet}`, half: true },
                  { name: "body", label: "Message", type: "textarea", rows: 8, required: true, value: `Bonjour ${selected.nom},\n\n\n\nCordialement,\nL’équipe JP-Services` },
                ]} />
              </Panel>
            </div>
          ) : null}
        </div>
      ) : <EmptyState icon={Mail} title="Boîte de réception vide" text="Les messages envoyés depuis la page Contact apparaîtront ici." />}
    </AdminPage>
  );
}
