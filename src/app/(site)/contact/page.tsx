import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { WhatsApp } from "@/components/brand/social-icons";
import { PageHeader } from "@/components/site/page-header";
import { getSettings } from "@/server/services/settings";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/seo";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "Contactez JP-Services à Lubumbashi pour vos demandes de formation, de logiciels ou de projets numériques.",
  path: "/contact",
});

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sujet?: string }> }) {
  const [s, params] = await Promise.all([getSettings(), searchParams]);
  const subject = (params.sujet ?? "").slice(0, 180);
  const phone = (s.contact_telephone ?? "").trim();
  const whatsapp = (s.contact_whatsapp ?? "").replace(/\D/g, "");
  const email = (s.contact_email ?? "").trim();
  const location = (s.contact_adresse ?? "").trim();

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({
      "@type": "ContactPage",
      url: SITE_URL + "/contact",
      mainEntity: { "@type": "Organization", name: "JP-Services", email, ...(phone ? { telephone: phone } : {}), ...(location ? { address: location } : {}) },
    })} />
    <PageHeader illustration="/illustrations/contact-conseillere.svg" title="Parlons de votre projet." text="Une question sur une formation, une solution numérique ou un partenariat ? Présentez-nous votre besoin." />
    <section className="jp-contact-section">
      <div className="shell jp-contact-layout">
        <div className="jp-contact-main">
          <p className="jp-overline">01 / VOTRE DEMANDE</p>
          <h2>Écrivez-nous.</h2>
          <p>Indiquez votre sujet et les informations utiles pour que nous puissions comprendre votre demande.</p>
          <div className="jp-contact-form"><ContactForm initialSubject={subject}/></div>
        </div>
        <aside className="jp-contact-aside" aria-labelledby="contact-coordinates">
          <p className="jp-overline">02 / NOUS JOINDRE</p>
          <h2 id="contact-coordinates">Les coordonnées.</h2>
          <p>JP-SERVICES est basé à Lubumbashi, en République démocratique du Congo.</p>
          <div className="jp-contact-lines">
            {email && <a href={"mailto:" + email} className="jp-contact-line">
              <Mail size={19} aria-hidden="true"/>
              <span><small>ADRESSE E-MAIL</small><strong>{email}</strong></span>
              <ArrowUpRight size={16} aria-hidden="true"/>
            </a>}
            {phone && <a href={"tel:" + phone.replace(/\s+/g, "")} className="jp-contact-line">
              <Phone size={19} aria-hidden="true"/>
              <span><small>TÉLÉPHONE</small><strong>{phone}</strong></span>
              <ArrowUpRight size={16} aria-hidden="true"/>
            </a>}
            {whatsapp && <a href={"https://wa.me/" + whatsapp} target="_blank" rel="noopener noreferrer" className="jp-contact-line">
              <WhatsApp className="size-[19px]" />
              <span><small>MESSAGERIE</small><strong>Écrire sur WhatsApp</strong></span>
              <ArrowUpRight size={16} aria-hidden="true"/>
            </a>}
            <div className="jp-contact-line jp-contact-address">
              <MapPin size={19} aria-hidden="true"/>
              <span><small>LOCALISATION</small><strong>{location || "Lubumbashi, RDC"}</strong></span>
            </div>
          </div>
          <div className="jp-contact-note">
            <span>UNE DEMANDE BIEN PRÉPARÉE</span>
            <p>Précisez le contexte, le résultat recherché et les contraintes importantes. Cela facilite un échange concret.</p>
            <Link href="/a-propos">Découvrir JP-SERVICES <ArrowUpRight size={16}/></Link>
          </div>
        </aside>
      </div>
    </section>
  </>;
}
