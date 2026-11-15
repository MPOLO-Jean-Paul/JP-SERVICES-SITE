import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, BookOpenCheck, Code2, Layers3, Lightbulb, Sparkles } from "lucide-react";
import Link from "next/link";
import { CatalogueExplorer } from "@/components/catalogue-explorer";
import { offerings, sectionContent } from "@/lib/content";

type Section = keyof typeof sectionContent;
export function generateStaticParams() { return Object.keys(sectionContent).map(section=>({section})); }
export const dynamicParams = false;

const sectionIcons = {
  services: Code2, formations: BookOpenCheck, logiciels: Layers3,
  projets: Lightbulb, actualites: Sparkles
} as const;
const subheadings: Record<Section,string> = {
  services:"Des expertises adaptées à vos besoins",
  formations:"Des compétences à explorer",
  logiciels:"Des solutions qui simplifient",
  projets:"Des idées en construction",
  actualites:"Les réflexions du studio"
};

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const config = sectionContent[section as Section];
  return { title: config?.title || "Page introuvable", description: config?.subtitle || "" };
}

export default async function SectionPage({params}: {params: Promise<{section:string}>}) {
  const { section } = await params;
  const config = sectionContent[section as Section];
  if (!config) notFound();
  const Icon = sectionIcons[section as Section];
  const items = offerings.filter(item=>item.kind===config.kind);
  return <div className="editorial-inner-page">
    <section className="editorial-page-hero"><div className="shell editorial-page-hero-inner">
      <div className="editorial-breadcrumb"><Link href="/">ACCUEIL</Link><span>/</span>{section.toUpperCase()}</div>
      <div className="editorial-page-label"><span/>{config.eyebrow}</div>
      <h1>{config.title}</h1><p>{config.subtitle}</p>
      <div className="editorial-page-hero-bottom"><span>JP-SERVICES · {section.toUpperCase()}</span><span>EXPLORER <ArrowRight size={15}/></span></div>
    </div><div className="editorial-hero-art" aria-hidden="true"><span className="editorial-hero-art-ring"/><span className="editorial-hero-art-plate"><Icon size={58} strokeWidth={1.15}/></span><span className="editorial-hero-art-small">JP / {section.toUpperCase()}</span></div></section>
    <section className="shell editorial-catalogue">
      <div className="editorial-catalogue-heading"><div><span className="e-label"><span/> NOTRE SÉLECTION</span><h2>{subheadings[section as Section]}<span>.</span></h2></div><p>Choisissez une catégorie ou recherchez un sujet. Les contenus publiés apparaissent dès leur validation.</p></div>
      <CatalogueExplorer items={items} kind={config.kind}/>
    </section>
    {section==="formations" && <section className="shell editorial-guidance">
      <div><span className="e-label"><span/> LA MÉTHODE JP-SERVICES</span><h2>Apprendre, pratiquer,<br/><em>puis mettre en œuvre.</em></h2><p>Nous privilégions une progression claire : comprendre les bases, s'exercer sur des cas concrets et appliquer les acquis.</p></div>
      <div className="editorial-guidance-steps">
        <div><span>01</span><div><strong>Découvrir</strong><p>Identifier les notions et les outils indispensables.</p></div></div>
        <div><span>02</span><div><strong>Mettre en pratique</strong><p>Réaliser des exercices et des travaux guidés.</p></div></div>
        <div><span>03</span><div><strong>Approfondir</strong><p>Faire le lien entre apprentissage et besoins réels.</p></div></div>
      </div>
    </section>}
    <section className="shell editorial-page-cta"><div><span>UN PROJET OU UNE QUESTION ?</span><h2>Parlons de votre prochaine étape.</h2><p>Contactez JP-SERVICES pour échanger sur vos besoins et les modalités possibles.</p></div><Link href="/contact" className="e-button e-button-primary">Nous contacter <ArrowUpRight size={18}/></Link></section>
  </div>;
}
