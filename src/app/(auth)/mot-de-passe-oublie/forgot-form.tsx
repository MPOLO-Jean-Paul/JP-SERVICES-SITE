"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { forgotPasswordAction, type AuthState } from "@/server/actions/auth";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function ForgotForm() {
  const t = useTranslations("auth");
  const [state, action] = useActionState<AuthState, FormData>(forgotPasswordAction, {});
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}
      <Field label={t("email")} htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" maxLength={254} />
      </Field>
      <SubmitButton variant="dark" className="w-full" size="lg">
        {t("forgotButton")} <ArrowRight />
      </SubmitButton>
    </form>
  );
}
