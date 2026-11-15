import type { Metadata } from "next";
import { ContactPreview } from "@/components/visuals/mockups";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { WhatsApp } from "@/components/brand/social-icons";
import { PageHeader } from "@/components/site/page-header";
import { getSettings } from "@/server/services/settings";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/seo";
import { ContactForm } from "./contact-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({ title: "Contact", description: "Une question, une proposition ou un besoin d’accompagnement ? Contactez l’équipe JP-Services à Lubumbashi.", path: "/contact" });

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sujet?: string }> }) {
  const [s, sp] = await Promise.all([getSettings(), searchParams]);
  const initialSubject = (sp.sujet ?? "").slice(0, 180);
  const tel = s.contact_telephone ?? "";
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@type": "ContactPage", url: `${SITE_URL}/contact`, mainEntity: { "@type": "Organization", name: "JP-Services", telephone: tel, email: s.contact_email, address: s.contact_adresse } })} />
      <PageHeader title="Contactez JP-Services" icon={Send} text="Une question, une proposition ou un besoin d’accompagnement ? Présentez-nous votre objectif." />
      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card reveal p-6 sm:p-10">
            <span className="eyebrow">Parlons de votre projet</span>
            <h2 className="h2 mt-2">Écrivez-nous</h2>
            <p className="mt-2 text-copy">Nous répondons généralement sous 48 heures ouvrées.</p>
            <div className="mt-8">
              <ContactForm initialSubject={initialSubject} />
            </div>
          </div>
          <div className="space-y-6">
            <ContactPreview />
            <div className="card reveal p-7">
              <h3 className="h3">Coordonnées</h3>
              <p className="mt-2 text-sm text-copy">Notre équipe est basée à Lubumbashi et intervient sur des projets de formation et de transformation digitale.</p>
              <ul className="mt-5 space-y-3 text-sm">
                <li>
                  <a href={`tel:${tel.replace(/\s+/g, "")}`} className="flex items-center gap-3 text-copy hover:text-primary">
                    <span className="icon-box">
                      <Phone className="size-4" />
                    </span>
                    {tel}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${s.contact_email}`} className="flex items-center gap-3 text-copy hover:text-primary">
                    <span className="icon-box">
                      <Mail className="size-4" />
                    </span>
                    {s.contact_email}
                  </a>
                </li>
                <li>
                  <a href={`https://wa.me/${s.contact_whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-copy hover:text-primary">
                    <span className="icon-box size-9">
                      <WhatsApp className="size-4" />
                    </span>
                    WhatsApp
                  </a>
                </li>
                <li className="flex items-center gap-3 text-copy">
                  <span className="icon-box">
                    <MapPin className="size-4" />
                  </span>
                  {s.contact_adresse}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
