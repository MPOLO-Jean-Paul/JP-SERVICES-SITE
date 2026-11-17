"use client";
import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Save, TriangleAlert } from "lucide-react";
import { deleteAccountAction, updateAvatarAction, updateProfileAction, type AuthState } from "@/server/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { Field, Input } from "@/components/ui/form";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function ProfileForms({ user }: { user: { prenom: string; nom: string; email: string; photoProfil: string; displayName: string; isGoogle: boolean; isAdmin: boolean } }) {
  const [state, action] = useActionState<AuthState, FormData>(updateProfileAction, {});
  const [pending, start] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h2 className="h3">Photo de profil</h2>
        <form className="mt-4 flex flex-wrap items-center gap-5" action={(fd) => start(async () => { const r = await updateAvatarAction(fd); if (r.error) toast.error(r.error); else { toast.success(r.success); router.refresh(); } })}>
          <Avatar name={user.displayName} src={user.photoProfil} size={72} />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold hover:bg-panel-2"><Camera className="size-4" /> Choisir une image<input type="file" name="photo" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="sr-only" onChange={(e) => e.currentTarget.form?.requestSubmit()} disabled={pending} /></label>
          <p className="text-xs text-muted">JPEG, PNG, WebP, GIF ou AVIF · 5 Mo maximum.</p>
        </form>
      </section>

      <form action={action} className="card space-y-6 p-6" noValidate>
        <h2 className="h3">Informations personnelles</h2>
        {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
        {state.success ? <Alert tone="success">{state.success}</Alert> : null}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom" htmlFor="prenom"><Input id="prenom" name="prenom" defaultValue={user.prenom} maxLength={100} autoComplete="given-name" /></Field>
          <Field label="Nom" htmlFor="nom"><Input id="nom" name="nom" defaultValue={user.nom} maxLength={100} autoComplete="family-name" /></Field>
        </div>
        <Field label="Adresse e-mail" htmlFor="email" hint={user.isGoogle ? "Compte lié à Google." : "La modification de l’e-mail nécessite votre mot de passe actuel."}><Input id="email" name="email" type="email" defaultValue={user.email} maxLength={254} autoComplete="email" readOnly={user.isGoogle} /></Field>
        <div className="border-t pt-6">
          <h3 className="font-semibold">Sécurité du compte</h3>
          <p className="mt-1 text-sm text-copy">{user.isGoogle ? "Vous vous connectez avec Google. Définir un mot de passe vous permettra aussi de vous connecter par e-mail." : "Votre mot de passe actuel est obligatoire pour modifier l’adresse e-mail ou choisir un nouveau mot de passe."}</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            {!user.isGoogle ? <Field label="Mot de passe actuel" htmlFor="mot_de_passe_actuel"><PasswordInput id="mot_de_passe_actuel" name="mot_de_passe_actuel" autoComplete="current-password" /></Field> : null}
            <Field label="Nouveau mot de passe" htmlFor="nouveau_mot_de_passe" hint="8 caractères min., majuscule, minuscule et chiffre."><PasswordInput id="nouveau_mot_de_passe" name="nouveau_mot_de_passe" autoComplete="new-password" minLength={8} maxLength={128} /></Field>
            <Field label="Confirmation" htmlFor="confirmer_mot_de_passe"><PasswordInput id="confirmer_mot_de_passe" name="confirmer_mot_de_passe" autoComplete="new-password" minLength={8} maxLength={128} /></Field>
          </div>
        </div>
        <div className="flex justify-end"><SubmitButton><Save /> Enregistrer</SubmitButton></div>
      </form>

      {!user.isAdmin ? (
        <section className="rounded-xl border border-red-200 p-6 dark:border-red-900/50">
          <h2 className="h3 flex items-center gap-2 text-danger"><TriangleAlert className="size-5" /> Zone sensible</h2>
          <p className="mt-2 text-sm text-copy">La suppression de votre compte est définitive : publications, projets, inscriptions et notifications seront effacés.</p>
          <Button variant="danger" className="mt-4" onClick={() => setDeleteOpen(true)}>Supprimer mon compte</Button>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent title="Supprimer définitivement votre compte ?" description="Confirmez avec votre mot de passe. Cette action ne peut pas être annulée.">
              <form action={(fd) => start(async () => { const r = await deleteAccountAction(fd); if (r?.error) setDeleteError(r.error); })} className="space-y-4">
                {deleteError ? <Alert tone="danger">{deleteError}</Alert> : null}
                {!user.isGoogle ? <Field label="Mot de passe" htmlFor="delete-password"><PasswordInput id="delete-password" name="mot_de_passe" autoComplete="current-password" required /></Field> : null}
                <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>Annuler</Button><Button type="submit" variant="danger" loading={pending}>Supprimer définitivement</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </section>
      ) : null}
    </div>
  );
}
