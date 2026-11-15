"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { resetPasswordAction, type AuthState } from "@/server/actions/auth";
import { Field, Input } from "@/components/ui/form";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function ResetForm({ email }: { email: string }) {
  const t = useTranslations("auth");
  const [state, action] = useActionState<AuthState, FormData>(resetPasswordAction, {});
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      <Field label={t("email")} htmlFor="email">
        <Input id="email" name="email" type="email" required defaultValue={email} autoComplete="email" />
      </Field>
      <Field label={t("resetCode")} htmlFor="code">
        <Input id="code" name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" className="text-center font-mono text-2xl tracking-[0.5em]" placeholder="••••••" />
      </Field>
      <Field label={t("newPassword")} htmlFor="mot_de_passe" hint={t("policyHint")}>
        <PasswordInput id="mot_de_passe" name="mot_de_passe" autoComplete="new-password" required minLength={10} maxLength={128} />
      </Field>
      <Field label={t("passwordConfirm")} htmlFor="confirmer_mot_de_passe">
        <PasswordInput id="confirmer_mot_de_passe" name="confirmer_mot_de_passe" autoComplete="new-password" required minLength={10} maxLength={128} />
      </Field>
      <SubmitButton variant="dark" className="w-full" size="lg">
        {t("resetButton")} <ArrowRight />
      </SubmitButton>
    </form>
  );
}
