import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CatalogueExplorer } from "@/components/catalogue-explorer";
import { offerings, sectionContent } from "@/lib/content";

type Section = keyof typeof sectionContent;
export function generateStaticParams() { return Object.keys(sectionContent).map(section=>({section})); }
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const config = sectionContent[section as Section];
  return { title: config?.title || "Page introuvable", description: config?.subtitle || "" };
}

export default async function SectionPage({params}: {params: Promise<{section:string}>}) {
  const { section } = await params;
  const config = sectionContent[section as Section];
  if (!config) notFound();
  const items = offerings.filter(item=>item.kind===config.kind);
  return <div className="inner-page">
    <section className="inner-hero"><div className="shell"><div className="eyebrow"><span className="eyebrow-dot"/>{config.eyebrow}</div><h1>{config.title}</h1><p>{config.subtitle}</p><div className="inner-hero-index">JP-SERVICES / {section.toUpperCase()}</div></div></section>
    <section className="shell catalogue-section"><div className="section-header compact"><div><div className="eyebrow eyebrow-dark">EXPLORER</div><h2>Découvrez notre <span>approche.</span></h2></div><p className="section-aside">Sélectionnez une catégorie ou recherchez un sujet qui vous intéresse.</p></div><CatalogueExplorer items={items}/></section>
    <section className="shell inner-bottom-cta"><div><h2>Une question sur votre projet ?</h2><p>Nous étudions chaque demande avec attention.</p></div><Link href="/contact" className="btn btn-primary">Parlons-en <ArrowUpRight size={17}/></Link></section>
  </div>;
}
