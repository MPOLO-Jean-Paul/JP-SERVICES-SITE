import type { Metadata } from "next";
import { MemberShell } from "@/components/member/member-shell";
import { requireUser } from "@/server/auth/session";
import { countUnreadNotifications } from "@/server/services/formations";
import { ProfileForms } from "./profile-forms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Paramètres du compte", robots: { index: false } };

export default async function EditProfilePage() {
  const user = await requireUser("/profil/modifier");
  const unread = await countUnreadNotifications(user.id).catch(() => 0);
  return (
    <MemberShell user={user} current="/profil/modifier" title="Paramètres du compte" text="Gardez vos coordonnées et vos accès à jour." unread={unread}>
      <ProfileForms user={{ prenom: user.prenom, nom: user.nom, email: user.email, photoProfil: user.photoProfil, displayName: user.displayName, isGoogle: user.authProvider === "google", isAdmin: user.isAdmin }} />
    </MemberShell>
  );
}
