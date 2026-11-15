"use client";
import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Globe } from "lucide-react";
import { Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/ui/dropdown";
import { locales, localeLabels } from "@/i18n/config";
import { setLocale } from "@/server/actions/locale";
import { cn } from "@/lib/utils";

export function LanguageMenu({ className, variant = "icon" }: { className?: string; variant?: "icon" | "select" }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  if (variant === "select") {
    return (
      <label className="inline-flex items-center gap-2 text-sm text-copy">
        <Globe className="size-4" aria-hidden />
        <span className="sr-only">{t("language")}</span>
        <select className="rounded-md border bg-panel px-2 py-1.5 text-sm" value={locale} disabled={pending} onChange={(e) => startTransition(() => setLocale(e.target.value))}>
          {locales.map((l) => (
            <option key={l} value={l}>
              {localeLabels[l].label}
            </option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <Menu modal={false}>
      <MenuTrigger asChild>
        <button type="button" aria-label={t("language")} title={t("language")} className={cn("inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-copy transition hover:bg-panel-2 hover:text-ink", className)}>
          <Globe className="size-[1.1rem]" aria-hidden />
          <span>{localeLabels[locale as keyof typeof localeLabels]?.short ?? "FR"}</span>
        </button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>{t("language")}</MenuLabel>
        <MenuRadioGroup value={locale} onValueChange={(v) => startTransition(() => setLocale(v))}>
          {locales.map((l) => (
            <MenuRadioItem key={l} value={l}>
              <span className="w-7 text-xs font-bold">{localeLabels[l].short}</span>
              <span className="flex flex-1 flex-col">
                <span className="font-medium text-ink">{localeLabels[l].label}</span>
                <span className="text-xs text-muted">{localeLabels[l].description}</span>
              </span>
              {locale === l ? <Check /> : null}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
