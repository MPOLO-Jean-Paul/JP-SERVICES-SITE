import type { Metadata } from "next";
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import { LegalPage } from "@/components/site/legal-layout";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Politique de confidentialité", description: "Quelles informations JP-Services utilise, pourquoi, et les mesures prévues pour les protéger.", path: "/confidentialite" });

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      icon={ShieldCheck}
      intro="Nous expliquons quelles informations sont utilisées et les mesures prévues pour les protéger."
      updated="Dernière mise à jour : novembre 2026"
      sections={[
        { title: "Données collectées", body: <p>JP-Services traite les informations nécessaires à la création des comptes (adresse e-mail, nom facultatif, photo facultative), aux inscriptions aux formations, aux projets, aux échanges communautaires et aux demandes d’assistance. Certaines données techniques limitées, comme l’adresse IP et le navigateur, contribuent à la sécurité du service (limitation des tentatives, sessions).</p> },
        { title: "Finalités d’utilisation", body: <p>Ces données servent à fournir les fonctionnalités demandées, sécuriser les accès, répondre aux messages, organiser les formations et améliorer le fonctionnement du site. Elles ne sont pas vendues à des tiers.</p> },
        { title: "Connexion Google", body: <p>Si vous choisissez « Continuer avec Google », nous recevons uniquement votre adresse e-mail vérifiée, votre nom et votre photo de profil afin de créer ou relier votre compte. Aucun accès à vos autres données Google n’est demandé.</p> },
        { title: "Sécurité", body: <p>Les mots de passe sont hachés (bcrypt), les sessions sont stockées côté serveur et révocables, les formulaires sensibles sont protégés contre les requêtes non autorisées, les tentatives abusives sont limitées et les téléversements sont contrôlés.</p> },
        { title: "Conservation", body: <p>Les informations sont conservées pendant la durée utile aux services concernés, puis supprimées ou rendues anonymes lorsqu’elles ne sont plus nécessaires. Les demandes d’inscription non activées sont supprimées après 30 minutes. La suppression d’un compte efface ses publications, projets et inscriptions.</p> },
        { title: "Vos droits", body: <p>Vous pouvez corriger votre profil et supprimer votre compte depuis votre espace personnel. Pour une question relative à vos données, contactez l’équipe via le <Link href="/aide">centre d’aide</Link>.</p> },
      ]}
      aside={<div className="flex gap-3 rounded-xl bg-panel-2 p-5 text-sm text-copy"><Lock className="mt-0.5 size-5 shrink-0 text-primary" /><p><strong className="text-ink">JP-Services ne vous demandera jamais votre mot de passe</strong> ou un code de validation par e-mail, téléphone ou messagerie.</p></div>}
    />
  );
}
