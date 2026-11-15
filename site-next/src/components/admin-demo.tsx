"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenText, CheckCheck, FilePenLine, Inbox, LayoutDashboard, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";

const demoItems = [
  {title:"Conseil & stratégie digitale",type:"Expertise",category:"Conseil",published:true,description:"Cadrage du besoin, conception et feuille de route."},
  {title:"Développement d'applications",type:"Formation",category:"Développement",published:false,description:"Ateliers pratiques et accompagnement méthodologique."},
  {title:"SCOLIA Pro",type:"Logiciel",category:"Gestion scolaire",published:true,description:"Conception d'une plateforme de gestion scolaire."},
  {title:"Sites & plateformes web",type:"Expertise",category:"Développement",published:true,description:"Interfaces rapides et architecture évolutive."}
];

export function AdminDemo() {
  const [tab,setTab] = useState<"overview"|"catalogue"|"messages">("overview");
  const [itemIndex,setItemIndex] = useState<number | null>(null);

  return <div className="admin-layout shell admin-demo">
    <div className="admin-demo-banner" role="status"><ShieldCheck size={17}/>
      <div><strong>Mode démonstration — données fictives.</strong> Aucun compte, message ni contenu réel n'est accessible ou modifié sur cette page.</div>
      <Link href="/admin">Administration réelle <ArrowRight size={14}/></Link>
    </div>
    <div className="admin-head">
      <div><div className="eyebrow eyebrow-dark">JP-SERVICES / APERÇU DE LA CONSOLE</div><h1>Votre espace de pilotage<span>.</span></h1><p>Une interface de gestion conçue pour aller à l'essentiel.</p></div>
      <div className="admin-head-actions"><Link className="btn btn-outline" href="/"><ArrowLeft size={16}/> Retour au site</Link><Link className="admin-logout" href="/admin"><LockKeyhole size={16}/> Accès privé</Link></div>
    </div>
    <nav className="admin-tabs" aria-label="Modules de démonstration">
      <button type="button" className={tab==="overview"?"active":""} aria-current={tab==="overview"?"page":undefined} onClick={()=>setTab("overview")}><LayoutDashboard size={18}/> Tableau de bord</button>
      <button type="button" className={tab==="catalogue"?"active":""} aria-current={tab==="catalogue"?"page":undefined} onClick={()=>setTab("catalogue")}><BookOpenText size={18}/> Catalogue</button>
      <button type="button" className={tab==="messages"?"active":""} aria-current={tab==="messages"?"page":undefined} onClick={()=>setTab("messages")}><Inbox size={18}/> Messages</button>
    </nav>

    {tab==="overview" && <section className="admin-panel">
      <div className="admin-panel-header"><div><span className="admin-kicker">VUE GLOBALE — EXEMPLE</span><h2>Tableau de bord</h2><p>Exemple illustratif de synthèse éditoriale.</p></div></div>
      <div className="admin-stats">
        <div><BookOpenText size={20}/><strong>04</strong><span>Contenus d'exemple</span></div>
        <div><CheckCheck size={20}/><strong>03</strong><span>Fiches de démonstration publiées</span></div>
        <div><FilePenLine size={20}/><strong>01</strong><span>Brouillon fictif</span></div>
        <div><Inbox size={20}/><strong>00</strong><span>Messages réels (aucun accès)</span></div>
      </div>
      <div className="admin-panel-steps">
        <div><strong>Organiser le catalogue</strong><p>Préparez les descriptions et vérifiez chaque information avant publication.</p><button type="button" onClick={()=>setTab("catalogue")}>Voir les fiches de démonstration <ArrowRight size={15}/></button></div>
        <div><strong>Suivre les conversations</strong><p>La vraie console classe les messages reçus dans un espace privé.</p><button type="button" onClick={()=>setTab("messages")}>Voir la vue de messagerie <ArrowRight size={15}/></button></div>
      </div>
    </section>}
    {tab==="catalogue" && <section className="admin-panel">
      <div className="admin-panel-header"><div><span className="admin-kicker">GESTION DES CONTENUS — EXEMPLE</span><h2>Catalogue éditorial</h2><p>Les fiches ci-dessous sont fictives et non modifiables.</p></div><span className="admin-status draft">Lecture seule</span></div>
      <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Contenu</th><th>Type</th><th>Statut fictif</th><th>Détails</th></tr></thead>
      <tbody>{demoItems.map((item,i)=><tr key={item.title}>
        <td><strong>{item.title}</strong><small>{item.category}</small></td><td>{item.type}</td><td><span className={item.published?"admin-status published":"admin-status draft"}>{item.published?"Exemple publié":"Brouillon d'exemple"}</span></td>
        <td><button className="admin-edit" type="button" onClick={()=>setItemIndex(itemIndex===i?null:i)}>Consulter <ArrowRight size={14}/></button></td>
      </tr>)}</tbody></table></div>
      {itemIndex!==null && <div className="admin-demo-detail" role="region" aria-label="Description de la fiche">
        <h3>{demoItems[itemIndex].title}</h3><p>{demoItems[itemIndex].description}</p><button type="button" onClick={()=>setItemIndex(null)}>Refermer</button>
      </div>}
    </section>}
    {tab==="messages" && <section className="admin-panel">
      <div className="admin-panel-header"><div><span className="admin-kicker">MESSAGERIE — PRÉSENTATION</span><h2>Boîte de réception</h2><p>Les messages ne sont jamais exposés publiquement.</p></div><span className="admin-status draft">Aucune donnée réelle</span></div>
      <div className="admin-demo-mail"><Inbox size={30}/><h3>Une messagerie privée et organisée.</h3><p>Après configuration sécurisée de PostgreSQL, les messages seront disponibles ici avec leurs statuts de lecture. Aucun message n'est simulé comme étant réellement reçu.</p><Link className="btn btn-outline" href="/admin">Ouvrir l'administration privée <ArrowRight size={16}/></Link></div>
    </section>}
  </div>;
}
