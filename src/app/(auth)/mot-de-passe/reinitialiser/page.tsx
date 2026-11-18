import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetForm } from "./reset-form";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Réinitialiser le mot de passe", robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const t = await getTranslations("auth");
  return (
    <AuthCard step={{ current: 2, total: 2, label: "Nouveau mot de passe" }}
      title={t("resetTitle")}
      intro={t("resetIntro")}
      footer={
        <Link href="/connexion" className="font-semibold text-primary hover:underline">
          {t("backToLogin")}
        </Link>
      }
    >
      {sp.envoye ? (
        <Alert tone="success" className="mb-5">
          {t("success.codeSent")}
        </Alert>
      ) : null}
      <ResetForm email={(sp.email ?? "").toLowerCase()} />
    </AuthCard>
  );
}
