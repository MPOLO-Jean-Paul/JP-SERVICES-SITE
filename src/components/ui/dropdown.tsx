"use client";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const Menu = Dropdown.Root;
export const MenuTrigger = Dropdown.Trigger;
export const MenuSeparator = (props: React.ComponentProps<typeof Dropdown.Separator>) => <Dropdown.Separator className="my-1.5 h-px bg-line" {...props} />;
export const MenuLabel = (props: React.ComponentProps<typeof Dropdown.Label>) => <Dropdown.Label className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted" {...props} />;

export function MenuContent({ className, ...props }: React.ComponentProps<typeof Dropdown.Content>) {
  return (
    <Dropdown.Portal>
      <Dropdown.Content
        sideOffset={10}
        align="end"
        collisionPadding={12}
        className={cn("z-50 min-w-56 rounded-lg border bg-panel p-1.5 shadow-lg data-[state=open]:animate-fade-up", className)}
        {...props}
      />
    </Dropdown.Portal>
  );
}

export const menuItemClass = "flex w-full cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 text-sm text-copy outline-none transition data-[highlighted]:bg-panel-2 data-[highlighted]:text-ink [&_svg]:size-4 [&_svg]:text-muted";
export function MenuItem({ className, ...props }: React.ComponentProps<typeof Dropdown.Item>) {
  return <Dropdown.Item className={cn(menuItemClass, className)} {...props} />;
}
export function MenuRadioGroup(props: React.ComponentProps<typeof Dropdown.RadioGroup>) {
  return <Dropdown.RadioGroup {...props} />;
}
export function MenuRadioItem({ className, ...props }: React.ComponentProps<typeof Dropdown.RadioItem>) {
  return <Dropdown.RadioItem className={cn(menuItemClass, "data-[state=checked]:bg-primary-soft data-[state=checked]:text-primary", className)} {...props} />;
}
