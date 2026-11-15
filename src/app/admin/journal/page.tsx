import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { AdminPage, DataTable, Panel } from "@/components/admin/ui";
import { db, schema } from "@/server/db";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Journal d’activité" };

export default async function JournalPage() {
  const rows = await db.select({ a: schema.auditLog, email: schema.users.email }).from(schema.auditLog).leftJoin(schema.users, eq(schema.users.id, schema.auditLog.userId)).orderBy(desc(schema.auditLog.createdAt)).limit(300);
  return (
    <AdminPage title="Journal d’activité" text="Traçabilité des actions sensibles réalisées dans la console (300 dernières).">
      <Panel>
        <DataTable head={["Date", "Administrateur", "Action", "Cible", "Détails", "IP"]} empty="Aucune action enregistrée.">
          {rows.map(({ a, email }) => <tr key={a.id}><td className="whitespace-nowrap font-mono text-xs">{formatDateTime(a.createdAt)}</td><td className="text-sm">{email ?? "—"}</td><td><code className="rounded bg-panel-2 px-1.5 py-0.5 font-mono text-xs">{a.action}</code></td><td className="font-mono text-xs">{a.cible}</td><td className="max-w-xs truncate font-mono text-xs text-muted">{a.details ?? ""}</td><td className="font-mono text-xs text-muted">{a.ipAddress}</td></tr>)}
        </DataTable>
      </Panel>
    </AdminPage>
  );
}
