import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { LegalPage } from "@/components/site/legal-layout";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Conditions d’utilisation", description: "Un cadre simple pour utiliser les services et espaces JP-Services de manière responsable.", path: "/conditions" });

export default function ConditionsPage() {
  return (
    <LegalPage
      title="Conditions d’utilisation"
      icon={FileText}
      intro="Un cadre simple pour utiliser les services et espaces JP-Services de manière responsable."
      updated="Version mise à jour en novembre 2026"
      sections={[
        { title: "Acceptation des conditions", body: <p>En utilisant les services de JP-Services, vous acceptez les présentes conditions. Si vous n’êtes pas en mesure de les accepter, vous devez cesser d’utiliser les espaces concernés.</p> },
        { title: "Utilisation des services", body: <p>Les plateformes, formations et outils doivent être utilisés de manière légale, respectueuse et conforme à leur finalité. Toute tentative d’accès non autorisé, d’altération ou de perturbation est interdite.</p> },
        { title: "Comptes utilisateurs", body: <p>Vous êtes responsable de la confidentialité de vos identifiants et de l’exactitude des informations transmises. Signalez rapidement toute activité inhabituelle via le centre d’aide. Vous pouvez supprimer votre compte à tout moment depuis les paramètres.</p> },
        { title: "Contenus et communauté", body: <p>Les contributions publiées sur le forum doivent rester courtoises, utiles et licites. JP-Services peut retirer un contenu manifestement abusif, trompeur ou portant atteinte aux droits d’autrui.</p> },
        { title: "Formations et paiements", body: <p>Les tarifs affichés sur chaque fiche sont exprimés en dollars américains. L’inscription en ligne manifeste votre intérêt ; les modalités pratiques (planning, paiement, supports) sont confirmées par l’équipe avant le début de la formation.</p> },
        { title: "Propriété intellectuelle", body: <p>Les logiciels (dont SCOLIA Pro), identités visuelles, supports et contenus produits par JP-Services restent protégés. Leur consultation ne constitue pas un transfert de droits de propriété.</p> },
        { title: "Assistance", body: <p>Pour toute question concernant ces conditions, utilisez le <Link href="/aide">centre d’aide</Link> ou la <Link href="/contact">page de contact</Link>.</p> },
      ]}
    />
  );
}
