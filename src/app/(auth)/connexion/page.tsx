import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "./login-form";
import { GoogleButton } from "@/components/auth/google-button";
import { Alert } from "@/components/ui/alert";
import { getCurrentUser } from "@/server/auth/session";
import { env } from "@/env";
import { safeLocalRedirect } from "@/lib/utils";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const redirectTo = safeLocalRedirect(sp.redirect_to, "");
  if (user) redirect(redirectTo || (user.isAdmin ? "/admin" : "/profil"));
  const t = await getTranslations("auth");
  const notice = sp.reinitialise ? t("success.reset") : sp.active ? t("success.activated") : null;
  return (
    <AuthCard
      title={t("loginTitle")}
      intro={t("loginIntro")}
      footer={
        <p>
          {t("noAccount")}{" "}
          <Link href={`/inscription${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ""}`} className="font-semibold text-primary hover:underline">
            {t("createAccount")}
          </Link>
        </p>
      }
    >
      {notice ? (
        <Alert tone="success" className="mb-5">
          {notice}
        </Alert>
      ) : null}
      <LoginForm redirectTo={redirectTo} />
      {env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
        <div className="mt-6">
          <GoogleButton clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID} redirectTo={redirectTo || undefined} />
        </div>
      ) : null}
    </AuthCard>
  );
}
