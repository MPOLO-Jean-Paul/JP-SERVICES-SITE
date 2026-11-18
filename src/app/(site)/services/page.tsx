import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { SERVICES, serviceContactHref } from "@/lib/services";
import { jsonLd, pageMetadata, SITE_URL } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Nos services",
  description: "Applications web et mobiles, sites professionnels, logiciels métiers, monétisation et automatisation, graphisme, encadrement et formation informatique à Lubumbashi.",
  path: "/services",
});

const PROCESS = [
  { title: "Échange", text: "Nous écoutons votre besoin, vos objectifs et vos contraintes, sur place ou à distance." },
  { title: "Proposition", text: "Vous recevez une proposition claire : contenu, délai et budget, sans surprise." },
  { title: "Réalisation", text: "Nous réalisons le travail par étapes et vous montrons l’avancement à chaque jalon." },
  { title: "Suivi", text: "Livraison, prise en main et accompagnement après la mise en service." },
];

export default function ServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({
        "@type": "ItemList",
        name: "Services JP-Services",
        itemListElement: SERVICES.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Service", name: s.title, description: s.text, provider: { "@type": "Organization", name: "JP-Services", url: SITE_URL }, areaServed: "CD" } })),
      })} />

      {/* En-tête */}
      <section className="jp-svc-hero" aria-labelledby="services-title">
        <div className="shell jp-svc-hero-inner">
          <nav aria-label="Fil d’Ariane" className="jp-breadcrumb justify-center">
            <Link href="/">Accueil</Link><span aria-hidden>›</span><span aria-current="page">Nos services</span>
          </nav>
          <h1 id="services-title">Des services pensés <em>pour faire avancer vos projets.</em></h1>
          <p className="jp-svc-hero-lead">Applications, sites, logiciels, visuels et formations : une seule équipe, à Lubumbashi et à distance, pour passer de l’idée à la réalisation.</p>
          <div className="jp-svc-hero-actions">
            <Link href="/contact?sujet=Demande%20de%20devis" className="jp-action jp-action-primary">Demander un devis <ArrowRight aria-hidden className="size-4" /></Link>
            <a href="#services" className="jp-action jp-action-text">Découvrir les services</a>
          </div>
          <ul className="jp-svc-orbit" aria-hidden="true">
            {SERVICES.map((s, i) => (
              <li key={s.slug} style={{ animationDelay: `${i * 70}ms` }}><Image src={s.avatar} width={240} height={240} alt="" unoptimized priority={i < 4} /></li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sommaire collant */}
      <nav aria-label="Aller à un service" className="jp-svc-index">
        <div className="shell"><div className="jp-svc-index-track">
          {SERVICES.map((s, i) => (
            <a key={s.slug} href={`#${s.slug}`}><span>{String(i + 1).padStart(2, "0")}</span>{s.title}</a>
          ))}
        </div></div>
      </nav>

      {/* Services */}
      <section id="services" className="jp-svc-list" aria-label="Nos services">
        <div className="shell">
          {SERVICES.map((s, i) => (
            <article key={s.slug} id={s.slug} className="jp-service-card jp-svc-row reveal" data-tone={s.tone} data-flip={i % 2 === 1}>
              <div className="jp-svc-visual">
                <Image src={s.avatar} width={240} height={240} alt="" unoptimized loading="lazy" className="jp-svc-avatar" />
                <span className="jp-svc-visual-icon"><s.Icon aria-hidden /></span>
              </div>
              <div className="jp-svc-body">
                <p className="jp-svc-number">{String(i + 1).padStart(2, "0")} <span>/ {String(SERVICES.length).padStart(2, "0")}</span></p>
                <h2>{s.title}</h2>
                <p className="jp-svc-text">{s.text}</p>
                <ul className="jp-svc-points">
                  {s.points.map((p) => <li key={p}><Check aria-hidden className="size-4" />{p}</li>)}
                </ul>
                <div className="jp-svc-actions">
                  <Link href={serviceContactHref(s)} className="jp-svc-cta">Demander ce service <ArrowRight aria-hidden className="size-4" /></Link>
                  <Link href={`/contact?sujet=${encodeURIComponent("Question : " + s.title)}`} className="jp-svc-ask"><MessageCircle aria-hidden className="size-4" />Poser une question</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Démarche */}
      <section className="jp-svc-process" aria-labelledby="process-title">
        <div className="shell">
          <div className="jp-section-intro-center">
            <p className="jp-overline">Notre démarche</p>
            <h2 id="process-title">Quatre étapes, pour chaque projet.</h2>
          </div>
          <ol className="jp-svc-steps reveal-stagger">
            {PROCESS.map((p, i) => (
              <li key={p.title}><span className="jp-svc-step-n">{i + 1}</span><h3>{p.title}</h3><p>{p.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* Appel final */}
      <section className="shell jp-svc-final-wrap">
        <div className="jp-service-band">
          <div>
            <h2>Un projet qui ne rentre dans aucune case ?</h2>
            <p>Décrivez-nous votre besoin : nous vous répondons avec une proposition claire, un délai et un budget.</p>
          </div>
          <Link href="/contact?sujet=Demande%20de%20devis" className="jp-action jp-action-light">Demander un devis <ArrowRight aria-hidden className="size-4" /></Link>
        </div>
      </section>
    </>
  );
}
