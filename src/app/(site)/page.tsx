import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronRight, Clock3, ExternalLink, GraduationCap, MapPin } from "lucide-react";
import { getCurrentUser } from "@/server/auth/session";
import { getHomeStats, listActualites } from "@/server/services/content";
import { listUpcomingFormations } from "@/server/services/formations";
import { excerpt, formatDate, formatPrice } from "@/lib/utils";
import { SITE_URL, jsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const areas = [
  {
    number: "01", name: "Formations numériques", label: "APPRENDRE",
    description: "Des contenus organisés par compétences, des exercices et un parcours à construire étape par étape.",
    href: "/formations",
  },
  {
    number: "02", name: "Logiciels & outils", label: "UTILISER",
    description: "Retrouvez les ressources numériques publiées et les outils utiles à votre activité.",
    href: "/logiciels",
  },
  {
    number: "03", name: "Solutions & projets", label: "RÉALISER",
    description: "Des solutions pensées pour les besoins des organisations, de l'idée à sa mise en œuvre.",
    href: "/projets",
  },
];

const method = [
  { number: "01", name: "Comprendre", description: "Partir d'un besoin précis. Définir ce que vous voulez apprendre, améliorer ou construire." },
  { number: "02", name: "Pratiquer", description: "Avancer avec une démarche concrète, des exemples utiles et des étapes compréhensibles." },
  { number: "03", name: "Appliquer", description: "Transformer les acquis en méthodes, en outils et en réalisations qui servent vraiment." },
];

export default async function HomePage() {
  const [formations, actualites, user, stats] = await Promise.all([
    listUpcomingFormations(3).catch(() => []),
    listActualites(3).catch(() => []),
    getCurrentUser().catch(() => null),
    getHomeStats().catch(() => null),
  ]);
  const preview = process.env.JP_PREVIEW_MODE === "1";
  const memberLink = user ? "/profil" : preview ? "/contact" : "/inscription";
  const memberLabel = user ? "Accéder à mon espace" : preview ? "Parler de votre besoin" : "Rejoindre JP-Services";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({
        "@type": "EducationalOrganization",
        name: "JP-Services",
        url: SITE_URL,
        address: { "@type": "PostalAddress", addressLocality: "Lubumbashi", addressCountry: "CD" },
      })} />

      <section className="jp-hero" aria-labelledby="home-title">
        <div className="shell jp-hero-layout">
          <div className="jp-hero-main">
            <p className="jp-overline"><span className="jp-overline-mark" /> JP-SERVICES <span className="jp-overline-separator">/</span> LUBUMBASHI · RDC</p>
            <h1 id="home-title">Des compétences qui deviennent <span>des réalisations.</span></h1>
            <p className="jp-hero-lead">Apprendre, créer et faire avancer les projets numériques. Des formations pratiques, des ressources fiables et un accompagnement ancré dans les besoins réels.</p>
            <div className="jp-hero-actions">
              <Link href="/formations" className="jp-action jp-action-primary">Explorer les formations <ArrowUpRight size={18} aria-hidden="true" /></Link>
              <Link href={memberLink} className="jp-action jp-action-text">{memberLabel} <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
            <p className="jp-hero-support"><MapPin size={15} aria-hidden="true"/> À Lubumbashi et accessible en ligne</p>
          </div>
          <aside className="jp-hero-guide" aria-labelledby="home-guide-title">
            <p id="home-guide-title" className="jp-guide-label">Votre point de départ</p>
            <Link href="/formations" className="jp-guide-row">
              <span>01</span><strong>Développer une compétence</strong><ArrowUpRight size={19} aria-hidden="true"/>
            </Link>
            <Link href="/logiciels" className="jp-guide-row">
              <span>02</span><strong>Découvrir un outil</strong><ArrowUpRight size={19} aria-hidden="true"/>
            </Link>
            <Link href="/scolia" className="jp-guide-row">
              <span>03</span><strong>Explorer SCOLIA Pro</strong><ArrowUpRight size={19} aria-hidden="true"/>
            </Link>
            <Link href="/contact" className="jp-guide-row">
              <span>04</span><strong>Parler d'un projet</strong><ArrowUpRight size={19} aria-hidden="true"/>
            </Link>
            <p className="jp-guide-footnote">Des parcours utiles, sans complexité inutile.</p>
          </aside>
        </div>
        <div className="shell jp-hero-signature" aria-hidden="true"><span>FORMATION</span><span>TECHNOLOGIE</span><span>SOLUTIONS MÉTIERS</span></div>
      </section>

      <section className="jp-section jp-areas" aria-labelledby="areas-title">
        <div className="shell jp-areas-layout">
          <div className="jp-sticky-intro">
            <p className="jp-overline">01 / NOS DOMAINES</p>
            <h2 id="areas-title">Des solutions adaptées à <em>ce que vous faites.</em></h2>
            <p>Chaque besoin a son propre parcours. Choisissez une direction et accédez directement aux contenus correspondants.</p>
          </div>
          <div className="jp-areas-list">
            {areas.map(area => <Link href={area.href} key={area.number} className="jp-area-link">
              <span className="jp-area-number">{area.number}</span>
              <div><span className="jp-area-kicker">{area.label}</span><h3>{area.name}</h3><p>{area.description}</p></div>
              <ArrowUpRight className="jp-area-arrow" size={21} aria-hidden="true"/>
            </Link>)}
          </div>
        </div>
      </section>

      <section className="jp-section jp-learning" aria-labelledby="learning-title">
        <div className="shell">
          <div className="jp-section-heading">
            <div><p className="jp-overline">02 / SE FORMER</p><h2 id="learning-title">Les prochaines <em>occasions d'apprendre.</em></h2></div>
            <Link href="/formations" className="jp-inline-link">Consulter le catalogue <ArrowUpRight size={18} aria-hidden="true"/></Link>
          </div>
          {formations.length ? <div className="jp-course-list">
            {formations.map((formation, index) => <Link href={"/formations/" + formation.id} className="jp-course-row" key={formation.id}>
              <span className="jp-course-index">{String(index+1).padStart(2,"0")}</span>
              <div className="jp-course-primary">
                <span className="jp-course-domain">{formation.domain.label}</span>
                <h3>{formation.titre}</h3>
                <p>{excerpt(formation.description, 138)}</p>
              </div>
              <div className="jp-course-detail">
                {formation.duree ? <span><Clock3 size={14} aria-hidden="true"/>{formation.duree}</span> : null}
                {formation.dateDebut ? <span><CalendarDays size={14} aria-hidden="true"/>{formatDate(formation.dateDebut, "fr", { day:"numeric", month:"short", year:"numeric" })}</span> : null}
                <strong>{formatPrice(Number(formation.prix))}</strong>
              </div>
              <ArrowUpRight className="jp-course-arrow" size={21} aria-hidden="true"/>
            </Link>)}
          </div> : <div className="jp-learning-empty">
            <span className="jp-empty-symbol"><GraduationCap size={31} strokeWidth={1.25} aria-hidden="true"/></span>
            <div><h3>Le programme se construit.</h3><p>Aucune session annoncée pour le moment. Parcourez les domaines ou contactez-nous pour présenter vos objectifs.</p></div>
            <Link href="/formations" className="jp-inline-link">Voir les domaines <ArrowRight size={18}/></Link>
          </div>}
        </div>
      </section>

      <section className="jp-section jp-method" aria-labelledby="method-title">
        <div className="shell">
          <div className="jp-section-heading">
            <div><p className="jp-overline">03 / NOTRE APPROCHE</p><h2 id="method-title">Moins de théorie isolée. <em>Plus d'application.</em></h2></div>
            <p className="jp-section-aside">Une méthode simple pour garder le cap : comprendre un problème, travailler concrètement et mesurer la progression.</p>
          </div>
          <div className="jp-method-grid">{method.map(step=><div key={step.number} className="jp-method-step">
            <span>{step.number}</span><div className="jp-method-rule"/><h3>{step.name}</h3><p>{step.description}</p>
          </div>)}</div>
        </div>
      </section>

      <section className="jp-scolia-section" aria-labelledby="scolia-title">
        <div className="shell jp-scolia-grid">
          <div className="jp-scolia-main">
            <p className="jp-overline">04 / LOGICIEL MÉTIER <span className="jp-scolia-status">EN DÉVELOPPEMENT</span></p>
            <h2 id="scolia-title">SCOLIA Pro.<br/><em>L'administration scolaire, simplifiée.</em></h2>
            <p>Un projet logiciel conçu autour des opérations quotidiennes des établissements : suivi des apprenants, encaissements, organisation de la scolarité et pilotage des informations.</p>
            <div className="jp-scolia-actions">
              <Link href="/scolia" className="jp-action jp-action-light">Découvrir le projet <ArrowUpRight size={18}/></Link>
              <Link href="/contact?sujet=SCOLIA%20Pro" className="jp-action jp-action-light-text">Poser une question <ArrowRight size={18}/></Link>
            </div>
          </div>
          <div className="jp-scolia-index" aria-label="Domaines couverts par le projet">
            <div className="jp-scolia-index-top"><span>SCOLIA / DOMAINES</span><span>VERSION EN CONSTRUCTION</span></div>
            {["Gestion des apprenants","Finances & encaissements","Scolarité & évaluations","Rapports & administration"].map((name,i)=><div key={name} className="jp-scolia-index-row">
              <span>{String(i+1).padStart(2,"0")}</span><strong>{name}</strong><Check size={17} aria-hidden="true"/>
            </div>)}
            <div className="jp-scolia-index-bottom"><span>UN ÉTABLISSEMENT, UNE VUE D'ENSEMBLE</span><span>JP—SERVICES</span></div>
          </div>
        </div>
      </section>

      {actualites.length > 0 ? <section className="jp-section jp-news" aria-labelledby="news-title">
        <div className="shell">
          <div className="jp-section-heading"><div><p className="jp-overline">05 / JOURNAL</p><h2 id="news-title">Les dernières <em>publications.</em></h2></div>
            <Link href="/actualites" className="jp-inline-link">Toutes les actualités <ArrowUpRight size={18}/></Link>
          </div>
          <div className="jp-news-list">{actualites.map(a=><Link key={a.id} href={"/actualites/"+a.id} className="jp-news-row">
            <span className="jp-news-date">{formatDate(a.datePublication,"fr",{day:"numeric",month:"short",year:"numeric"})}</span>
            <h3>{a.titre}</h3><ChevronRight size={20} aria-hidden="true"/>
          </Link>)}</div>
        </div>
      </section> : null}

      <section className="jp-finale" aria-labelledby="finale-title">
        <div className="shell jp-finale-layout">
          <div><p className="jp-overline">PARLONS DE VOTRE PROCHAINE ÉTAPE</p><h2 id="finale-title">Un projet en tête ?<br/><em>Parlons-en.</em></h2></div>
          <Link href="/contact" className="jp-finale-link">Contacter JP-SERVICES <ArrowUpRight size={22} aria-hidden="true"/></Link>
        </div>
      </section>
    </>
  );
}
