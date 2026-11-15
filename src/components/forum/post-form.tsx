"use client";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import type { FormState } from "@/server/actions/contact";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function PostForm({ action, initial, submitLabel }: { action: (prev: FormState, fd: FormData) => Promise<FormState>; initial?: { titre: string; contenu: string }; submitLabel: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { status: "idle" });
  const v = state.values ?? initial ?? {};
  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" ? <Alert tone="danger">{state.message}</Alert> : null}
      <Field label="Titre" htmlFor="titre" hint="Une question claire ou un sujet précis (5 à 180 caractères)."><Input id="titre" name="titre" required minLength={5} maxLength={180} defaultValue={v.titre} /></Field>
      <Field label="Contenu" htmlFor="contenu" hint="Décrivez le contexte, ce que vous avez essayé et ce que vous attendez."><Textarea id="contenu" name="contenu" rows={10} required minLength={20} maxLength={20000} defaultValue={v.contenu} /></Field>
      <SubmitButton size="lg">{submitLabel} <ArrowRight /></SubmitButton>
    </form>
  );
}
