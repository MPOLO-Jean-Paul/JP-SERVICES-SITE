import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpenCheck, BookOpenText, Braces, Check, ChevronRight, Code2, Database, GraduationCap, Layers3, Lightbulb, MonitorSmartphone, MoveUpRight, PencilRuler, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { offerings } from "@/lib/content";
import { formationDetailHref } from "@/lib/formation-programs";

const worlds = [
  { number:"01", icon:GraduationCap, title:"Se former", label:"FORMATIONS", desc:"Renforcer ses compétences à travers des domaines concrets et des approches pratiques.",link:"/formations",action:"Découvrir les formations", className:"e-world-learning" },
  { number:"02", icon:Code2, title:"Créer une solution", label:"DÉVELOPPEMENT", desc:"Concevoir un site, une application ou une interface à la mesure de son activité.",link:"/services",action:"Explorer nos expertises", className:"e-world-building" },
  { number:"03", icon:Layers3, title:"Simplifier son travail", label:"LOGICIELS MÉTIERS", desc:"Mieux organiser ses opérations avec des outils adaptés à ses besoins.",link:"/logiciels",action:"Découvrir nos logiciels", className:"e-world-solutions" }
];

const programIcons = [Braces, Database, BookOpenText];
const programThemes = ["e-program-code", "e-program-data", "e-program-tools"];
const programs = offerings.filter(item => item.kind === "formation");

const method = [
  {n:"01",icon:Lightbulb,title:"Comprendre",desc:"Nous échangeons pour cerner votre situation, vos priorités et vos objectifs."},
  {n:"02",icon:PencilRuler,title:"Concevoir",desc:"Nous définissons une expérience claire, cohérente et adaptée au terrain."},
  {n:"03",icon:Workflow,title:"Construire",desc:"Nous développons avec rigueur, puis testons les parcours essentiels."},
  {n:"04",icon:Sparkles,title:"Faire évoluer",desc:"Nous améliorons la solution avec les usages et les retours concrets."}
];

function EditorialVisual() {
  return <div className="e-hero-visual" aria-label="Illustration originale des formations et solutions JP-SERVICES">
    <div className="e-visual-ambient" aria-hidden="true"/>
    <div className="e-visual-grid" aria-hidden="true"/>
    <div className="e-visual-orbit e-visual-orbit-one" aria-hidden="true"/>
    <div className="e-visual-orbit e-visual-orbit-two" aria-hidden="true"/>
    <div className="e-visual-main-card">
      <div className="e-visual-card-head"><div className="e-visual-mini-logo">JP<span>.</span></div><span>ESPACE CRÉATIF</span><span className="e-live-dot" aria-hidden="true"/></div>
      <div className="e-visual-card-body">
        <div className="e-visual-meta">VOTRE PROCHAINE ÉTAPE</div>
        <h2>Apprendre.<br/><em>Créer.</em><br/>Évoluer.</h2>
        <div className="e-visual-dashes"><span/><span/><span/></div>
        <div className="e-visual-mini-progress"><div className="e-visual-progress-text"><span>Un chemin, des possibilités</span><Sparkles size={14}/></div><div className="e-visual-progress-track"><i/></div></div>
      </div>
      <div className="e-visual-card-bottom"><span>JP-SERVICES / STUDIO</span><ArrowUpRight size={17}/></div>
    </div>
    <div className="e-visual-floating e-visual-floating-top"><div className="e-floating-icon"><BookOpenCheck size={21}/></div><div><span>APPRENDRE</span><strong>Compétences utiles</strong></div><Check size={15} className="e-floating-check"/></div>
    <div className="e-visual-floating e-visual-floating-bottom"><div className="e-floating-icon e-floating-laptop"><MonitorSmartphone size={22}/></div><div><span>CONSTRUIRE</span><strong>Solutions sur mesure</strong></div><ArrowUpRight size={15}/></div>
    <div className="e-visual-signature">01 — DESIGN AVEC INTENTION</div>
  </div>;
}

export default function Home() {
  return <>
    <section className="e-hero">
      <div className="shell e-hero-layout">
        <div className="e-hero-content">
          <div className="e-hero-chip"><span className="e-chip-spark">✳</span> STUDIO & ACADÉMIE NUMÉRIQUE <span className="e-chip-divider"/> LUBUMBASHI</div>
          <h1>Des idées fortes.<br/><span>Des compétences</span><br/>pour aller plus loin<span className="e-title-dot">.</span></h1>
          <p>Apprenez, innovez et donnez vie à vos ambitions avec des formations pratiques et des solutions numériques pensées pour le monde réel.</p>
          <div className="e-hero-actions"><Link className="e-button e-button-primary" href="/formations">Explorer les formations <ArrowUpRight size={18}/></Link><Link href="/services" className="e-button e-button-minimal">Nos expertises <ArrowRight size={18}/></Link></div>
          <div className="e-hero-caption"><span className="e-caption-rule"/><span>APPRENDRE AVEC MÉTHODE · CONSTRUIRE AVEC EXIGENCE</span></div>
        </div>
        <EditorialVisual />
      </div>
      <div className="shell e-hero-foot"><span>DÉVELOPPEMENT WEB</span><i/><span>APPLICATIONS MÉTIERS</span><i/><span>FORMATION</span><i/><span>DESIGN & INNOVATION</span><ArrowDown size={17} aria-hidden="true"/></div>
    </section>

    <section className="e-section e-discover shell">
      <div className="e-section-heading">
        <div><span className="e-label"><span/> CE QUE NOUS VOUS PROPOSONS</span><h2>Une ambition.<br/><em>Plusieurs façons d'avancer.</em></h2></div>
        <p>Parce que chaque projet commence différemment, nous réunissons les compétences, les outils et l'accompagnement au même endroit.</p>
      </div>
      <div className="e-world-grid">{worlds.map(item => <Link href={item.link} className={"e-world-card "+item.className} key={item.number}>
        <div className="e-world-top"><span>{item.label}</span><span>{item.number} / 03</span></div>
        <div className="e-world-icon"><item.icon size={29} strokeWidth={1.7}/></div>
        <h3>{item.title}</h3><p>{item.desc}</p>
        <div className="e-world-bottom"><span>{item.action}</span><span className="e-circle-arrow"><MoveUpRight size={20}/></span></div>
      </Link>)}</div>
    </section>

    <section className="e-section e-courses">
      <div className="shell">
        <div className="e-section-heading">
          <div><span className="e-label"><span/> EXPLORER LES FORMATIONS</span><h2>Apprendre aujourd'hui.<br/><em>Faire la différence demain.</em></h2></div>
          <div className="e-heading-aside"><p>Découvrez les domaines que nous souhaitons vous faire explorer, avec une approche orientée pratique.</p><Link className="e-text-link" href="/formations">Tout le catalogue <ArrowUpRight size={17}/></Link></div>
        </div>
        <div className="e-program-grid">{programs.map((item,index) => {
          const Icon = programIcons[index] ?? BookOpenText;
          return <Link href={formationDetailHref(item) || "/formations"} className="e-program-card" key={item.id}>
            <div className={"e-program-art "+programThemes[index%programThemes.length]}><span className="e-program-art-index">JP / {String(index+1).padStart(2,"0")}</span><span className="e-program-art-outline" aria-hidden="true"/><span className="e-program-art-icon"><Icon size={36} strokeWidth={1.35}/></span><span className="e-program-art-caption">FORMATIONS · JP-SERVICES</span></div>
            <div className="e-program-content"><span className="e-program-category">{item.category}</span><h3>{item.title}</h3><p>{item.description}</p><div className="e-program-bottom"><span>{item.status || "Modalités sur demande"}</span><ArrowUpRight size={19}/></div></div>
          </Link>;
        })}</div>
        <p className="e-courses-notice">Ces domaines sont présentés à titre indicatif. Programmes, disponibilités et inscriptions à confirmer directement auprès de JP-SERVICES.</p>
      </div>
    </section>

    <section className="e-section e-feature-section shell">
      <div className="e-feature-copy"><span className="e-label"><span/> NOTRE PRODUIT À LA UNE</span><div className="e-feature-chip">LOGICIEL EN DÉVELOPPEMENT</div>
        <h2>La gestion scolaire,<br/><em>repensée pour vous.</em></h2>
        <p>SCOLIA Pro est notre projet de solution pour simplifier les opérations scolaires et rendre les processus plus clairs pour les établissements et leurs équipes.</p>
        <div className="e-feature-checks"><span><Check size={16}/> Gestion structurée des informations</span><span><Check size={16}/> Interfaces adaptées aux usages</span><span><Check size={16}/> Évolution progressive du produit</span></div>
        <Link className="e-button e-button-primary" href="/logiciels">Découvrir SCOLIA Pro <ArrowUpRight size={17}/></Link>
      </div>
      <div className="e-product-stage" aria-label="Illustration conceptuelle originale de l'interface SCOLIA Pro">
        <div className="e-product-halo" aria-hidden="true"/>
        <div className="e-product-window">
          <div className="e-product-window-head"><span className="e-product-mark">S</span><strong>SCOLIA <em>Pro</em></strong><span className="e-product-window-status">APERÇU CONCEPTUEL</span></div>
          <div className="e-product-window-body"><div className="e-product-sidebar"><span/><span/><span/><span/><span/><span/></div><div className="e-product-main"><div className="e-product-greeting">Bienvenue dans votre espace</div><div className="e-product-description">Un tableau de bord clair pour votre quotidien.</div><div className="e-product-tiles"><div><span/><i/></div><div><span/><i/></div><div><span/><i/></div></div><div className="e-product-list"><div/><div/><div/><div/></div></div></div>
        </div>
        <div className="e-product-float"><ShieldCheck size={19}/><span>DESIGN PENSÉ POUR LE TERRAIN</span></div>
      </div>
    </section>

    <section className="e-section e-method">
      <div className="shell">
        <div className="e-section-heading"><div><span className="e-label"><span/> NOTRE MÉTHODE</span><h2>Une idée claire.<br/><em>Une exécution soignée.</em></h2></div><p>Pas de complexité inutile : une démarche structurée, de la première conversation jusqu'aux améliorations.</p></div>
        <div className="e-method-grid">{method.map(item=><div className="e-method-step" key={item.n}><span className="e-method-number">{item.n} / 04</span><div className="e-method-icon"><item.icon size={24}/></div><h3>{item.title}</h3><p>{item.desc}</p></div>)}</div>
      </div>
    </section>

    <section className="e-final-cta"><div className="shell e-final-inner"><div><span className="e-label"><span/> ET SI ON ALLAIT PLUS LOIN ?</span><h2>La prochaine étape<br/><em>commence ici.</em></h2><p>Une idée à concrétiser, un logiciel à imaginer ou une compétence à développer ? Construisons votre prochaine étape.</p><Link className="e-button e-button-light" href="/contact">Parlons de votre projet <ArrowUpRight size={18}/></Link></div><div className="e-final-decoration" aria-hidden="true"><div className="e-final-decoration-circle"/><span>JP<span>.</span></span></div></div></section>
  </>;
}
