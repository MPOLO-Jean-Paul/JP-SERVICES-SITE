"use client";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/ui/material-symbol";
import { Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

export function ThemeMenu({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const items = [
    { value: "light", label: t("themeLight"), text: t("themeLightText"), icon: "light_mode" },
    { value: "dark", label: t("themeDark"), text: t("themeDarkText"), icon: "dark_mode" },
    { value: "system", label: t("themeSystem"), text: t("themeSystemText"), icon: "desktop_windows" },
  ];
  return (
    <Menu modal={false}>
      <MenuTrigger asChild>
        <button type="button" aria-label={t("theme")} title={t("theme")} className={cn("inline-flex size-10 items-center justify-center rounded-full text-copy transition hover:bg-panel-2 hover:text-ink", className)}>
          <MaterialIcon name="contrast" size={21} />
        </button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>{t("theme")}</MenuLabel>
        <MenuRadioGroup value={mounted ? theme : undefined} onValueChange={setTheme}>
          {items.map(({ value, label, text, icon }) => (
            <MenuRadioItem key={value} value={value}>
              <MaterialIcon name={icon} size={20} />
              <span className="flex flex-col">
                <span className="font-medium text-ink">{label}</span>
                <span className="text-xs text-muted">{text}</span>
              </span>
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
