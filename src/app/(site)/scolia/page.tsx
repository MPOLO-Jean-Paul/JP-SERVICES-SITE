import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Banknote, BookOpenCheck, CalendarClock, Database, FileSpreadsheet, GraduationCap, HardDriveDownload, Landmark, LockKeyhole, MonitorSmartphone, Network, Receipt, ShieldCheck, Users, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { jsonLd, pageMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "SCOLIA Pro — logiciel de gestion scolaire", description: "SCOLIA Pro, le logiciel de gestion scolaire conçu par JP-Services pour les établissements privés en RDC : secrétariat, caisse, recouvrement, scolarité, personnel et paie, sans Excel.", path: "/scolia" });

const MODULES = [
  { Icon: Users, t: "Secrétariat", d: "Apprenants (fiche, inscription, statut, promotion, prise en charge), réinscriptions et listes de classe." },
  { Icon: Wallet, t: "Finances", d: "Encaissement par mois avec aperçu de répartition, journal des reçus, annulation motivée, recouvrement, caisse et dépenses." },
  { Icon: GraduationCap, t: "Scolarité", d: "Cours et évaluations, saisie des notes, résultats et bulletins (maternelle, primaire, secondaire), présences et discipline." },
  { Icon: Landmark, t: "Administration", d: "Personnel et paie, paramètres de l’établissement, années, sections, promotions et utilisateurs." },
  { Icon: Database, t: "Données", d: "Tableau de bord, rapports et exports PDF/Excel/CSV, sauvegardes, import depuis l’ancienne version et journal d’audit." },
  { Icon: CalendarClock, t: "Cartes et calendrier", d: "Cartes d’examen, profils d’établissement, calendrier scolaire et terminologie adaptés au système éducatif congolais." },
];

export default function ScoliaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@type": "SoftwareApplication", name: "SCOLIA Pro", applicationCategory: "BusinessApplication", operatingSystem: "Windows 10/11, Android", description: "Logiciel de gestion scolaire : secrétariat, caisse, recouvrement, scolarité, personnel et paie.", publisher: { "@type": "Organization", name: "JP-Services", url: SITE_URL } })} />
      <section className="jp-product-hero" aria-labelledby="scolia-hero-title">
        <div className="shell jp-product-hero-layout">
          <div className="jp-product-hero-copy">
            <p className="jp-overline"><span className="jp-overline-mark"/> LOGICIEL MÉTIER / JP-SERVICES</p>
            <h1 id="scolia-hero-title">SCOLIA Pro.<br/><span>La gestion scolaire, en un seul espace.</span></h1>
            <p className="jp-product-hero-lead">Un projet logiciel conçu pour faciliter le travail des établissements : administration, scolarité, suivi financier et organisation des informations.</p>
            <span className="jp-product-stage">PROJET EN ÉVOLUTION — MODALITÉS SUR DEMANDE</span>
            <div className="jp-directory-actions">
              <Link href="/contact?sujet=SCOLIA%20Pro" className="jp-action jp-action-primary">Demander des informations <ArrowUpRight size={18}/></Link>
              <Link href="/logiciels" className="jp-action jp-action-text">Explorer les logiciels <ArrowRight size={17}/></Link>
            </div>
          </div>
          <aside className="jp-product-aside" aria-label="Principaux domaines du projet">
            <span>SCOLIA / DOMAINES FONCTIONNELS</span>
            {["Gestion des apprenants","Finances et encaissements","Scolarité et suivi","Administration et rapports"].map((name,i)=>
              <div key={name}><small>{String(i+1).padStart(2,"0")}</small><strong>{name}</strong></div>
            )}
            <p>Les fonctionnalités et conditions de déploiement sont à confirmer avec notre équipe.</p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeading kicker="Six métiers, un seul logiciel" title="Tout le fonctionnement de l’école, du secrétariat à la paie." text="Chaque module parle le vocabulaire de l’école et s’appuie sur les mêmes données : plus de ressaisie, plus de classeurs dispersés." />
          <div className="jp-product-modules mt-12 grid gap-0 md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map(({ Icon, t, d }) => <article key={t} className="jp-product-module p-7"><Icon className="size-5" /><h3 className="h3 mt-6">{t}</h3><p className="mt-2 text-copy">{d}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section border-y bg-canvas-soft">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="reveal"><span className="eyebrow">Fiabilité et traçabilité</span><h2 className="h2 mt-2">Des chiffres justes, des preuves à chaque opération.</h2><p className="mt-4 text-lg text-copy">SCOLIA Pro a été conçu pour que le promoteur, le comptable et le secrétariat partagent une seule vérité : chaque encaissement produit un reçu numéroté, chaque modification est journalisée, chaque sauvegarde est vérifiée.</p>
            <ul className="mt-6 space-y-3">{[[Receipt, "Reçus A5 numérotés sans trou, annulation motivée uniquement"], [LockKeyhole, "Journal d’audit chaîné par SHA-256 : aucune écriture ne disparaît"], [HardDriveDownload, "Sauvegarde quotidienne vérifiée et restauration en un clic"], [ShieldCheck, "Rôles et comptes utilisateurs, effacement protégé par mot de passe"]].map(([I, t]) => { const Ic = I as typeof Receipt; return <li key={t as string} className="flex items-start gap-3 text-copy"><Ic className="mt-0.5 size-5 shrink-0" /> {t as string}</li>; })}</ul></div>
          <div className="reveal grid gap-4 sm:grid-cols-2">
            {[[Banknote, "Recouvrement", "Soldes par apprenant, rappels WhatsApp et SMS, situation par promotion."], [FileSpreadsheet, "Exports", "PDF vectoriels, Excel et CSV : listes, reçus, retards, dépenses, discipline, audit."], [Network, "Multiposte", "Un poste garde les données, les autres ouvrent SCOLIA dans leur navigateur sur le réseau local."], [MonitorSmartphone, "Windows et Android", "Client de bureau natif et application mobile pour les consultations et pointages."]].map(([I, t, d]) => { const Ic = I as typeof Banknote; return <div key={t as string} className="card p-6"><Ic className="size-5" /><h3 className="mt-3 font-semibold">{t as string}</h3><p className="mt-1 text-sm text-copy">{d as string}</p></div>; })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeading kicker="Déploiement" title="Une installation adaptée à votre établissement." />
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {[["Étudier", "Préciser les besoins de l’établissement et les fonctionnalités attendues."], ["Configurer", "Définir les années scolaires, sections, promotions et paramètres requis."], ["Reprendre", "Préparer et vérifier l’importation des données existantes si elle est nécessaire."], ["Accompagner", "Organiser la prise en main et l’assistance selon les modalités convenues."]].map(([t, d], i) => <li key={t} className="reveal relative rounded-xl border p-6 pt-9"><span className="absolute -top-3.5 left-6 inline-flex size-7 items-center justify-center rounded-full border bg-panel font-mono text-xs">{i + 1}</span><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-copy">{d}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="section pt-0">
        <div className="shell">
          <div className="jp-product-license reveal grid min-w-0 gap-8 rounded-md border bg-panel p-5 sm:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:p-12">
            <div><span className="eyebrow">Licence établissement</span><h2 className="h2 mt-2">Un abonnement clair, des données qui restent à l’école.</h2><p className="mt-3 text-copy">La licence est gérée par JP-Services sans accès à vos données : les apprenants, paiements et bulletins restent sur votre serveur. En cas de suspension, l’accès passe en lecture seule ; rien n’est supprimé.</p>
              <ul className="mt-5 grid gap-2 text-sm text-copy sm:grid-cols-2">{["Période d’essai", "Renouvellement annuel", "Assistance et mises à jour incluses", "Tarification selon la taille de l’école"].map((p) => <li key={p} className="flex items-center gap-2"><BadgeCheck className="size-4 text-emerald-600" /> {p}</li>)}</ul></div>
            <div className="jp-product-license-contact flex min-w-0 flex-col gap-3 rounded-md border bg-canvas-soft p-4 sm:p-6"><BookOpenCheck className="size-6" /><h3 className="h3">Parlons de votre établissement</h3><p className="text-sm text-copy">Nous organisons une démonstration en visioconférence ou sur site à Lubumbashi.</p><Link href="/contact?sujet=SCOLIA%20Pro" className={buttonVariants({ variant: "dark", size: "lg", className: "min-h-12 max-w-full whitespace-normal px-3 py-2 text-center leading-snug" })}>Demander une démonstration <ArrowRight /></Link><Link href="/formations-en-ligne" className={buttonVariants({ variant: "ghost", className: "min-h-11 max-w-full whitespace-normal px-3 py-2 text-center leading-snug" })}>Voir les sessions de présentation</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
