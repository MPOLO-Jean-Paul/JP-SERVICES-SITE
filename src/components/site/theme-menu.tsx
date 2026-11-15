"use client";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Monitor, Moon, Sun, SunMoon } from "lucide-react";
import { Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

export function ThemeMenu({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const items = [
    { value: "light", label: t("themeLight"), text: t("themeLightText"), Icon: Sun },
    { value: "dark", label: t("themeDark"), text: t("themeDarkText"), Icon: Moon },
    { value: "system", label: t("themeSystem"), text: t("themeSystemText"), Icon: Monitor },
  ];
  return (
    <Menu modal={false}>
      <MenuTrigger asChild>
        <button type="button" aria-label={t("theme")} title={t("theme")} className={cn("inline-flex size-10 items-center justify-center rounded-full text-copy transition hover:bg-panel-2 hover:text-ink", className)}>
          <SunMoon className="size-[1.15rem]" aria-hidden />
        </button>
      </MenuTrigger>
      <MenuContent>
        <MenuLabel>{t("theme")}</MenuLabel>
        <MenuRadioGroup value={mounted ? theme : undefined} onValueChange={setTheme}>
          {items.map(({ value, label, text, Icon }) => (
            <MenuRadioItem key={value} value={value}>
              <Icon />
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
