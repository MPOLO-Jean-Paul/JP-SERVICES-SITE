"use client";
import { useActionState, useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { planningAction, type PlanningState } from "@/server/actions/formations";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PlanningForm({ formationId, formationTitre, modules, days, defaultStart, defaultEnd }: { formationId: number; formationTitre: string; modules: string[]; days: string[]; defaultStart: string; defaultEnd: string }) {
  const [state, action] = useActionState<PlanningState, FormData>(planningAction, {});
  const [selectedModules, setSelectedModules] = useState<string[]>(modules.slice(0, 1));
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [times, setTimes] = useState<Record<string, { debut: string; fin: string }>>(() => Object.fromEntries(days.map((d) => [d, { debut: defaultStart, fin: defaultEnd }])));
  const [reviewing, setReviewing] = useState(false);

  const toggleModule = (m: string) => setSelectedModules((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));
  const toggleDay = (d: string) => setSelectedDays((s) => (s.includes(d) ? s.filter((x) => x !== d) : s.length >= 3 ? s : [...s, d]));
  const review = state.review && reviewing;

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start" onSubmit={() => setReviewing(true)}>
      <input type="hidden" name="formation_id" value={formationId} />
      {selectedModules.map((m) => (
        <input key={m} type="hidden" name="modules" value={m} />
      ))}
      {selectedDays.map((d) => (
        <input key={d} type="hidden" name="jours" value={d} />
      ))}
      {selectedDays.map((d) => (
        <span key={`t-${d}`}>
          <input type="hidden" name={`debut_${d}`} value={times[d]?.debut ?? defaultStart} />
          <input type="hidden" name={`fin_${d}`} value={times[d]?.fin ?? defaultEnd} />
        </span>
      ))}
      <div className="space-y-8">
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        {review ? (
          <section className="card p-7">
            <span className="kicker">Dernière vérification</span>
            <h2 className="h2 mt-2">Votre programme personnalisé.</h2>
            <p className="mt-2 text-copy">Relisez les modules et disponibilités avant de transmettre la demande à l’équipe JP-Services.</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold">Modules</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-copy">
                  {state.review!.modules.map((m) => (
                    <li key={m} className="flex gap-2">
                      <Check className="mt-0.5 size-4 text-emerald-600" /> {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Disponibilités</h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {Object.entries(state.review!.schedule).map(([d, h]) => (
                    <li key={d} className="flex justify-between rounded-lg bg-panel-2 px-3 py-1.5">
                      <span className="font-medium">{d}</span>
                      <span className="text-copy">
                        {h.debut} → {h.fin}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => setReviewing(false)}>
                Modifier
              </Button>
              <SubmitButton name="confirmer" value="1">
                Confirmer et transmettre <ArrowRight />
              </SubmitButton>
            </div>
          </section>
        ) : (
          <>
            <section className="card p-7">
              <span className="kicker">Étape 1 sur 2</span>
              <h2 className="h3 mt-1">Choisissez vos modules</h2>
              <p className="mt-1 text-sm text-copy">Vous pouvez suivre le parcours complet ou sélectionner uniquement les parties pertinentes pour votre objectif.</p>
              <ul className="mt-5 space-y-2">
                {modules.map((m, i) => {
                  const on = selectedModules.includes(m);
                  return (
                    <li key={m}>
                      <button type="button" aria-pressed={on} onClick={() => toggleModule(m)} className={cn("flex w-full items-center gap-4 rounded-lg border p-4 text-left transition", on ? "border-primary bg-primary-soft" : "hover:border-primary/40")}>
                        <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-md border", on ? "border-primary bg-primary text-white" : "bg-panel")}>{on ? <Check className="size-4" /> : null}</span>
                        <span className="w-8 font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                        <span className="min-w-0">
                          <strong className="block">{m}</strong>
                          <small className="text-muted">Notions, démonstration et mise en pratique guidée</small>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="card p-7">
              <div className="flex items-center justify-between">
                <div>
                  <span className="kicker">Étape 2 sur 2</span>
                  <h2 className="h3 mt-1">Indiquez vos disponibilités</h2>
                </div>
                <output className="rounded-full bg-panel-2 px-3 py-1 text-sm font-semibold">{selectedDays.length} / 3 jours</output>
              </div>
              <p className="mt-1 text-sm text-copy">Choisissez entre un et trois jours, puis précisez la plage horaire souhaitée pour chacun.</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {days.map((d) => {
                  const on = selectedDays.includes(d);
                  const disabled = !on && selectedDays.length >= 3;
                  return (
                    <li key={d} className={cn("rounded-lg border p-4 transition", on ? "border-primary bg-primary-soft/60" : disabled && "opacity-50")}>
                      <button type="button" aria-pressed={on} disabled={disabled} onClick={() => toggleDay(d)} className="flex w-full items-center gap-3 text-left">
                        <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-md border", on ? "border-primary bg-primary text-white" : "bg-panel")}>{on ? <Check className="size-4" /> : null}</span>
                        <strong>{d}</strong>
                      </button>
                      <div className={cn("mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm", !on && "pointer-events-none opacity-50")}>
                        <label className="flex flex-col text-xs text-muted">
                          De
                          <input type="time" value={times[d]?.debut ?? defaultStart} onChange={(e) => setTimes((t) => ({ ...t, [d]: { debut: e.target.value, fin: t[d]?.fin ?? defaultEnd } }))} className="field mt-1 h-10 px-2" />
                        </label>
                        <ArrowRight className="mt-4 size-4 text-muted" />
                        <label className="flex flex-col text-xs text-muted">
                          À
                          <input type="time" value={times[d]?.fin ?? defaultEnd} onChange={(e) => setTimes((t) => ({ ...t, [d]: { debut: t[d]?.debut ?? defaultStart, fin: e.target.value } }))} className="field mt-1 h-10 px-2" />
                        </label>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </div>
      <aside className="card sticky top-24 p-6">
        <span className="kicker">Votre sélection</span>
        <h2 className="h3 mt-1">Récapitulatif</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted">Formation</dt>
            <dd className="font-medium">{formationTitre}</dd>
          </div>
          <div>
            <dt className="text-muted">Modules</dt>
            <dd className="font-medium">
              {selectedModules.length} sélectionné{selectedModules.length > 1 ? "s" : ""}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Disponibilités</dt>
            <dd className="font-medium">{selectedDays.length ? selectedDays.map((d) => `${d} ${times[d]?.debut}–${times[d]?.fin}`).join(", ") : "Aucun jour sélectionné"}</dd>
          </div>
        </dl>
        <div className="mt-5 flex gap-3 rounded-lg bg-panel-2 p-3 text-sm text-copy">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            <strong className="block text-ink">Avant l’envoi</strong>Vous pourrez vérifier une dernière fois les modules et horaires choisis.
          </span>
        </div>
        {!review ? (
          <SubmitButton className="mt-5 w-full" size="lg" disabled={!selectedModules.length || !selectedDays.length}>
            Vérifier mon programme <ArrowRight />
          </SubmitButton>
        ) : null}
        <p className="mt-2 text-xs text-muted">Cette étape n’enregistre pas encore définitivement votre demande.</p>
      </aside>
    </form>
  );
}
