"use client";
import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { addCommentAction } from "@/server/actions/forum";
import type { FormState } from "@/server/actions/contact";
import { Textarea } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

export function CommentForm({ postId }: { postId: number }) {
  const bound = addCommentAction.bind(null, postId);
  const [state, action] = useActionState<FormState, FormData>(bound, { status: "idle" });
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.status === "success") ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-3" noValidate>
      {state.status === "error" ? <Alert tone="danger">{state.message}</Alert> : null}
      {state.status === "success" ? <Alert tone="success">{state.message}</Alert> : null}
      <label className="sr-only" htmlFor="contenu">Votre réponse</label>
      <Textarea id="contenu" name="contenu" rows={4} required minLength={2} maxLength={5000} placeholder="Écrivez votre réponse ici…" defaultValue={state.values?.contenu} />
      <div className="flex justify-end"><SubmitButton>Publier la réponse <Send /></SubmitButton></div>
    </form>
  );
}
