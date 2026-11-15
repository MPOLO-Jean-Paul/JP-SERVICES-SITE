import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "./register-form";
import { GoogleButton } from "@/components/auth/google-button";
import { getCurrentUser } from "@/server/auth/session";
import { getSettings } from "@/server/services/settings";
import { env } from "@/env";
import { safeLocalRedirect } from "@/lib/utils";

export const metadata: Metadata = { title: "Créer un compte", description: "Créez votre compte JP-Services pour accéder aux formations, projets et à la communauté d’apprentissage.", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect("/profil");
  const [t, s] = await Promise.all([getTranslations("auth"), getSettings()]);
  const redirectTo = safeLocalRedirect(sp.redirect_to, "");
  return (
    <AuthCard
      title={s.auth_register_title || t("registerTitle")}
      intro={s.auth_register_intro || t("registerIntro")}
      footer={
        <p>
          {t("haveAccount")}{" "}
          <Link href="/connexion" className="font-semibold text-primary hover:underline">
            {t("loginButton")}
          </Link>
        </p>
      }
    >
      <RegisterForm />
      {env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
        <div className="mt-6">
          <GoogleButton clientId={env.NEXT_PUBLIC_GOOGLE_CLIENT_ID} redirectTo={redirectTo || undefined} />
        </div>
      ) : null}
    </AuthCard>
  );
}
