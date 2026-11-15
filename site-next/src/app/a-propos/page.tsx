import Link from "next/link";
import { ArrowUpRight, Compass, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
export const metadata: Metadata = {title:"À propos",description:"Notre vision du design et de la technologie utile, depuis Lubumbashi."};
export default function AboutPage() {
  return <>
    <section className="inner-hero about-hero"><div className="shell"><div className="eyebrow"><span className="eyebrow-dot"/> NOTRE HISTOIRE ET NOTRE VISION</div><h1>La technologie<br/>doit <em>simplifier.</em></h1><p>Chez JP-SERVICES, nous faisons le choix de solutions compréhensibles, fiables et pensées autour des personnes qui les utilisent.</p></div></section>
    <section className="section shell about-section"><div className="section-header"><div><div className="eyebrow eyebrow-dark">CE QUI NOUS GUIDE</div><h2>Une approche humaine.<br/><span>Une exigence technique.</span></h2></div></div><div className="expertise-grid values-grid">{[
      {Icon:Compass,title:"La clarté",desc:"Comprendre avant de construire. Réduire la complexité sans sacrifier la profondeur."},
      {Icon:Sparkles,title:"Le soin du détail",desc:"Faire de la cohérence visuelle et de l'ergonomie une priorité."},
      {Icon:ShieldCheck,title:"La fiabilité",desc:"Privilégier la sécurité, la maintenabilité et des solutions pérennes."},
      {Icon:HeartHandshake,title:"La proximité",desc:"Écouter le terrain et construire avec les utilisateurs."}
    ].map(({Icon,title,desc})=><div className="expertise-card" key={title}><Icon size={28} strokeWidth={1.6}/><h3>{title}</h3><p>{desc}</p></div>)}</div></section>
    <section className="cta-section"><div className="shell cta-inner"><div className="eyebrow">COLLABORONS</div><h2>Parlons de ce que nous<br/><span>pourrions créer.</span></h2><Link href="/contact" className="btn btn-light">Prendre contact <ArrowUpRight size={17}/></Link></div></section>
  </>;
}
