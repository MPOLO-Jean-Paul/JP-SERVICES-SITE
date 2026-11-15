import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon, title, text, action, className }: { icon: LucideIcon; title: string; text?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("card bg-dots flex flex-col items-center px-6 py-16 text-center", className)}>
      <span className="icon-box mb-4 size-12"><Icon aria-hidden /></span>
      <h3 className="h3">{title}</h3>
      {text ? <p className="mt-2 max-w-md text-copy">{text}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
