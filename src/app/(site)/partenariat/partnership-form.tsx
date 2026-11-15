"use client";
import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { partnershipAction } from "@/server/actions/partenariat";
import type { FormState } from "@/server/actions/contact";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function PartnershipForm({ types }: { types: string[] }) {
  const [state, action] = useActionState<FormState, FormData>(partnershipAction, { status: "idle" });
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" ? <Alert tone="danger">{state.message}</Alert> : null}
      {state.status === "success" ? <Alert tone="success">{state.message}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organisation ou structure" htmlFor="organisation"><Input id="organisation" name="organisation" required maxLength={180} autoComplete="organization" defaultValue={v.organisation} /></Field>
        <Field label="Nom du contact" htmlFor="contact_nom"><Input id="contact_nom" name="contact_nom" required maxLength={160} autoComplete="name" defaultValue={v.contact_nom} /></Field>
        <Field label="Adresse e-mail" htmlFor="p-email"><Input id="p-email" name="email" type="email" required maxLength={190} autoComplete="email" defaultValue={v.email} /></Field>
        <Field label="Téléphone" htmlFor="telephone" optional><Input id="telephone" name="telephone" type="tel" maxLength={40} autoComplete="tel" defaultValue={v.telephone} /></Field>
      </div>
      <Field label="Type de partenariat envisagé" htmlFor="type_partenariat">
        <Select id="type_partenariat" name="type_partenariat" required defaultValue={v.type_partenariat ?? ""}>
          <option value="" disabled>Sélectionnez…</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </Field>
      <Field label="Votre proposition" htmlFor="p-message" hint="Présentez votre organisation, vos objectifs et la collaboration imaginée (30 caractères minimum)."><Textarea id="p-message" name="message" rows={6} required minLength={30} maxLength={8000} defaultValue={v.message} /></Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">En envoyant ce formulaire, vous acceptez notre <Link href="/confidentialite" className="text-primary underline underline-offset-4">politique de confidentialité</Link>.</p>
        <SubmitButton variant="dark" size="lg">Envoyer la demande <ArrowRight /></SubmitButton>
      </div>
    </form>
  );
}
