import Link from "next/link";
import { ArrowRight, ArrowUpRight, Blocks, Code2, DatabaseZap, GraduationCap, MoveUpRight, ShieldCheck, Smartphone } from "lucide-react";
import { offerings } from "@/lib/content";

const strengths = [
  { icon: Code2, number: "01", title: "Développement sur mesure", desc: "Des interfaces précises et des architectures qui tiennent dans la durée." },
  { icon: Smartphone, number: "02", title: "Produits multiplateformes", desc: "Une même exigence d'ergonomie sur le web, mobile et desktop." },
  { icon: DatabaseZap, number: "03", title: "Données & intégrations", desc: "Des informations structurées, accessibles et protégées." },
  { icon: GraduationCap, number: "04", title: "Formation & accompagnement", desc: "Transmettre les compétences nécessaires pour avancer en autonomie." }
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-content">
            <div className="eyebrow"><span className="eyebrow-dot"/> STUDIO NUMÉRIQUE · LUBUMBASHI</div>
            <h1>Des idées fortes.<br/><span>Des produits</span><br/>remarquables<span className="hero-period">.</span></h1>
            <p className="hero-copy">Nous allions stratégie, design et technologie pour créer des expériences numériques efficaces, intuitives et durables.</p>
            <div className="hero-actions">
              <Link href="/contact" className="btn btn-primary">Démarrer un projet <ArrowUpRight size={18}/></Link>
              <Link href="/services" className="btn btn-text">Découvrir nos expertises <ArrowRight size={17}/></Link>
            </div>
            <div className="hero-footnote"><span className="footnote-line"/> CONCEPTION EXIGEANTE · IMPACT CONCRET</div>
          </div>
          <div className="hero-showcase" aria-label="Aperçu de notre méthode de conception">
            <div className="showcase-top"><span className="window-dots"><i/><i/><i/></span><span>JP / WORKSPACE</span><span>● LIVE CONCEPT</span></div>
            <div className="showcase-body">
              <div className="showcase-index">01 / 03 — DE L'IDÉE À L'IMPACT</div>
              <h2>Créer avec<br/><em>intention.</em></h2>
              <p>Chaque détail compte. Chaque interaction doit être évidente.</p>
              <div className="showcase-preview">
                <div className="preview-title"><span className="preview-icon"><Blocks size={17}/></span><span>Notre méthode</span><span className="preview-signal">Active</span></div>
                <div className="preview-line"><span><b>01</b> Comprendre le besoin</span><i className="step-complete">Validé</i></div>
                <div className="preview-line"><span><b>02</b> Concevoir l'expérience</span><i className="step-complete">Validé</i></div>
                <div className="preview-line"><span><b>03</b> Construire & améliorer</span><i className="step-current">En continu</i></div>
              </div>
            </div>
            <div className="showcase-footer"><span>DESIGN · TECH · PRODUIT</span><span>JP-SERVICES ©</span></div>
          </div>
        </div>
        <div className="shell hero-bottom"><div className="hero-bottom-rule"/><span>CONSEIL</span><span>DESIGN</span><span>DÉVELOPPEMENT</span><span>ACCOMPAGNEMENT</span></div>
      </section>

      <section className="section section-expertise shell">
        <div className="section-header"><div><div className="eyebrow eyebrow-dark">CE QUE NOUS FAISONS</div><h2>Des expertises complémentaires.<br/><span>Une seule vision.</span></h2></div><Link className="underlined-link" href="/services">Voir toutes nos expertises <ArrowUpRight size={18}/></Link></div>
        <div className="expertise-grid">{strengths.map(item => <Link href="/services" className="expertise-card" key={item.number}><div className="card-upper"><item.icon size={27} strokeWidth={1.6}/><span>{item.number}</span></div><h3>{item.title}</h3><p>{item.desc}</p><MoveUpRight className="card-arrow" size={21}/></Link>)}</div>
      </section>

      <section className="section featured-section">
        <div className="shell featured-grid">
          <div className="featured-intro"><div className="eyebrow eyebrow-dark">PRODUITS & PROJETS</div><h2>Des solutions<br/>qui répondent<br/><span>au réel.</span></h2><p>Nous concevons des outils à partir des besoins du terrain, avec une attention particulière à la simplicité d'usage.</p><Link href="/projets" className="btn btn-outline">Découvrir nos projets <ArrowUpRight size={17}/></Link></div>
          <div className="feature-product">
            <div className="feature-meta"><span>PRODUIT À LA UNE</span><span>01 / 01</span></div>
            <div className="product-art" aria-hidden="true"><div className="product-app"><div className="product-app-top"><span className="mini-symbol">JP</span><span>SCOLIA PRO</span><span className="mock-pills"><i/><i/></span></div><div className="product-app-body"><div className="mock-sidebar"><i/><i/><i/><i/></div><div className="mock-workspace"><span className="mock-title-line"/><span className="mock-desc-line"/><div className="mock-stat-grid"><span/><span/><span/></div><div className="mock-row"/><div className="mock-row"/><div className="mock-row"/></div></div></div></div>
            <div className="product-desc"><div><span className="mini-label">GESTION SCOLAIRE · EN DÉVELOPPEMENT</span><h3>SCOLIA Pro</h3><p>Une expérience de gestion scolaire pensée pour les établissements et leurs équipes.</p></div><Link href="/logiciels" aria-label="En savoir plus sur SCOLIA Pro" className="round-arrow"><ArrowUpRight size={22}/></Link></div>
          </div>
        </div>
      </section>

      <section className="section shell process-section">
        <div className="section-header"><div><div className="eyebrow eyebrow-dark">NOTRE APPROCHE</div><h2>La rigueur de la méthode.<br/><span>La liberté de créer.</span></h2></div><p className="section-aside">Des décisions claires, une exécution structurée et une attention constante à l'expérience.</p></div>
        <div className="process-list">{[
          {num:"01",name:"Comprendre",desc:"Écouter, observer et traduire les objectifs en besoins vérifiables."},
          {num:"02",name:"Dessiner",desc:"Prototyper des interfaces cohérentes avant d'écrire la solution."},
          {num:"03",name:"Construire",desc:"Développer, tester et sécuriser chaque composant de l'application."},
          {num:"04",name:"Faire évoluer",desc:"Améliorer le produit avec les retours du terrain et les usages réels."}
        ].map(item=><div className="process-row" key={item.num}><span>{item.num} /</span><h3>{item.name}</h3><p>{item.desc}</p><ArrowUpRight size={19}/></div>)}</div>
      </section>

      <section className="cta-section"><div className="shell cta-inner"><div className="eyebrow">ET MAINTENANT ?</div><h2>Votre prochaine idée mérite<br/><span>un vrai partenaire.</span></h2><p>Parlons de votre projet, de vos enjeux et de ce que nous pouvons construire ensemble.</p><Link className="btn btn-light" href="/contact">Échanger avec nous <ArrowUpRight size={18}/></Link><div className="cta-decor" aria-hidden="true">JP</div></div></section>
    </>
  );
}
