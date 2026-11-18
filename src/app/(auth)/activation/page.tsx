import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { ActivationForm } from "./activation-form";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Activation du compte", robots: { index: false } };

export default async function ActivationPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const t = await getTranslations("auth");
  const email = (sp.email ?? "").toLowerCase();
  return (
    <AuthCard step={{ current: 2, total: 2, label: "Activation" }} title={t("activationTitle")} intro={t("activationIntro", { email: email || "votre adresse" })}>
      {sp.envoi === "0" ? (
        <Alert tone="warning" className="mb-5">
          {t("success.activationPending")}
        </Alert>
      ) : null}
      <ActivationForm email={email} />
    </AuthCard>
  );
}
