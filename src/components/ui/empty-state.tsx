import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** État vide illustré ; `icon` reste accepté pour compatibilité mais l’illustration le remplace. */
export function EmptyState({ title, text, action, className }: { icon?: LucideIcon; title: string; text?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("card jp-empty-state flex flex-col items-center px-6 py-12 text-center sm:py-16", className)}>
      <Image src="/illustrations/etat-vide.svg" width={240} height={220} alt="" unoptimized className="jp-empty-art mb-5 h-auto w-40" />
      <h3 className="h3">{title}</h3>
      {text ? <p className="mt-2 max-w-md text-copy">{text}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
