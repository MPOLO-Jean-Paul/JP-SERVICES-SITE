"use client";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { submitProjectAction } from "@/server/actions/projets";
import type { FormState } from "@/server/actions/contact";
import { Field, Input, Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function ProjectForm() {
  const [state, action] = useActionState<FormState, FormData>(submitProjectAction, { status: "idle" });
  const v = state.values ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" ? <Alert tone="danger">{state.message}</Alert> : null}
      {state.status === "success" ? <Alert tone="success">{state.message}</Alert> : null}
      <Field label="Nom du projet" htmlFor="titre"><Input id="titre" name="titre" required minLength={5} maxLength={180} placeholder="Ex. Plateforme de suivi scolaire" defaultValue={state.status === "success" ? "" : v.titre} /></Field>
      <Field label="Description détaillée" htmlFor="description" hint="Objectif, bénéficiaires, difficultés actuelles et résultats attendus (30 caractères minimum)."><Textarea id="description" name="description" rows={9} required minLength={30} maxLength={10000} defaultValue={state.status === "success" ? "" : v.description} /></Field>
      <SubmitButton variant="dark" size="lg">Transmettre pour analyse <ArrowRight /></SubmitButton>
    </form>
  );
}
