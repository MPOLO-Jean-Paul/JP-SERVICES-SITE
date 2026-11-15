import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { ArrowUpRight, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Contact", description: "Parlez de votre projet à JP-SERVICES : échangeons sur vos besoins et vos objectifs." };

export default function ContactPage() {
  const email = process.env.CONTACT_EMAIL?.trim() || "contact@jp-services.com";
  const safeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "contact@jp-services.com";
  return <>
    <section className="inner-hero"><div className="shell"><div className="eyebrow"><span className="eyebrow-dot"/> NOUS CONTACTER</div><h1>Parlons de votre<br/><em>prochaine idée.</em></h1><p>Une question, un projet ou un besoin d'accompagnement ? Décrivez-nous votre objectif.</p></div></section>
    <section className="section shell contact-layout"><div><div className="eyebrow eyebrow-dark">ENVOYER UN MESSAGE</div><h2 style={{fontFamily:"Manrope, sans-serif",fontSize:"clamp(27px,3vw,38px)",letterSpacing:"-.05em",margin:"15px 0 28px"}}>Comment pouvons-nous vous aider ?</h2><ContactForm /></div>
      <aside className="contact-aside"><h2>Construisons quelque chose d'utile.</h2><p>Nous privilégions les échanges simples et directs. Parlez-nous du problème à résoudre, nous réfléchirons à la meilleure approche.</p><div className="contact-aside-rule"/><span className="contact-aside-label">E-MAIL PROFESSIONNEL</span><div><a href={"mailto:"+safeEmail}>{safeEmail} <ArrowUpRight size={13}/></a></div><div className="contact-aside-rule"/><span className="contact-aside-label">NOTRE BASE</span><p><MapPin size={16}/> Lubumbashi, République démocratique du Congo</p></aside>
    </section>
  </>;
}
