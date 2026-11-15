"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, Globe } from "lucide-react";
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/ui/dropdown";
import { locales, localeLabels } from "@/i18n/config";
import { setLocale } from "@/server/actions/locale";
import { cn } from "@/lib/utils";

/**
 * Un même menu ancré sur mobile, tablette et desktop.
 * Ne pas utiliser <select> ici : Android l'affiche comme un dialogue
 * système centré et détaché de la position du déclencheur.
 */
export function LanguageMenu({
  className,
  variant = "icon",
}: {
  className?: string;
  variant?: "icon" | "select";
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const isFooter = variant === "select";
  const label = localeLabels[locale as keyof typeof localeLabels];

  return (
    <Menu modal={false}>
      <MenuTrigger asChild>
        <button
          type="button"
          disabled={pending}
          aria-label={t("language")}
          title={t("language")}
          data-testid={isFooter ? "footer-language-trigger" : "language-trigger"}
          className={cn(
            isFooter
              ? "jp-language-trigger inline-flex min-h-11 items-center gap-3 rounded-md border border-line-strong bg-panel px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-panel-2 data-[state=open]:border-primary"
              : "inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-copy transition-colors hover:bg-panel-2 hover:text-ink",
            className,
          )}
        >
          <Globe className="size-[17px] shrink-0" aria-hidden="true" />
          <span>{isFooter ? label?.label ?? "Français" : label?.short ?? "FR"}</span>
          {isFooter ? <ChevronDown className="ml-2 size-3.5 shrink-0 text-muted transition-transform data-[state=open]:rotate-180" aria-hidden="true" /> : null}
        </button>
      </MenuTrigger>
      <MenuContent
        data-testid={isFooter ? "footer-language-popover" : "language-popover"}
        side={isFooter ? "top" : "bottom"}
        align={isFooter ? "start" : "center"}
        sideOffset={6}
        collisionPadding={12}
        avoidCollisions
        className="jp-language-popover min-w-[188px] rounded-md border border-line-strong bg-panel p-1 shadow-lg"
      >
        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[.12em] text-muted">{t("language")}</p>
        <MenuRadioGroup value={locale} onValueChange={(nextLocale) => {
          if (nextLocale !== locale) startTransition(() => setLocale(nextLocale));
        }}>
          {locales.map((value) => (
            <MenuRadioItem
              key={value}
              value={value}
              className="jp-language-option flex min-h-11 items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-[13px] data-[state=checked]:bg-primary-soft data-[state=checked]:text-primary"
            >
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <span className="w-6 shrink-0 font-mono text-[10px] font-semibold text-muted">{localeLabels[value].short}</span>
                <span className="font-medium">{localeLabels[value].label}</span>
              </span>
              <Check className={cn("size-4 shrink-0", locale === value ? "opacity-100" : "opacity-0")} aria-hidden="true" />
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
