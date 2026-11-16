"use client";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { contactAction, type FormState } from "@/server/actions/contact";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function ContactForm({ initialSubject = "" }: { initialSubject?: string }) {
  const [state, action] = useActionState<FormState, FormData>(contactAction, { status: "idle" });
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" ? <Alert tone="danger">{state.message}</Alert> : null}
      {state.status === "success" ? <Alert tone="success">{state.message}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom complet" htmlFor="nom">
          <Input id="nom" name="nom" required maxLength={120} autoComplete="name" placeholder="Votre nom complet" defaultValue={v.nom} />
        </Field>
        <Field label="Adresse e-mail" htmlFor="email">
          <Input id="email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="nom@exemple.com" defaultValue={v.email} />
        </Field>
      </div>
      <Field label="Sujet" htmlFor="sujet">
        <Input id="sujet" name="sujet" required maxLength={180} placeholder="Objet de votre demande" defaultValue={v.sujet ?? initialSubject} />
      </Field>
      <Field label="Message" htmlFor="message" hint="Entre 20 et 10 000 caractères.">
        <Textarea id="message" name="message" rows={7} required minLength={20} maxLength={10000} defaultValue={v.message} />
      </Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="flex justify-end">
        <SubmitButton variant="dark" size="lg">
          Envoyer le message <ArrowRight />
        </SubmitButton>
      </div>
    </form>
  );
}
