import Link from "next/link";
import { ArrowUpRight, Compass, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "À propos", description: "JP-SERVICES : notre approche du design, de la formation et de la technologie utile à Lubumbashi." };

const values = [
  {Icon:Compass,number:"01",title:"Clarté",desc:"Comprendre le problème avant de chercher la solution. Créer des parcours que chacun peut saisir."},
  {Icon:Sparkles,number:"02",title:"Exigence",desc:"Soigner chaque détail, de la première idée jusqu'à la dernière interaction."},
  {Icon:ShieldCheck,number:"03",title:"Fiabilité",desc:"Concevoir des outils durables et accorder une place essentielle à la sécurité."},
  {Icon:HeartHandshake,number:"04",title:"Proximité",desc:"Écouter les besoins sur le terrain et garder l'humain au cœur des décisions."}
];

export default function AboutPage() {
  return <>
    <section className="editorial-page-hero editorial-about-hero"><div className="shell editorial-page-hero-inner"><div className="editorial-breadcrumb"><Link href="/">ACCUEIL</Link><span>/</span>À PROPOS</div><div className="editorial-page-label"><span/> L'ESPRIT JP-SERVICES</div><h1>La technologie est meilleure<br/>quand elle <em>simplifie.</em></h1><p>Nous cultivons une conviction simple : les outils numériques les plus utiles naissent de l'écoute, de la clarté et d'un travail bien fait.</p></div><div className="editorial-hero-art" aria-hidden="true"><span className="editorial-hero-art-ring"/><span className="editorial-hero-art-plate"><Sparkles size={59}/></span></div></section>
    <section className="shell editorial-story"><div><span className="e-label"><span/> QUI SOMMES-NOUS ?</span><h2>Des idées au service<br/><em>du progrès.</em></h2></div><div><p>JP-SERVICES — Jeunesse et Progrès Services — est une initiative basée à Lubumbashi, qui réunit accompagnement, formation et conception de solutions numériques.</p><p>Notre approche relie la compréhension des besoins à l'exigence technique, avec la volonté de proposer des expériences simples et adaptées aux réalités de chaque organisation.</p><Link className="e-text-link" href="/services">Découvrir nos expertises <ArrowUpRight size={18}/></Link></div></section>
    <section className="e-section editorial-values"><div className="shell"><div className="e-section-heading"><div><span className="e-label"><span/> CE QUI NOUS GUIDE</span><h2>Quatre valeurs.<br/><em>Une même direction.</em></h2></div></div><div className="e-method-grid">{values.map(item=><div className="e-method-step" key={item.number}><span className="e-method-number">{item.number} / 04</span><div className="e-method-icon"><item.Icon size={24}/></div><h3>{item.title}</h3><p>{item.desc}</p></div>)}</div></div></section>
    <section className="shell editorial-page-cta"><div><span>COLLABORONS</span><h2>Créons quelque chose d'utile.</h2><p>Vous avez une idée ? Nous pouvons commencer par en discuter.</p></div><Link href="/contact" className="e-button e-button-primary">Nous contacter <ArrowUpRight size={18}/></Link></section>
  </>;
}
