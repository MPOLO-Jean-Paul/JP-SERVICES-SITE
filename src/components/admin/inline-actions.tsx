"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/form";
import { cn } from "@/lib/utils";

/** Liste déroulante qui enregistre immédiatement via une action serveur. */
export function StatusSelect({ value, options, action, className }: { value: string; options: Array<{ value: string; label: string }>; action: (value: string) => Promise<{ ok: boolean; message?: string } | void>; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <Select
      value={value}
      disabled={pending}
      aria-label="Statut"
      className={cn("h-9 w-auto min-w-40 py-1 text-sm", className)}
      onChange={(e) => {
        const next = e.target.value;
        start(async () => {
          const r = await action(next);
          if (r && !r.ok) toast.error(r.message ?? "Échec de la mise à jour.");
          else toast.success("Statut mis à jour.");
        });
      }}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );
}

export function ActionButton({ action, children, className, successMessage = "Action effectuée." }: { action: () => Promise<{ ok: boolean; message?: string } | void>; children: React.ReactNode; className?: string; successMessage?: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} className={cn("inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium text-copy transition hover:border-primary/50 hover:text-primary disabled:opacity-50", className)} onClick={() => start(async () => { const r = await action(); if (r && !r.ok) toast.error(r.message ?? "Échec."); else toast.success(r?.message ?? successMessage); })}>
      {children}
    </button>
  );
}
