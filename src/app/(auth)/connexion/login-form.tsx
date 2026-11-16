"use client";
import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { loginAction, type AuthState } from "@/server/actions/auth";
import { Field, Input } from "@/components/ui/form";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const t = useTranslations("auth");
  const [state, action] = useActionState<AuthState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <Field label={t("email")} htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="nom@exemple.com" required maxLength={254} defaultValue={state.values?.email} inputMode="email" />
      </Field>
      <Field label={t("password")} htmlFor="mot_de_passe">
        <PasswordInput id="mot_de_passe" name="mot_de_passe" autoComplete="current-password" required maxLength={512} />
      </Field>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">{t("remember")}</span>
        <Link href="/mot-de-passe-oublie" className="font-medium text-primary hover:underline">
          {t("forgot")}
        </Link>
      </div>
      <SubmitButton variant="dark" className="w-full" size="lg">
        {t("loginButton")} <ArrowRight />
      </SubmitButton>
    </form>
  );
}
