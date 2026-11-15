import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { ArrowRight, ArrowUpRight, Clock3, Mail, MapPin, MessageCircleMore } from "lucide-react";
import { publicContactEmail } from "@/lib/identity";

export const metadata: Metadata = { title: "Contact", description: "Décrivez votre projet à JP-SERVICES : formations, applications, accompagnement ou logiciels à Lubumbashi." };

export default function ContactPage() {
  const email = publicContactEmail();
  return <>
    <section className="editorial-page-hero editorial-contact-hero">
      <div className="shell editorial-page-hero-inner">
        <div className="editorial-breadcrumb">ACCUEIL <span>/</span> CONTACT</div>
        <div className="editorial-page-label"><span/> ÉCHANGEONS SUR VOTRE IDÉE</div>
        <h1>Une question, un projet ?<br/><em>Parlons-en.</em></h1>
        <p>Que vous souhaitiez acquérir de nouvelles compétences ou créer une solution numérique, expliquez-nous votre besoin.</p>
      </div>
      <span className="editorial-hero-orbit" aria-hidden="true"/>
    </section>
    <section className="shell editorial-contact-layout">
      <div className="editorial-form-wrap">
        <div className="editorial-section-kicker">01 / VOTRE DEMANDE</div>
        <h2>Décrivez-nous votre projet.</h2>
        <p>Quelques détails suffisent pour commencer la conversation.</p>
        <ContactForm />
      </div>
      <aside className="editorial-contact-aside">
        <div className="editorial-contact-card">
          <div className="editorial-contact-symbol"><MessageCircleMore size={25}/></div>
          <h2>Chaque projet commence par une conversation.</h2>
          <p>Un besoin concret, une question technique ou une formation ? Choisissez le moyen le plus simple pour nous joindre.</p>
          <div className="editorial-contact-item"><Mail size={18}/><div><strong>E-mail professionnel</strong><a href={"mailto:"+email}>{email} <ArrowUpRight size={14}/></a></div></div>
          <div className="editorial-contact-item"><MapPin size={18}/><div><strong>Notre implantation</strong><span>Lubumbashi, Haut-Katanga · RDC</span></div></div>
          <div className="editorial-contact-item"><Clock3 size={18}/><div><strong>Disponibilité</strong><span>Écrivez-nous pour convenir d'un échange.</span></div></div>
        </div>
        <div className="editorial-contact-note"><strong>Vous souhaitez une formation ?</strong><p>Découvrez les domaines proposés, puis adressez-nous vos besoins.</p><a href="/formations">Explorer les formations <ArrowRight size={15}/></a></div>
      </aside>
    </section>
  </>;
}
