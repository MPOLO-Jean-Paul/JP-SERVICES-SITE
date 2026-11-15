import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 [&_svg]:size-3.5", {
  variants: {
    tone: {
      neutral: "bg-panel-2 text-copy ring-1 ring-inset ring-line",
      brand: "bg-primary-soft text-primary ring-1 ring-inset ring-primary/15",
      success: "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
      warning: "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
      danger: "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200",
      info: "bg-sky-50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200",
      outline: "border border-line text-copy",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ className, tone, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
