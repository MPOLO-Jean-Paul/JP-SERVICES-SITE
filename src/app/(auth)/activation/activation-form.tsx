"use client";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, RotateCw } from "lucide-react";
import { activateAction, resendActivationAction, type AuthState } from "@/server/actions/auth";
import { Field, Input } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function ActivationForm({ email }: { email: string }) {
  const t = useTranslations("auth");
  const [state, action] = useActionState<AuthState, FormData>(activateAction, {});
  const [resendState, resend] = useActionState<AuthState, FormData>(resendActivationAction, {});
  return (
    <div className="space-y-6">
      <form action={action} className="space-y-5" noValidate>
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        <Field label={t("email")} htmlFor="email">
          <Input id="email" name="email" type="email" required defaultValue={email} autoComplete="email" />
        </Field>
        <Field label={t("activationCode")} htmlFor="code">
          <Input id="code" name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" className="text-center font-mono text-2xl tracking-[0.5em]" placeholder="••••••" />
        </Field>
        <SubmitButton variant="dark" className="w-full" size="lg">
          {t("activate")} <ArrowRight />
        </SubmitButton>
      </form>
      <form action={resend} className="text-center text-sm">
        <input type="hidden" name="email" value={email} />
        {resendState.success ? <Alert tone="success" className="mb-3 text-left">{resendState.success}</Alert> : null}
        {resendState.error ? <Alert tone="danger" className="mb-3 text-left">{resendState.error}</Alert> : null}
        <SubmitButton variant="ghost" size="sm">
          <RotateCw /> {t("resend")}
        </SubmitButton>
      </form>
    </div>
  );
}
