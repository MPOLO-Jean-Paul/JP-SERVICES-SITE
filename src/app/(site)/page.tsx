import Link from "next/link";
import Image from "next/image";
import { MaterialIcon } from "@/components/ui/material-symbol";
import { PromoCarousel } from "@/components/home/promo-carousel";
import { TestimonialsCarousel, type PublishedTestimonial } from "@/components/home/testimonials-carousel";
import { getSettings } from "@/server/services/settings";
import { PathFinder } from "@/components/home/path-finder";
import { getCurrentUser } from "@/server/auth/session";
import { listActualites } from "@/server/services/content";
import { listUpcomingFormations } from "@/server/services/formations";
import { excerpt, formatDate, formatPrice } from "@/lib/utils";
import { SITE_URL, jsonLd } from "@/lib/seo";
import { SERVICES } from "@/lib/services";

export const dynamic = "force-dynamic";

const areas = [
  {
    number: "01", name: "Formations numériques", label: "Apprendre",
    description: "Des contenus organisés par compétences, des exercices et un parcours à construire étape par étape.",
    href: "/formations", illustration: "/illustrations/domaine-formations.svg",
  },
  {
    number: "02", name: "Logiciels & outils", label: "Utiliser",
    description: "Retrouvez les ressources numériques publiées et les outils utiles à votre activité.",
    href: "/logiciels", illustration: "/illustrations/domaine-logiciels.svg",
  },
  {
    number: "03", name: "Solutions & projets", label: "Réaliser",
    description: "Des solutions pensées pour les besoins des organisations, de l'idée à sa mise en œuvre.",
    href: "/projets", illustration: "/illustrations/domaine-projets.svg",
  },
] as const;

const method = [
  { number: "01", illustration: "/illustrations/formateur-en-ligne.svg", name: "Comprendre", description: "Partir d'un besoin précis. Définir ce que vous voulez apprendre, améliorer ou construire." },
  { number: "02", illustration: "/illustrations/apprendre-partout.svg", name: "Pratiquer", description: "Avancer avec une démarche concrète, des exemples utiles et des étapes compréhensibles." },
  { number: "03", illustration: "/illustrations/projet-equipe.svg", name: "Appliquer", description: "Transformer les acquis en méthodes, en outils et en réalisations qui servent vraiment." },
];

export default async function HomePage() {
  const [formations, actualites, user, settings] = await Promise.all([
    listUpcomingFormations(3).catch(() => []),
    listActualites(3).catch(() => []),
    getCurrentUser().catch(() => null),
    getSettings(),
  ]);
  // No invented reviews: only quotes explicitly published by an administrator.
  const testimonials: PublishedTestimonial[] = [1, 2, 3]
    .map((index) => ({
      name: (settings["temoignage_" + index + "_auteur"] ?? "").trim().slice(0, 90),
      role: (settings["temoignage_" + index + "_fonction"] ?? "").trim().slice(0, 120),
      quote: (settings["temoignage_" + index + "_citation"] ?? "").trim().slice(0, 500),
      published: settings["temoignage_" + index + "_publier"] === "1",
    }))
    .filter((item) => item.published && item.name.length > 1 && item.quote.length >= 15)
    .map(({ name, role, quote }) => ({ name, role, quote }));
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
            <p className="jp-overline"><span className="jp-overline-mark" /> Formations <span className="jp-overline-separator">·</span> Logiciels <span className="jp-overline-separator">·</span> Projets</p>
            <h1 id="home-title">Le numérique <span>en action.</span></h1>
            <p className="jp-hero-lead">Formations pratiques, logiciels et solutions numériques pour apprendre, créer et concrétiser vos projets.</p>
            <div className="jp-hero-actions">
              <Link href="/formations" className="jp-action jp-action-primary">Explorer les formations <MaterialIcon name="north_east" size={18} /></Link>
              <Link href={memberLink} className="jp-action jp-action-text">{memberLabel} <MaterialIcon name="arrow_forward" size={17} /></Link>
            </div>
            <p className="jp-hero-support"><MaterialIcon name="location_on" size={15} /> Disponible sur place et à distance</p>
          </div>
          <figure className="jp-hero-art" aria-hidden="true">
            <Image src="/illustrations/hero-apprenante.svg" width={600} height={520} alt="" priority unoptimized className="jp-hero-art-image" />
            <div className="jp-hero-chip jp-hero-chip-progress">
              <strong>Module 3 / 5</strong>
              <span className="jp-hero-chip-bar"><span /></span>
              <small>Votre progression</small>
            </div>
            <div className="jp-hero-chip jp-hero-chip-live"><span className="jp-hero-chip-dot" />Session en direct</div>
            <div className="jp-hero-chip jp-hero-chip-check"><MaterialIcon name="check" size={18} />Exercice validé</div>
          </figure>
        </div>
        <nav className="shell jp-hero-start" aria-label="Votre point de départ">
          {([
            ["/formations", "Développer une compétence"],
            ["/logiciels", "Découvrir un outil"],
            ["/scolia", "Explorer SCOLIA Pro"],
            ["/contact", "Parler d’un projet"],
          ] as const).map(([href, label], index) => (
            <Link key={href} href={href} className="jp-hero-start-link">
              <span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong><MaterialIcon name="north_east" size={18} />
            </Link>
          ))}
        </nav>
      </section>

      <PromoCarousel />

      <section className="jp-section jp-areas" aria-labelledby="areas-title">
        <div className="shell jp-areas-layout">
          <div className="jp-sticky-intro">
            <p className="jp-overline">Nos domaines</p>
            <h2 id="areas-title">Un savoir-faire, <em>plusieurs solutions.</em></h2>
            <p>Chaque besoin a son propre parcours. Choisissez une direction et accédez directement aux contenus correspondants.</p>
            <PathFinder />
          </div>
          <div className="jp-areas-list">
            {areas.map(area => <Link href={area.href} key={area.number} className="jp-area-link">
              <span className="jp-area-number">{area.number}</span>
              <div><span className="jp-area-kicker">{area.label}</span><h3>{area.name}</h3><p>{area.description}</p></div>
              <span className="jp-area-visual jp-area-illustration"><Image src={area.illustration} width={300} height={220} alt="" loading="lazy" unoptimized /></span>
              <MaterialIcon name="north_east" size={21} className="jp-area-arrow" />
            </Link>)}
          </div>
        </div>
      </section>

      <section className="jp-section jp-home-services" aria-labelledby="services-title">
        <div className="shell">
          <div className="jp-section-heading">
            <div><p className="jp-overline">Nos services</p><h2 id="services-title">Ce que nous <em>réalisons pour vous.</em></h2></div>
            <Link href="/services" className="jp-inline-link">Tous nos services <MaterialIcon name="north_east" size={18} /></Link>
          </div>
          <div className="jp-hsvc-grid" role="list">
            {SERVICES.map((service, index) => (
              <Link key={service.slug} href={"/services#" + service.slug} className="jp-hsvc" data-tone={service.tone} role="listitem">
                <span className="jp-hsvc-visual" aria-hidden="true">
                  <span className="jp-hsvc-num">{String(index + 1).padStart(2, "0")}</span>
                  <Image src={service.avatar} width={240} height={240} alt="" unoptimized loading="lazy" className="jp-hsvc-avatar" />
                  <span className="jp-hsvc-icon"><service.Icon /></span>
                </span>
                <span className="jp-hsvc-body">
                  <h3>{service.title}</h3>
                  <p>{service.short}</p>
                  <span className="jp-hsvc-more">Découvrir <MaterialIcon name="arrow_forward" size={16} /></span>
                </span>
              </Link>
            ))}
            <Link href="/contact?sujet=Demande%20de%20devis" className="jp-hsvc jp-hsvc-quote" role="listitem">
              <span className="jp-hsvc-quote-art" aria-hidden="true">
                {SERVICES.slice(0, 4).map((s) => <Image key={s.slug} src={s.avatar} width={240} height={240} alt="" unoptimized loading="lazy" />)}
              </span>
              <span className="jp-hsvc-body">
                <h3>Un besoin précis&nbsp;?</h3>
                <p>Présentez votre projet&nbsp;: nous vous répondons avec une proposition claire, un délai et un budget.</p>
                <span className="jp-hsvc-more">Demander un devis <MaterialIcon name="arrow_forward" size={16} /></span>
              </span>
            </Link>
          </div>
          <p className="jp-hsvc-hint" aria-hidden="true">Faites glisser pour voir les {SERVICES.length} services</p>
        </div>
      </section>

      <section className="jp-section jp-learning" aria-labelledby="learning-title">
        <div className="shell">
          <div className="jp-section-heading">
            <div><p className="jp-overline">Se former</p><h2 id="learning-title">Les prochaines <em>formations.</em></h2></div>
            <Link href="/formations" className="jp-inline-link">Consulter le catalogue <MaterialIcon name="north_east" size={18} /></Link>
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
                {formation.duree ? <span><MaterialIcon name="schedule" size={14} />{formation.duree}</span> : null}
                {formation.dateDebut ? <span><MaterialIcon name="calendar_month" size={14} />{formatDate(formation.dateDebut, "fr", { day:"numeric", month:"short", year:"numeric" })}</span> : null}
                <strong>{formatPrice(Number(formation.prix))}</strong>
              </div>
              <MaterialIcon name="north_east" size={21} className="jp-course-arrow" />
            </Link>)}
          </div> : <div className="jp-learning-empty">
            <span className="jp-empty-symbol"><MaterialIcon name="school" size={31} /></span>
            <div><h3>Le programme se construit.</h3><p>Aucune session annoncée pour le moment. Parcourez les domaines ou contactez-nous pour présenter vos objectifs.</p></div>
            <Link href="/formations" className="jp-inline-link">Voir les domaines <MaterialIcon name="arrow_forward" size={18} /></Link>
          </div>}
        </div>
      </section>

      <section className="jp-section jp-method" aria-labelledby="method-title">
        <div className="shell">
          <div className="jp-section-heading">
            <div><p className="jp-overline">Notre approche</p><h2 id="method-title">Apprendre <em>par la pratique.</em></h2></div>
            <p className="jp-section-aside">Une méthode simple pour garder le cap : comprendre un problème, travailler concrètement et mesurer la progression.</p>
          </div>
          <div className="jp-method-grid">{method.map(step=><div key={step.number} className="jp-method-step">
            <Image className="jp-method-illustration" src={step.illustration} width={400} height={400} alt="" loading="lazy" unoptimized />
            <span>{step.number}</span><div className="jp-method-rule"/><h3>{step.name}</h3><p>{step.description}</p>
          </div>)}</div>
        </div>
      </section>

      <section className="jp-scolia-section" aria-labelledby="scolia-title">
        <div className="shell jp-scolia-grid">
          <div className="jp-scolia-main">
            <p className="jp-overline">Logiciel métier <span className="jp-scolia-status">En développement</span></p>
            <h2 id="scolia-title">SCOLIA Pro. <em>La gestion scolaire simplifiée.</em></h2>
            <p>Un projet logiciel conçu autour des opérations quotidiennes des établissements : suivi des apprenants, encaissements, organisation de la scolarité et pilotage des informations.</p>
            <div className="jp-scolia-actions">
              <Link href="/scolia" className="jp-action jp-action-light">Découvrir le projet <MaterialIcon name="north_east" size={18} /></Link>
              <Link href="/contact?sujet=SCOLIA%20Pro" className="jp-action jp-action-light-text">Poser une question <MaterialIcon name="arrow_forward" size={18} /></Link>
            </div>
          </div>
          <div className="jp-scolia-index" aria-label="Domaines couverts par le projet">
            <figure className="jp-scolia-photo jp-scolia-illustration">
              <Image src="/illustrations/scolia-gestion.svg" width={560} height={340} alt="Illustration de SCOLIA Pro : un établissement scolaire, son tableau de bord et un reçu de paiement" loading="lazy" unoptimized />
            </figure>
            <div className="jp-scolia-index-top"><span>Domaines couverts</span><span>Version en construction</span></div>
            {["Gestion des apprenants","Finances & encaissements","Scolarité & évaluations","Rapports & administration"].map((name,i)=><div key={name} className="jp-scolia-index-row">
              <span>{String(i+1).padStart(2,"0")}</span><strong>{name}</strong><MaterialIcon name="check" size={17} />
            </div>)}
            <div className="jp-scolia-index-bottom"><span>Un établissement, une vue d&apos;ensemble</span><span>Suivi centralisé</span></div>
          </div>
        </div>
      </section>

      <TestimonialsCarousel testimonials={testimonials} />

      {actualites.length > 0 ? <section className="jp-section jp-news" aria-labelledby="news-title">
        <div className="shell">
          <div className="jp-section-heading"><div><p className="jp-overline">Journal</p><h2 id="news-title">Les dernières <em>publications.</em></h2></div>
            <Link href="/actualites" className="jp-inline-link">Toutes les actualités <MaterialIcon name="north_east" size={18} /></Link>
          </div>
          <div className="jp-news-list">{actualites.map(a=><Link key={a.id} href={"/actualites/"+a.id} className="jp-news-row">
            <span className="jp-news-date">{formatDate(a.datePublication,"fr",{day:"numeric",month:"short",year:"numeric"})}</span>
            <h3>{a.titre}</h3><MaterialIcon name="chevron_right" size={20} />
          </Link>)}</div>
        </div>
      </section> : null}

      <section className="jp-finale" aria-labelledby="finale-title">
        <div className="shell jp-finale-layout">
          <div><p className="jp-overline">Parlons de votre prochaine étape</p><h2 id="finale-title">Un projet ? <em>Parlons-en.</em></h2></div>
          <Link href="/contact" className="jp-finale-link">Nous contacter <MaterialIcon name="north_east" size={22} /></Link>
        </div>
      </section>
    </>
  );
}
