import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <section className="inner-hero"><div className="shell"><div className="eyebrow">ERREUR 404</div><h1>Cette page n'existe pas.</h1><p>Le lien demandé n'est peut-être plus disponible. Retrouvez nos services depuis l'accueil.</p><Link href="/" className="btn btn-light" style={{marginTop:26}}><ArrowLeft size={17}/> Retour à l'accueil</Link></div></section>;
}
