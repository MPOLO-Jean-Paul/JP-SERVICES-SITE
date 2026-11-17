"use client";
import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { registerAction, type AuthState } from "@/server/actions/auth";
import { Field, Input } from "@/components/ui/form";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function RegisterForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [state, action] = useActionState<AuthState, FormData>(registerAction, {});
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Prénom" htmlFor="prenom" optional>
          <Input id="prenom" name="prenom" autoComplete="given-name" placeholder="Votre prénom" maxLength={100} defaultValue={state.values?.prenom} />
        </Field>
        <Field label="Nom" htmlFor="nom" optional>
          <Input id="nom" name="nom" autoComplete="family-name" placeholder="Votre nom" maxLength={100} defaultValue={state.values?.nom} />
        </Field>
      </div>
      <Field label={t("email")} htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="nom@exemple.com" required maxLength={254} defaultValue={state.values?.email} inputMode="email" />
      </Field>
      <Field label={t("password")} htmlFor="mot_de_passe" hint={t("policyHint")}>
        <PasswordInput id="mot_de_passe" name="mot_de_passe" autoComplete="new-password" required minLength={8} maxLength={128} />
      </Field>
      <Field label={t("passwordConfirm")} htmlFor="confirmer_mot_de_passe">
        <PasswordInput id="confirmer_mot_de_passe" name="confirmer_mot_de_passe" autoComplete="new-password" required minLength={8} maxLength={128} />
      </Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <p className="text-xs text-muted">
        {t.rich("terms", {
          terms: (chunks) => (
            <Link href="/conditions" className="text-primary underline underline-offset-4">
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link href="/confidentialite" className="text-primary underline underline-offset-4">
              {chunks}
            </Link>
          ),
        })}
      </p>
      <SubmitButton variant="dark" className="w-full" size="lg">
        {t("registerButton")} <ArrowRight />
      </SubmitButton>
      <span className="sr-only">{tc("required")}</span>
    </form>
  );
}
