import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, GraduationCap, LifeBuoy, Lock, Rocket, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { pageMetadata, jsonLd } from "@/lib/seo";
import { SupportForm } from "./support-form";

export const metadata: Metadata = pageMetadata({ title: "Centre d’aide", description: "Questions fréquentes sur le compte, les formations, les projets et la communauté JP-Services, et formulaire d’assistance.", path: "/aide" });

const FAQ = [
  { q: "Comment activer mon compte ?", a: "Après l’inscription, un code à 6 chiffres est envoyé à votre adresse e-mail. Saisissez-le sur la page d’activation. Le code expire après 30 minutes ; vous pouvez en demander un nouveau." },
  { q: "J’ai oublié mon mot de passe.", a: "Utilisez « Mot de passe oublié » depuis la page de connexion. Un code de réinitialisation vous est envoyé par e-mail. Choisissez ensuite un mot de passe de 8 caractères minimum avec majuscule, minuscule et chiffre." },
  { q: "Comment m’inscrire à une formation ?", a: "Ouvrez la fiche de la formation, cliquez sur « S’inscrire », puis organisez votre programme en choisissant vos modules et jusqu’à trois créneaux. L’équipe confirme ensuite le planning." },
  { q: "Les formations en ligne nécessitent-elles un logiciel ?", a: "Non. Les sessions se déroulent dans le navigateur via une salle de visioconférence. Sur téléphone, l’application gratuite Jitsi Meet peut être proposée pour plus de confort." },
  { q: "Comment proposer un projet ?", a: "Connectez-vous, ouvrez la page Projets et décrivez votre initiative. Vous suivez ensuite son analyse et son statut depuis le même espace." },
  { q: "Comment supprimer mon compte ?", a: "Depuis Paramètres du compte, section « Zone sensible ». La suppression est définitive et retire vos publications, projets et inscriptions." },
];

export default function AidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) })} />
      <PageHeader title="Centre d’aide" icon={LifeBuoy} text="Une réponse claire, au bon moment. Retrouvez les sujets essentiels ou transmettez une demande détaillée à notre équipe." />
      <section className="section">
        <div className="shell">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { Icon: UserCheck, title: "Compte et sécurité", text: "Connexion, mot de passe, activation et protection de vos informations personnelles." },
              { Icon: GraduationCap, title: "Formations", text: "Inscription, programme, horaires et accès aux contenus pédagogiques." },
              { Icon: Rocket, title: "Projets et communauté", text: "Soumission d’un projet, suivi de validation et participation au forum." },
            ].map(({ Icon, title, text }) => (
              <article key={title} className="card jp-help-topic reveal flex min-w-0 gap-3 rounded-2xl p-4 sm:gap-4 sm:p-6">
                <span className="icon-box">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm text-copy">{text}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <span className="eyebrow">Questions fréquentes</span>
              <h2 className="h2 mt-2">Les réponses aux demandes les plus courantes.</h2>
              <div className="jp-help-faq mt-6 divide-y overflow-hidden rounded-2xl border">
                {FAQ.map((f, i) => (
                  <details key={f.q} name="jp-help-faq" open={i === 0} className="group">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 font-semibold text-ink sm:px-5 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1">{f.q}</span>
                      <ChevronDown className="jp-help-chevron size-4 shrink-0 text-muted transition-transform" aria-hidden="true" />
                    </summary>
                    <p className="px-4 pb-5 text-sm leading-relaxed text-copy sm:px-5">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <div className="card jp-public-form-panel reveal min-w-0 p-4 sm:p-8" id="assistance">
              <span className="eyebrow">Assistance humaine</span>
              <h2 className="h2 mt-2">Vous n’avez pas trouvé votre réponse ?</h2>
              <p className="mt-2 text-copy">Décrivez précisément la situation, l’action effectuée et le résultat observé. Ne transmettez jamais votre mot de passe.</p>
              <div className="mt-4 flex gap-3 rounded-lg border bg-canvas-soft p-3 text-sm text-copy">
                <Lock className="mt-0.5 size-4 shrink-0" />
                <span>
                  <strong className="text-ink">Sécurité du compte :</strong> L’équipe JP-Services ne vous demandera jamais votre mot de passe ni un code de validation.
                </span>
              </div>
              <div className="mt-6">
                <SupportForm />
              </div>
              <p className="mt-4 text-xs text-muted">
                Pour une demande commerciale, utilisez plutôt la{" "}
                <Link href="/contact" className="text-primary underline underline-offset-4">
                  page de contact
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
