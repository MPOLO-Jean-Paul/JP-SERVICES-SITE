import type { Metadata } from "next";
import { ScoliaPreview } from "@/components/visuals/mockups";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, BookOpenCheck, CalendarClock, CheckCircle2, Database, Download, FileSpreadsheet, GraduationCap, HardDriveDownload, Landmark, LockKeyhole, MonitorSmartphone, Network, Receipt, School, ShieldCheck, Users, Wallet } from "lucide-react";
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
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@type": "SoftwareApplication", name: "SCOLIA Pro", applicationCategory: "BusinessApplication", operatingSystem: "Windows 10/11, Android", description: "Logiciel de gestion scolaire : secrétariat, caisse, recouvrement, scolarité, personnel et paie.", publisher: { "@type": "Organization", name: "JP-Services", url: SITE_URL }, offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Licence établissement sur devis, essai possible." } })} />
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [--grid-line:rgb(255_255_255/0.05)]" aria-hidden />
        <div className="pointer-events-none absolute -right-40 -top-40 size-[560px] rounded-full bg-brand-600/30 blur-3xl" aria-hidden />
        <div className="shell relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-white/70 ring-1 ring-white/10"><School className="size-3.5" /> Logiciel de gestion scolaire</span>
            <h1 className="h-display mt-7 text-white">SCOLIA Pro. <span className="text-brand-300">L’école, sans Excel.</span></h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">Secrétariat, caisse, recouvrement, scolarité, personnel et paie dans un seul logiciel fiable, conçu pour les complexes scolaires privés de la République démocratique du Congo.</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/contact?sujet=SCOLIA%20Pro" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-[15px] font-medium text-brand-950 transition hover:bg-white/90">Demander une démonstration <ArrowRight className="size-4" /></Link>
              <Link href="/logiciels" className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 px-6 text-[15px] font-medium transition hover:bg-white/10"><Download className="size-4" /> Télécharger</Link>
            </div>
          </div>
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute -inset-x-8 -bottom-8 top-12 rounded-[40px] bg-brand-500/25 blur-3xl" aria-hidden />
            <ScoliaPreview className="relative border-white/10 text-ink" />
          </div>
          <ul className="mx-auto mt-14 grid max-w-4xl gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            {["Installateur Windows autonome", "Multiposte en réseau local", "Reçus numérotés sans trou", "Journal d’audit chaîné SHA-256", "Sauvegarde quotidienne vérifiée", "Utilisable hors ligne"].map((p) => <li key={p} className="flex items-center gap-2 text-white/75"><CheckCircle2 className="size-4 shrink-0 text-brand-300" /> {p}</li>)}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeading kicker="Six métiers, un seul logiciel" title="Tout le fonctionnement de l’école, du secrétariat à la paie." text="Chaque module parle le vocabulaire de l’école et s’appuie sur les mêmes données : plus de ressaisie, plus de classeurs dispersés." />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-line md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map(({ Icon, t, d }) => <article key={t} className="bg-panel p-8"><Icon className="size-5" /><h3 className="h3 mt-6">{t}</h3><p className="mt-2 text-copy">{d}</p></article>)}
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
          <SectionHeading kicker="Déploiement" title="Opérationnel en une matinée." />
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {[["Installer", "Un seul fichier .exe avec assistant en français : aucun SDK ni Excel à installer."], ["Configurer", "Établissement, année scolaire, sections, promotions et tarifs en quelques écrans."], ["Importer", "Reprise des apprenants et paiements depuis l’ancienne version SCOLIA (Excel)."], ["Former", "Prise en main du secrétariat et de la comptabilité par JP-Services, sur place ou à distance."]].map(([t, d], i) => <li key={t} className="reveal relative rounded-xl border p-6 pt-9"><span className="absolute -top-3.5 left-6 inline-flex size-7 items-center justify-center rounded-full border bg-panel font-mono text-xs">{i + 1}</span><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-copy">{d}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="section pt-0">
        <div className="shell">
          <div className="reveal grid gap-8 rounded-2xl border bg-panel p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:p-12">
            <div><span className="eyebrow">Licence établissement</span><h2 className="h2 mt-2">Un abonnement clair, des données qui restent à l’école.</h2><p className="mt-3 text-copy">La licence est gérée par JP-Services sans accès à vos données : les apprenants, paiements et bulletins restent sur votre serveur. En cas de suspension, l’accès passe en lecture seule ; rien n’est supprimé.</p>
              <ul className="mt-5 grid gap-2 text-sm text-copy sm:grid-cols-2">{["Période d’essai", "Renouvellement annuel", "Assistance et mises à jour incluses", "Tarification selon la taille de l’école"].map((p) => <li key={p} className="flex items-center gap-2"><BadgeCheck className="size-4 text-emerald-600" /> {p}</li>)}</ul></div>
            <div className="flex flex-col gap-3 rounded-xl border bg-canvas-soft p-6"><BookOpenCheck className="size-6" /><h3 className="h3">Parlons de votre établissement</h3><p className="text-sm text-copy">Nous organisons une démonstration en visioconférence ou sur site à Lubumbashi.</p><Link href="/contact?sujet=SCOLIA%20Pro" className={buttonVariants({ variant: "dark", size: "lg" })}>Demander une démonstration <ArrowRight /></Link><Link href="/formations-en-ligne" className={buttonVariants({ variant: "ghost" })}>Voir les sessions de présentation</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
