import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/page-hero";
import { PartnershipPreview } from "@/components/visuals/mockups";
import { ArrowDown, ExternalLink, GraduationCap, HandHeart, Handshake, Microchip, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { PARTNERSHIP_TYPES } from "@/lib/constants";
import { listPartenaires } from "@/server/services/content";
import { getSetting } from "@/server/services/settings";
import { uploadedImage } from "@/lib/utils";
import { AppTile } from "@/components/visuals/cover";
import { pageMetadata } from "@/lib/seo";
import { PartnershipForm } from "./partnership-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({ title: "Partenariat", description: "Associations, entreprises et institutions : construisons ensemble des solutions utiles autour de la formation et du numérique avec JP-Services.", path: "/partenariat" });
const ICONS = { education: GraduationCap, technologie: Microchip, sponsoring: HandHeart, communautaire: Users } as const;

export default async function PartenariatPage() {
  const [partenaires, intro] = await Promise.all([listPartenaires(true).catch(() => []), getSetting("partenariat_intro")]);
  return (
    <>
      <PageHero
        illustration="/illustrations/a-propos-equipe.svg"
        tone="amber"
        eyebrow="Partenariats"
        title="Construisons ensemble des compétences utiles."
        text={intro}
        actions={
          <>
            <a href="#proposer" className={buttonVariants({ variant: "dark", size: "lg" })}>Proposer un partenariat <ArrowDown /></a>
            <a href="#partenaires" className={buttonVariants({ variant: "outline", size: "lg" })}>Nos partenaires</a>
          </>
        }
        aside={<PartnershipPreview />}
      />

      <section className="section">
        <div className="shell">
          <SectionHeading kicker="Formes de collaboration" title="Quatre manières de travailler avec JP-Services." text="Choisissez le cadre qui correspond à votre structure ; chaque partenariat est ensuite personnalisé." />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border bg-line sm:grid-cols-2 lg:grid-cols-4">
            {PARTNERSHIP_TYPES.map((t, i) => { const Icon = ICONS[t.slug]; return (
              <article key={t.slug} className="bg-panel p-7"><div className="flex items-center justify-between"><Icon className="size-5" /><span className="font-mono text-xs text-muted">0{i + 1}</span></div><h3 className="h3 mt-6">{t.label}</h3><p className="mt-2 text-sm text-copy">{t.text}</p></article>
            ); })}
          </div>
        </div>
      </section>

      <section className="section border-y bg-canvas-soft" id="partenaires">
        <div className="shell">
          <SectionHeading kicker="Ils nous accompagnent" title="Nos partenaires." text="Des organisations qui soutiennent la formation, les projets et la communauté JP-Services." />
          {partenaires.length ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {partenaires.map((p) => (
                <article key={p.id} className="card card-hover reveal flex flex-col p-7">
                  <div className="flex items-center gap-4">
                    {uploadedImage(p.logo) ? <span className="relative inline-flex size-14 shrink-0 overflow-hidden rounded-xl border bg-white"><Image src={uploadedImage(p.logo)!} alt="" fill sizes="56px" className="object-contain p-1.5" /></span> : <AppTile name={p.nom} className="size-14" />}
                    <div className="min-w-0"><h3 className="h3 truncate">{p.nom}</h3>{p.typePartenariat ? <span className="text-[11px] text-muted font-medium">{p.typePartenariat}</span> : null}</div>
                  </div>
                  {p.description ? <p className="mt-4 flex-1 text-sm text-copy">{p.description}</p> : null}
                  {p.siteWeb ? <a href={p.siteWeb} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Visiter le site <ExternalLink className="size-3.5" /></a> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="card bg-dots reveal mx-auto mt-12 max-w-xl p-10 text-center"><span className="icon-box mx-auto"><Handshake /></span><h3 className="h3 mt-4">Les premiers partenaires seront bientôt présentés</h3><p className="mt-2 text-copy">Votre organisation souhaite apparaître ici ? Envoyez-nous une demande ci-dessous.</p></div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeading kicker="Comment ça se passe" title="Un partenariat en trois étapes." />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[["Vous proposez", "Remplissez le formulaire ci-dessous avec votre organisation et votre idée de collaboration."], ["Nous échangeons", "Notre équipe étudie la demande et vous recontacte pour cadrer ensemble les objectifs."], ["Nous lançons", "Le partenariat est formalisé, suivi dans le temps et présenté sur cette page."]].map(([t, d], i) => (
              <li key={t} className="reveal relative rounded-xl border p-7 pt-9"><span className="absolute -top-3.5 left-6 inline-flex size-7 items-center justify-center rounded-full border bg-panel font-mono text-xs">{i + 1}</span><h3 className="h3">{t}</h3><p className="mt-2 text-copy">{d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section pt-0" id="proposer">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="reveal"><span className="eyebrow">Proposer un partenariat</span><h2 className="h2 mt-2">Parlez-nous de votre organisation.</h2><p className="mt-3 text-copy">Décrivez votre structure et la forme de collaboration envisagée. Votre demande est transmise directement à l’équipe JP-Services.</p></div>
          <div className="card jp-public-form-panel reveal min-w-0 p-4 sm:p-8"><PartnershipForm types={PARTNERSHIP_TYPES.map((t) => t.label)} /></div>
        </div>
      </section>
    </>
  );
}
