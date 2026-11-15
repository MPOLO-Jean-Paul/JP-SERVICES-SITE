"use client";
import { useActionState } from "react";
import { updateNewsletterPrefs, type NewsletterState } from "@/server/actions/newsletter";
import { Checkbox } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const THEMES: Array<[string, string]> = [["formations", "Formations"], ["formations_en_ligne", "Formations en ligne"], ["logiciels", "Logiciels"], ["actualites", "Actualités"], ["offres", "Offres & promotions"]];

export function PrefsForm({ email, token, themes }: { email: string; token: string; themes: string[] }) {
  const [state, action] = useActionState<NewsletterState, FormData>(updateNewsletterPrefs, { status: "idle" });
  return (
    <form action={action} className="space-y-5">
      {state.status !== "idle" ? <Alert tone={state.status === "success" ? "success" : "danger"}>{state.message}</Alert> : null}
      <input type="hidden" name="email" value={email} /><input type="hidden" name="t" value={token} />
      <fieldset className="space-y-3"><legend className="label">Thèmes qui vous intéressent</legend>{THEMES.map(([k, l]) => <Checkbox key={k} name="themes" value={k} defaultChecked={themes.length === 0 || themes.includes(k)} label={l} />)}</fieldset>
      <div className="flex flex-wrap gap-3"><SubmitButton name="action" value="save">Enregistrer mes préférences</SubmitButton><SubmitButton name="action" value="unsubscribe" variant="outline">Me désinscrire</SubmitButton></div>
    </form>
  );
}
