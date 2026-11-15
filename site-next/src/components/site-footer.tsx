import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  const contactEmail = process.env.CONTACT_EMAIL?.trim() || "contact@jp-services.com";
  const safeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) ? contactEmail : "contact@jp-services.com";

  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div>
          <Link className="brand footer-brand" href="/"><span className="brand-symbol" aria-hidden="true">J<span>P</span></span><span>JP<span className="brand-separator">/</span>SERVICES</span></Link>
          <p>Technologie, design et accompagnement, avec une même exigence : créer des solutions utiles.</p>
        </div>
        <div className="footer-links">
          <div><strong>Explorer</strong><Link href="/services">Expertises</Link><Link href="/formations">Formations</Link><Link href="/logiciels">Logiciels</Link><Link href="/projets">Réalisations</Link></div>
          <div><strong>JP-SERVICES</strong><Link href="/a-propos">À propos</Link><Link href="/actualites">Actualités</Link><Link href="/contact">Nous contacter</Link></div>
          <div><strong>Nous joindre</strong><a href={"mailto:" + safeEmail}><Mail size={14}/> {safeEmail}</a><span><MapPin size={14}/> Lubumbashi, RDC</span><Link href="/contact">Démarrer un projet <ArrowUpRight size={14}/></Link></div>
        </div>
      </div>
      <div className="shell footer-bottom"><span>© {new Date().getFullYear()} JP-SERVICES. Tous droits réservés.</span><span>Conçu avec exigence à Lubumbashi.</span></div>
    </footer>
  );
}
