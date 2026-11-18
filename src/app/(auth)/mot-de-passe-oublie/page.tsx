import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default async function ForgotPage() {
  const t = await getTranslations("auth");
  return (
    <AuthCard step={{ current: 1, total: 2, label: "Votre adresse e-mail" }}
      title={t("forgotTitle")}
      intro={t("forgotIntro")}
      footer={
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          {t("backToLogin")}
        </Link>
      }
    >
      <ForgotForm />
    </AuthCard>
  );
}
