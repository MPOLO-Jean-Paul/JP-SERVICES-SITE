"use client";
import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Bell, BellOff, CalendarCheck, CheckCircle2, CircleHelp, Clock, ListChecks, ShieldCheck, Signal } from "lucide-react";
import { enrollAction, toggleAlertsAction } from "@/server/actions/formations";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EnrollCard({ formationId, priceLabel, isFree, duration, level, startLabel, modulesCount, user, state }: { formationId: number; priceLabel: string; isFree: boolean; duration: string; level: string; startLabel: string; modulesCount: number; user: boolean; state: { isEnrolled: boolean; notificationsOn: boolean; planningStatus: string | null } }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      (r.ok ? toast.success : toast.error)(r.message);
      router.refresh();
    });
  return (
    <aside className="card sticky top-32 p-6 shadow-md" aria-label="Inscription à la formation">
      <div className="flex items-end justify-between">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">Tarif de la formation</span>
          <p className={cn("mt-1 font-display text-3xl font-semibold tracking-tight", isFree && "text-success")}>{priceLabel}</p>
        </div>
        <ShieldCheck className="size-6 text-muted" aria-hidden />
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-3 text-sm">
        {[
          [Clock, "Durée", duration],
          [Signal, "Niveau", level],
          [CalendarCheck, "Début", startLabel],
          [ListChecks, "Programme", `${modulesCount} module${modulesCount > 1 ? "s" : ""}`],
        ].map(([Icon, label, value]) => {
          const I = Icon as typeof Clock;
          return (
            <li key={label as string} className="rounded-lg border bg-canvas-soft p-3">
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <I className="size-3.5" /> {label as string}
              </span>
              <strong className="mt-1 block text-sm">{value as string}</strong>
            </li>
          );
        })}
      </ul>
      <div className="mt-5 space-y-3">
        {user ? (
          state.isEnrolled ? (
            <>
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <span>
                  <strong className="block">Vous êtes inscrit</strong>
                  {state.planningStatus ? `Planning : ${{ en_attente: "en attente de validation", valide: "validé", refuse: "à revoir", brouillon: "brouillon" }[state.planningStatus] ?? state.planningStatus}.` : "Votre programme peut maintenant être organisé."}
                </span>
              </div>
              <Link href={`/formations/${formationId}/programme`} className={cn(buttonVariants({ variant: "dark", size: "lg" }), "w-full")}>
                {state.planningStatus ? "Consulter mon programme" : "Organiser mon programme"} <ArrowRight />
              </Link>
            </>
          ) : (
            <Button variant="dark" size="lg" className="w-full" loading={pending} onClick={() => run(() => enrollAction(formationId))}>
              S’inscrire à cette formation <ArrowRight />
            </Button>
          )
        ) : (
          <>
            <Link href={`/connexion?redirect_to=${encodeURIComponent(`/formations/${formationId}`)}`} className={cn(buttonVariants({ variant: "dark", size: "lg" }), "w-full")}>
              Se connecter pour s’inscrire <ArrowRight />
            </Link>
            <p className="text-xs text-muted">
              <ShieldCheck className="mr-1 inline size-3.5" /> Votre compte permet de suivre l’inscription, le planning et les notifications.
            </p>
          </>
        )}
        {user ? (
          <Button variant="ghost" className="w-full" loading={pending} onClick={() => run(() => toggleAlertsAction(formationId, !state.notificationsOn))}>
            {state.notificationsOn ? <BellOff /> : <Bell />} {state.notificationsOn ? "Désactiver les alertes" : "Recevoir les mises à jour"}
          </Button>
        ) : null}
      </div>
      <Link href="/aide" className="mt-4 inline-flex items-center gap-2 text-sm text-copy hover:text-primary">
        <CircleHelp className="size-4" /> Une question avant de commencer ?
      </Link>
    </aside>
  );
}
