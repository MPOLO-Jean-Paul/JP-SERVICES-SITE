"use client";
import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { subscribeNewsletter, type NewsletterState } from "@/server/actions/newsletter";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";

const THEMES: Array<[string, string]> = [
  ["formations", "Formations"],
  ["formations_en_ligne", "En direct"],
  ["logiciels", "Logiciels"],
  ["actualites", "Actualités"],
  ["offres", "Offres"],
];

export function NewsletterForm() {
  const t = useTranslations("footer");
  const [state, action] = useActionState<NewsletterState, FormData>(subscribeNewsletter, { status: "idle" });
  return (
    <form action={action} className="space-y-3" aria-label={t("newsletterTitle")}>
      {state.status !== "idle" ? (
        <Alert tone={state.status === "success" ? "success" : "danger"}>
          {state.message}
          {state.prefsUrl ? (
            <>
              {" "}
              <Link href={state.prefsUrl} className="font-semibold underline underline-offset-4">
                Gérer mes préférences
              </Link>
            </>
          ) : null}
        </Alert>
      ) : null}
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="newsletter-email">
          {t("newsletterEmail")}
        </label>
        <input id="newsletter-email" type="email" name="email" required maxLength={254} autoComplete="email" placeholder={t("newsletterEmail")} className="field h-10 flex-1" />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <SubmitButton variant="dark" className="h-10">
          {t("newsletterSubmit")} <ArrowRight />
        </SubmitButton>
      </div>
      <fieldset className="flex flex-wrap gap-1.5">
        <legend className="sr-only">Thèmes de la newsletter</legend>
        {THEMES.map(([key, label]) => (
          <label key={key} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-copy transition has-[:checked]:border-ink has-[:checked]:text-ink">
            <input type="checkbox" name="themes" value={key} defaultChecked className="size-3 accent-[var(--ink)]" /> {label}
          </label>
        ))}
      </fieldset>
      <p className="text-xs text-muted">{t("newsletterNote")}</p>
    </form>
  );
}
