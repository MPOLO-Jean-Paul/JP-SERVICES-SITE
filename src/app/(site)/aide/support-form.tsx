"use client";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { supportAction, type FormState } from "@/server/actions/contact";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const SUBJECTS = [
  ["Connexion", "Problème de connexion"],
  ["Bug", "Signaler un dysfonctionnement"],
  ["Securite", "Question sur la sécurité"],
  ["Formation", "Accès à une formation"],
  ["Autre", "Autre demande"],
];

export function SupportForm() {
  const [state, action] = useActionState<FormState, FormData>(supportAction, { status: "idle" });
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" ? <Alert tone="danger">{state.message}</Alert> : null}
      {state.status === "success" ? <Alert tone="success">{state.message}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Votre nom" htmlFor="support-nom">
          <Input id="support-nom" name="nom" required maxLength={120} autoComplete="name" defaultValue={v.nom} />
        </Field>
        <Field label="Adresse e-mail" htmlFor="support-email">
          <Input id="support-email" name="email" type="email" required maxLength={254} autoComplete="email" defaultValue={v.email} />
        </Field>
      </div>
      <Field label="Sujet" htmlFor="support-sujet">
        <Select id="support-sujet" name="sujet" defaultValue={v.sujet ?? "Connexion"}>
          {SUBJECTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Description du problème" htmlFor="support-message" hint="Entre 20 et 8 000 caractères, sans information confidentielle.">
        <Textarea id="support-message" name="message" rows={6} required minLength={20} maxLength={8000} defaultValue={v.message} placeholder="Expliquez ce qui s’est passé…" />
      </Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <SubmitButton variant="dark" size="lg">
        Envoyer la demande <ArrowRight />
      </SubmitButton>
    </form>
  );
}
