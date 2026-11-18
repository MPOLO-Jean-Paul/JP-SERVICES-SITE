import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { SERVICES, serviceContactHref } from "@/lib/services";
import { jsonLd, pageMetadata, SITE_URL } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Nos services",
  description: "Applications web et mobiles, sites professionnels, logiciels métiers, monétisation et automatisation, graphisme, encadrement et formation informatique à Lubumbashi.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({
        "@type": "ItemList",
        name: "Services JP-Services",
        itemListElement: SERVICES.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Service", name: s.title, description: s.text, provider: { "@type": "Organization", name: "JP-Services", url: SITE_URL }, areaServed: "CD" } })),
      })} />
      <PageHeader
        title="Nos services"
        illustration="/illustrations/projet-equipe.svg"
        text="De l’idée à la réalisation : applications, sites, logiciels, visuels et formations, réalisés avec soin à Lubumbashi et à distance."
      />

      <section className="jp-section">
        <div className="shell">
          <div className="jp-section-intro-center">
            <p className="jp-overline">Ce que nous réalisons</p>
            <h2>Sept services, une même exigence.</h2>
            <p>Choisissez un service pour découvrir ce qu’il comprend, puis demandez-le en un clic : votre demande nous arrive avec le bon sujet.</p>
          </div>
          <nav aria-label="Aller à un service" className="jp-service-index">
            {SERVICES.map((s) => (
              <a key={s.slug} href={`#${s.slug}`} className="jp-service-chip"><s.Icon aria-hidden className="size-4" />{s.title}</a>
            ))}
          </nav>

          <div className="jp-service-grid reveal-stagger">
            {SERVICES.map((s) => (
              <article key={s.slug} id={s.slug} className="jp-service-card" data-tone={s.tone}>
                <div className="jp-service-head">
                  <Image src={s.avatar} width={240} height={240} alt="" unoptimized loading="lazy" className="jp-service-avatar" />
                  <span className="jp-service-icon jp-service-icon-badge"><s.Icon aria-hidden /></span>
                </div>
                <h2 className="jp-service-title">{s.title}</h2>
                <p className="jp-service-text">{s.text}</p>
                <ul className="jp-service-points">
                  {s.points.map((p) => (
                    <li key={p}><Check aria-hidden className="size-4" />{p}</li>
                  ))}
                </ul>
                <Link href={serviceContactHref(s)} className="jp-service-cta jp-hit">
                  Demander ce service <ArrowRight aria-hidden className="size-4" />
                </Link>
              </article>
            ))}
          </div>

          <div className="jp-service-band">
            <div>
              <h2>Un projet qui ne rentre dans aucune case ?</h2>
              <p>Décrivez-nous votre besoin : nous vous répondons avec une proposition claire, un délai et un budget.</p>
            </div>
            <Link href="/contact?sujet=Demande%20de%20devis" className="jp-action jp-action-primary">Demander un devis <ArrowRight aria-hidden className="size-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
