import type { Metadata } from "next";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { LegalPage } from "@/components/site/legal-layout";
import { OpenCookiesButton } from "@/components/site/cookie-consent";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Politique de cookies", description: "Quels traceurs sont utilisés sur JP-Services, pourquoi, et comment garder le contrôle sur vos choix.", path: "/cookies" });

const ROWS = [
  ["jp_session", "Maintient votre session de connexion et la sécurité de votre compte.", "14 jours", "Essentiel"],
  ["jp_locale", "Mémorise la langue d’affichage choisie.", "6 mois", "Essentiel"],
  ["jp_consent", "Conserve votre choix concernant les cookies facultatifs.", "6 mois", "Essentiel"],
  ["jp-theme (stockage local)", "Retient votre préférence de thème clair, sombre ou système.", "Persistant", "Essentiel"],
  ["Mesure d’audience", "Statistiques anonymes de fréquentation. Déposée uniquement avec votre accord.", "13 mois max", "Facultatif"],
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Politique de cookies"
      icon={Cookie}
      intro="Cette page explique quels traceurs sont utilisés sur JP-Services, pourquoi, et comment garder le contrôle sur vos choix."
      updated="Dernière mise à jour : novembre 2026"
      sections={[
        { title: "Qu’est-ce qu’un cookie ?", body: <p>Un cookie est un petit fichier enregistré sur votre appareil lors de la visite d’un site. Il permet par exemple de maintenir votre connexion, de mémoriser votre langue ou votre thème d’affichage.</p> },
        {
          title: "Les cookies que nous utilisons",
          body: (
            <div className="jp-cookie-table overflow-x-auto rounded-xl border">
              <table className="table-jp">
                <thead><tr><th>Nom</th><th>Finalité</th><th>Durée</th><th>Type</th></tr></thead>
                <tbody>{ROWS.map(([n, f, d, t]) => (
                  <tr key={n}>
                    <td className="jp-cookie-name font-medium"><CookieName name={String(n)} /></td>
                    <td data-label="Finalité">{f}</td>
                    <td data-label="Durée" className="whitespace-nowrap">{d}</td>
                    <td data-label="Type"><span className={t === "Essentiel" ? "jp-cookie-tag jp-cookie-tag-ok" : "jp-cookie-tag jp-cookie-tag-opt"}>{t}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ),
        },
        { title: "Gérer vos préférences", body: <><p>Vous pouvez accepter, refuser ou modifier à tout moment les cookies facultatifs. Votre choix est conservé six mois, puis il vous sera redemandé.</p><OpenCookiesButton className={buttonVariants({ variant: "outline", className: "mt-4" })}>Modifier mes préférences</OpenCookiesButton></> },
        { title: "Vos autres droits", body: <p>Pour toute question sur vos données personnelles, consultez la <Link href="/confidentialite">politique de confidentialité</Link> ou écrivez-nous depuis la <Link href="/contact">page contact</Link>.</p> },
      ]}
      aside={<div className="rounded-xl bg-panel-2 p-5 text-sm text-copy"><strong className="block text-ink">En résumé</strong><ul className="mt-2 list-disc space-y-1 pl-5"><li>Aucun cookie publicitaire n’est utilisé.</li><li>Les cookies essentiels ne peuvent pas être désactivés : ils font fonctionner le site.</li><li>La mesure d’audience n’est activée qu’avec votre consentement.</li></ul></div>}
    />
  );
}

/** Nom technique en style code ; libellé simple (« Mesure d’audience ») en texte normal. */
function CookieName({ name }: { name: string }) {
  const [id = "", ...rest] = name.split(" ");
  if (!/^[a-z][\w-]*$/i.test(id) || /^[A-Z]/.test(id)) return <>{name}</>;
  return <span><code>{id}</code>{rest.length ? <span className="mt-1 block text-xs font-normal text-muted">{rest.join(" ").replace(/[()]/g, "")}</span> : null}</span>;
}
