import type { Metadata } from "next";
import { AdminPage, Panel } from "@/components/admin/ui";
import { ResourceForm, type FieldDef } from "@/components/admin/resource-form";
import { getSettings, SETTING_FIELDS } from "@/server/services/settings";
import { saveSettingsAction } from "@/server/actions/admin/content";

export const metadata: Metadata = { title: "Paramètres du site" };

export default async function ParametresPage() {
  const settings = await getSettings();
  const fields: FieldDef[] = SETTING_FIELDS.map((f) => ({ name: f.key, label: `${f.group} · ${f.label}`, hint: f.help || undefined, type: f.multiline ? "textarea" : "text", rows: 3, value: settings[f.key] ?? "", half: !f.multiline && f.group !== "Annonce" }));
  return (
    <AdminPage title="Paramètres du site" text="Bandeau d’annonce, textes d’introduction, coordonnées et réseaux sociaux. Les modifications sont visibles immédiatement.">
      <Panel><ResourceForm action={saveSettingsAction} fields={fields} submitLabel="Enregistrer les paramètres" /></Panel>
    </AdminPage>
  );
}
