import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPage, Panel } from "@/components/admin/ui";
import { ResourceForm } from "@/components/admin/resource-form";
import { formationFields } from "@/components/admin/formation-fields";
import { createFormationAction } from "@/server/actions/admin/formations";

export const metadata: Metadata = { title: "Nouvelle formation" };

export default function NewFormationPage() {
  return (
    <AdminPage title="Nouvelle formation" text="La formation sera visible immédiatement dans le catalogue public." actions={<Link href="/admin/formations" className="inline-flex items-center gap-2 text-sm text-copy hover:text-ink"><ArrowLeft className="size-4" /> Retour</Link>}>
      <Panel><ResourceForm action={createFormationAction} fields={formationFields()} submitLabel="Publier la formation" /></Panel>
    </AdminPage>
  );
}
