import Link from "next/link";
import { ArrowRight, ArrowUpRight, Globe2, Mail, MapPin } from "lucide-react";
import { OFFICIAL_DOMAIN, publicContactEmail } from "@/lib/identity";

export function SiteFooter() {
  const email = publicContactEmail();

  return (
    <footer className="site-footer editorial-footer">
      <div className="shell editorial-footer-lead">
        <div>
          <span className="editorial-footer-kicker">UNE IDÉE EN TÊTE ?</span>
          <h2>Ensemble, faisons-la<br/><em>prendre vie.</em></h2>
        </div>
        <Link href="/contact" className="editorial-footer-cta">Discutons de votre projet <ArrowUpRight size={20}/></Link>
      </div>
      <div className="shell footer-top editorial-footer-grid">
        <div className="editorial-footer-about">
          <Link className="brand footer-brand" href="/" aria-label="JP-SERVICES — Accueil"><span className="brand-symbol" aria-hidden="true">J<span>P</span></span><span>JP<span className="brand-separator">/</span>SERVICES</span></Link>
          <p>Des idées aux expériences numériques, nous concevons des solutions utiles, claires et pensées pour durer.</p>
          <div className="editorial-footer-domain"><Globe2 size={16}/> {OFFICIAL_DOMAIN}</div>
        </div>
        <div className="footer-links editorial-footer-links">
          <div><strong>Découvrir</strong><Link href="/formations">Formations</Link><Link href="/services">Nos expertises</Link><Link href="/logiciels">Logiciels</Link><Link href="/projets">Projets</Link></div>
          <div><strong>JP-SERVICES</strong><Link href="/a-propos">Notre histoire</Link><Link href="/actualites">Actualités</Link><Link href="/contact">Nous contacter</Link><Link href="/admin/demo">Aperçu de la console</Link></div>
          <div><strong>Nous joindre</strong><a href={"mailto:" + email}><Mail size={15}/> {email}</a><span><MapPin size={15}/> Lubumbashi, RDC</span><Link href="/contact">Soumettre un projet <ArrowRight size={14}/></Link></div>
        </div>
      </div>
      <div className="shell footer-bottom editorial-footer-bottom">
        <span>© {new Date().getFullYear()} JP-SERVICES. Tous droits réservés.</span>
        <span>Une création pensée à Lubumbashi, pour des besoins concrets.</span>
      </div>
    </footer>
  );
}
