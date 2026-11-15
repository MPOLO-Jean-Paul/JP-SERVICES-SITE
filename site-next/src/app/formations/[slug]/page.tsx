import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, BookOpenCheck, Check, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, Compass, GraduationCap, ListChecks, MessageCircle, MoveUpRight, Sparkles } from "lucide-react";
import { resolveFormation } from "@/lib/formation-resolver";
import { formationPrograms, type FormationModule } from "@/lib/formation-programs";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const formation = await resolveFormation(slug);
  if (formation.state !== "ready") return { title: "Formation non disponible", robots: { index: false, follow: false } };
  return {
    title: formation.item.title,
    description: formation.item.description,
    robots: formation.source === "preview" ? { index: false, follow: true } : undefined
  };
}

function ProgramModule({ module, index }: { module: FormationModule; index: number }) {
  return <details className="course-module" open={index === 0}>
    <summary>
      <span className="course-module-number">{String(index + 1).padStart(2, "0")}</span>
      <span className="course-module-summary"><strong>{module.title}</strong><small>{module.description}</small></span>
      <ChevronDown size={20} aria-hidden="true"/>
    </summary>
    <ul>{module.topics.map(topic => <li key={topic}><Check size={15} aria-hidden="true"/>{topic}</li>)}</ul>
  </details>;
}

export default async function FormationDetailPage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolveFormation(slug);
  if (resolved.state === "not-found") notFound();
  if (resolved.state === "unavailable") {
    return <div className="shell course-unavailable">
      <div className="e-label"><span/> CATALOGUE INDISPONIBLE</div>
      <h1>Les informations ne sont pas accessibles pour le moment.</h1>
      <p>Nous préférons ne pas afficher de données approximatives. Vous pouvez revenir au catalogue ou nous écrire directement.</p>
      <div className="course-actions"><Link className="e-button e-button-primary" href="/formations">Retour aux formations <ArrowLeft size={17}/></Link><Link className="e-button e-button-minimal" href="/contact">Nous contacter <ArrowUpRight size={17}/></Link></div>
    </div>;
  }

  const { item, source, program } = resolved;
  const subject = encodeURIComponent("Renseignements sur la formation : " + item.title);
  const contactHref = "/contact?subject=" + subject;
  const other = source === "preview" ? formationPrograms.filter(p => p.slug !== slug) : [];

  return <article className="course-page">
    <header className="course-hero">
      <div className="shell course-hero-shell">
        <nav aria-label="Fil d'Ariane" className="course-breadcrumb">
          <Link href="/">Accueil</Link><ChevronRight size={14}/><Link href="/formations">Formations</Link><ChevronRight size={14}/><span aria-current="page">{item.title}</span>
        </nav>
        <div className="course-hero-grid">
          <div>
            <div className="course-eyebrow"><span className="course-eyebrow-dot"/>{program?.eyebrow || item.category}</div>
            <h1>{item.title}<span>.</span></h1>
            <p className="course-hero-lead">{program?.promise || item.description}</p>
            <div className="course-labels"><span><BookOpenCheck size={16}/> Formation</span><span><Compass size={16}/> {item.category}</span><span><CircleHelp size={16}/> Modalités sur demande</span></div>
            <div className="course-actions"><Link href={contactHref} className="e-button e-button-primary">Demander des renseignements <ArrowUpRight size={17}/></Link><Link href="#programme" className="e-button e-button-minimal">Explorer le programme <ArrowRight size={17}/></Link></div>
            {source === "preview" && <p className="course-disclaimer">Présentation indicative : le programme, les modalités et la disponibilité doivent être confirmés auprès de JP-SERVICES.</p>}
          </div>
          <div className="course-hero-art" aria-hidden="true">
            <div className="course-art-ring course-art-ring-one"/><div className="course-art-ring course-art-ring-two"/>
            <div className="course-art-card">
              <div className="course-art-header"><span>JP / LEARNING</span><span>✳</span></div>
              <div className="course-art-icon"><GraduationCap size={65} strokeWidth={1.3}/></div>
              <div className="course-art-caption">APPRENDRE <span>·</span> PRATIQUER <span>·</span> PROGRESSER</div>
              <div className="course-art-lines"><i/><i/><i/></div>
            </div>
            <div className="course-art-float"><BadgeCheck size={19}/> DES COMPÉTENCES UTILES</div>
          </div>
        </div>
      </div>
    </header>

    <div className="shell course-layout">
      <div className="course-main">
        <section className="course-section" aria-labelledby="course-about-title">
          <div className="e-label"><span/> PRÉSENTATION</div>
          <h2 id="course-about-title">Une formation pensée pour <em>passer à la pratique.</em></h2>
          <p>{program?.introduction || item.description}</p>
          {item.detail && <p>{source === "preview" ? "Contenu de présentation : " : ""}{item.detail}</p>}
        </section>

        {program ? <>
          <section className="course-section course-outcomes" aria-labelledby="course-outcomes-title">
            <div className="e-label"><span/> OBJECTIFS INDICATIFS</div>
            <h2 id="course-outcomes-title">Les compétences <em>à développer.</em></h2>
            <div className="course-outcome-grid">{program.outcomes.map(outcome =>
              <div className="course-outcome" key={outcome}><span className="course-outcome-icon"><Check size={18}/></span><p>{outcome}</p></div>
            )}</div>
          </section>
          <section id="programme" className="course-section course-program" aria-labelledby="course-program-title">
            <div className="e-label"><span/> PROPOSITION DE PARCOURS</div>
            <h2 id="course-program-title">Un programme clair, <em>étape par étape.</em></h2>
            <p>Voici un exemple de progression pédagogique. Les séquences et les outils seront adaptés au programme définitif.</p>
            <div className="course-module-list">{program.modules.map((module,index) =>
              <ProgramModule key={module.title} module={module} index={index}/>
            )}</div>
          </section>
          <section className="course-section course-practical" aria-labelledby="course-practical-title">
            <div className="course-practical-icon"><ClipboardCheck size={25}/></div>
            <div><span className="e-label"><span/> APPLICATION CONCRÈTE</span><h2 id="course-practical-title">Apprendre en réalisant.</h2><p>{program.practical}</p><small>Exemple d'activité, non contractuel.</small></div>
          </section>
        </> : <section id="programme" className="course-section course-program" aria-labelledby="course-program-title">
          <div className="e-label"><span/> PROGRAMME & MODALITÉS</div>
          <h2 id="course-program-title">Un parcours <em>à préciser ensemble.</em></h2>
          <p>Le descriptif publié présente les grandes lignes de cette formation. Pour connaître les modules, le niveau, les conditions de participation et les disponibilités, contactez JP-SERVICES.</p>
          <Link href={contactHref} className="e-text-link">Demander le programme complet <ArrowUpRight size={17}/></Link>
        </section>}

        <section className="course-section course-questions" aria-labelledby="course-questions-title">
          <div className="e-label"><span/> QUESTIONS FRÉQUENTES</div>
          <h2 id="course-questions-title">Ce qu'il faut <em>savoir.</em></h2>
          <div className="course-faq">
            <details><summary>Quelles sont les conditions pour participer ? <ChevronDown size={18}/></summary><p>{program?.prerequisites || "Les conditions et le niveau requis seront précisés lors de votre demande."}</p></details>
            <details><summary>Quelle est la durée de la formation ? <ChevronDown size={18}/></summary><p>La durée n'est pas encore publiée. Elle dépendra du programme et de l'organisation retenus. Contactez-nous pour obtenir les modalités confirmées.</p></details>
            <details><summary>Une attestation ou certification est-elle prévue ? <ChevronDown size={18}/></summary><p>Aucun certificat ni diplôme n'est annoncé sur cette page. Les éventuels documents remis seront précisés dans l'offre définitive.</p></details>
            <details><summary>Comment connaître les dates et les frais ? <ChevronDown size={18}/></summary><p>Les dates, disponibilités et frais ne sont pas encore affichés. Vous pouvez demander ces informations par le formulaire de contact.</p></details>
          </div>
        </section>
      </div>

      <aside className="course-sidebar" aria-label="Informations pratiques">
        <div className="course-info-card">
          <div className="course-info-head"><div className="course-info-head-icon"><ListChecks size={24}/></div><span>FICHE PRATIQUE</span></div>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <div className="course-info-row"><span>Catégorie</span><strong>{item.category}</strong></div>
          <div className="course-info-row"><span>Programme</span><strong>{source === "preview" ? "Indicatif" : "Sur demande"}</strong></div>
          <div className="course-info-row"><span>Durée & calendrier</span><strong>À confirmer</strong></div>
          <div className="course-info-row"><span>Tarifs</span><strong>Sur demande</strong></div>
          {program && <div className="course-info-row"><span>Public visé</span><strong>{program.audience}</strong></div>}
          <Link href={contactHref} className="e-button e-button-primary course-info-cta">Recevoir des informations <ArrowUpRight size={17}/></Link>
          <p className="course-info-fineprint">Aucune inscription ni paiement en ligne sur cette page.</p>
        </div>
        <div className="course-help-card"><MessageCircle size={22}/><h3>Une question ?</h3><p>Notre équipe peut vous aider à préciser votre besoin de formation.</p><Link href="/contact">Nous écrire <MoveUpRight size={16}/></Link></div>
      </aside>
    </div>

    {other.length > 0 && <section className="course-other"><div className="shell">
      <div className="course-other-heading"><div><div className="e-label"><span/> POUR ALLER PLUS LOIN</div><h2>Explorez d'autres <em>domaines.</em></h2></div><Link href="/formations" className="e-text-link">Toutes les formations <ArrowUpRight size={17}/></Link></div>
      <div className="course-other-grid">{other.map(program =>
        <Link key={program.slug} className="course-other-card" href={"/formations/"+program.slug}>
          <div className="course-other-icon"><BookOpenCheck size={24}/></div>
          <span>{program.eyebrow}</span><h3>{program.promise}</h3><div>Découvrir <MoveUpRight size={18}/></div>
        </Link>
      )}</div>
    </div></section>}
  </article>;
}
