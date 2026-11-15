"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowDownToLine, ArrowLeft, ArrowRight, BookOpenText, CheckCheck, CircleAlert, Eye, EyeOff, Inbox, LayoutDashboard, LoaderCircle, LockKeyhole, LogOut, Plus, RefreshCw, Save, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Kind } from "@/lib/content";

type Overview = { catalogue: { total: number; published: number; drafts: number }; inbox: { total: number; unread: number } };
type AdminItem = {
  id?: string;
  type: Kind;
  slug: string;
  category: string;
  title: string;
  description: string;
  detail: string;
  status: string;
  published: boolean;
  sort_order: number;
};
type AdminMessage = {
  id: string; name: string; email: string; subject: string; message: string; created_at: string; read_at: string | null;
};
type Tab = "overview" | "catalogue" | "messages";
type Mode = "loading" | "locked" | "ready" | "unconfigured";
const freshItem: AdminItem = {
  type: "service", slug: "", category: "", title: "", description: "", detail: "",
  status: "", published: false, sort_order: 0
};
const pathsByType: Record<Kind, string> = {
  service: "/services", formation: "/formations", logiciel: "/logiciels", projet: "/projets", actualite: "/actualites"
};
const categories: { value: Kind; label: string }[] = [
  {value:"service",label:"Expertise"},{value:"formation",label:"Formation"},
  {value:"logiciel",label:"Logiciel"},{value:"projet",label:"Projet"},{value:"actualite",label:"Actualité"}
];

function formatDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("fr-CD", { dateStyle: "medium", timeStyle: "short" }).format(d);
}
async function parseJson(response: Response) {
  try { return await response.json() as Record<string, unknown>; } catch { return {}; }
}
function errorText(data: Record<string, unknown>, fallback: string) {
  return typeof data.message === "string" ? data.message : fallback;
}
function slugify(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}

export function AdminConsole() {
  const [mode, setMode] = useState<Mode>("loading");
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState("");
  const [catalogueQuery, setCatalogueQuery] = useState("");
  const [selected, setSelected] = useState<AdminItem | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      const data = await parseJson(response);
      if (response.status === 401) { setMode("locked"); return; }
      if (response.status === 503) { setMode("unconfigured"); setAlert(errorText(data, "Service indisponible.")); return; }
      if (!response.ok) throw new Error(errorText(data, "Impossible de charger le tableau de bord."));
      setOverview(data as unknown as Overview);
      setMode("ready");
    } catch (error) {
      setMode("unconfigured");
      setAlert(error instanceof Error ? error.message : "Connexion impossible.");
    }
  }, []);

  useEffect(() => { void fetchOverview(); }, [fetchOverview]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setAlert("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({username, password})
      });
      const data = await parseJson(response);
      if (!response.ok) { setAlert(errorText(data, "Connexion refusée.")); return; }
      setPassword("");
      await fetchOverview();
    } catch { setAlert("Impossible de joindre le serveur."); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true);
    try { await fetch("/api/admin/logout", {method:"POST"}); }
    finally {
      setMode("locked"); setOverview(null); setItems([]); setMessages([]); setSelected(null);
      setTab("overview"); setBusy(false); setAlert("");
    }
  }

  async function changeTab(next: Tab) {
    setTab(next); setAlert("");
    if (next === "overview") { await fetchOverview(); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/" + (next === "catalogue" ? "catalogue" : "messages"), {cache:"no-store"});
      const data = await parseJson(response);
      if (response.status === 401) { setMode("locked"); return; }
      if (!response.ok) throw new Error(errorText(data, "Chargement impossible."));
      if (next === "catalogue") setItems(Array.isArray(data.items) ? data.items as AdminItem[] : []);
      else setMessages(Array.isArray(data.items) ? data.items as AdminMessage[] : []);
    } catch(error) { setAlert(error instanceof Error ? error.message : "Chargement impossible."); }
    finally { setBusy(false); }
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || busy) return;
    setBusy(true); setAlert("");
    try {
      const response = await fetch("/api/admin/catalogue", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(selected)
      });
      const data = await parseJson(response);
      if (response.status === 401) { setMode("locked"); return; }
      if (!response.ok) throw new Error(errorText(data, "Enregistrement impossible."));
      setSelected(null);
      setAlert("Le contenu a été enregistré.");
      const refreshed = await fetch("/api/admin/catalogue", {cache:"no-store"});
      const content = await parseJson(refreshed);
      if (refreshed.ok && Array.isArray(content.items)) setItems(content.items as AdminItem[]);
      await fetchOverview();
    } catch(error) { setAlert(error instanceof Error ? error.message : "Enregistrement impossible."); }
    finally { setBusy(false); }
  }

  async function toggleRead(message: AdminMessage) {
    setBusy(true); setAlert("");
    try {
      const response = await fetch("/api/admin/messages", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:message.id,read:!message.read_at})
      });
      const data = await parseJson(response);
      if (!response.ok) throw new Error(errorText(data, "Modification impossible."));
      await changeTab("messages");
      await fetchOverview();
    } catch(error) { setAlert(error instanceof Error ? error.message : "Modification impossible."); }
    finally { setBusy(false); }
  }

  if (mode === "loading") return <div className="admin-loading" role="status"><LoaderCircle size={24}/> Vérification de l'accès sécurisé…</div>;

  if (mode === "unconfigured") return <div className="admin-entry">
    <div className="admin-entry-label"><ShieldCheck size={18}/> ESPACE PRIVÉ JP-SERVICES</div>
    <h1>Administration en préparation.</h1>
    <p>Le panneau est disponible dans l'application, mais l'accès est désactivé tant que les identifiants de sécurité et la base PostgreSQL n'ont pas été configurés.</p>
    <div className="admin-entry-alert" role="status"><CircleAlert size={18}/> {alert || "Configuration serveur nécessaire."}</div>
    <div className="admin-preview-links"><Link className="btn btn-primary" href="/admin/demo">Voir la console en démonstration <ArrowRight size={16}/></Link><Link className="btn btn-outline" href="/"><ArrowLeft size={16}/> Retour au site</Link></div>
  </div>;

  if (mode === "locked") return <div className="admin-entry">
    <div className="admin-entry-label"><ShieldCheck size={18}/> ESPACE PRIVÉ JP-SERVICES</div>
    <h1>Accès administrateur.</h1>
    <p>Accédez à votre espace de pilotage pour publier des contenus et consulter les messages.</p>
    <form className="admin-login-form" onSubmit={login}>
      <label htmlFor="admin-username">Identifiant</label>
      <input id="admin-username" name="username" value={username} maxLength={80} autoComplete="username" required onChange={event=>setUsername(event.target.value)} placeholder="Votre identifiant"/>
      <label htmlFor="admin-password">Mot de passe</label>
      <div className="admin-password-wrap">
        <input id="admin-password" type={showPassword?"text":"password"} name="password" value={password} minLength={8} maxLength={256} autoComplete="current-password" required onChange={event=>setPassword(event.target.value)} placeholder="Votre mot de passe"/>
        <button type="button" aria-label={showPassword?"Masquer le mot de passe":"Afficher le mot de passe"} onClick={()=>setShowPassword(value=>!value)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button>
      </div>
      {alert && <p className="admin-form-error" role="alert">{alert}</p>}
      <button className="btn btn-primary" disabled={busy} type="submit"><LockKeyhole size={17}/>{busy?"Vérification…":"Se connecter"}</button>
    </form>
    <Link className="admin-back-link" href="/"><ArrowLeft size={15}/> Retourner au site</Link>
  </div>;

  const filtered = items.filter(item=>[item.title,item.category,item.type,item.slug].join(" ").toLocaleLowerCase("fr").includes(catalogueQuery.toLocaleLowerCase("fr")));

  return <div className="admin-layout shell">
    <div className="admin-head">
      <div><div className="eyebrow eyebrow-dark">JP-SERVICES / ADMINISTRATION</div><h1>Console de pilotage<span>.</span></h1><p>Des contenus clairs, un suivi simple et des données maîtrisées.</p></div>
      <div className="admin-head-actions"><Link className="btn btn-outline" href="/" target="_blank" rel="noopener noreferrer">Voir le site <ArrowRight size={16}/></Link><button className="admin-logout" type="button" disabled={busy} onClick={logout}><LogOut size={17}/> Déconnexion</button></div>
    </div>
    <nav className="admin-tabs" aria-label="Navigation de la console">
      <button type="button" aria-current={tab==="overview"?"page":undefined} className={tab==="overview"?"active":""} onClick={()=>changeTab("overview")}><LayoutDashboard size={18}/> Tableau de bord</button>
      <button type="button" aria-current={tab==="catalogue"?"page":undefined} className={tab==="catalogue"?"active":""} onClick={()=>changeTab("catalogue")}><BookOpenText size={18}/> Catalogue</button>
      <button type="button" aria-current={tab==="messages"?"page":undefined} className={tab==="messages"?"active":""} onClick={()=>changeTab("messages")}><Inbox size={18}/> Messages {Boolean(overview?.inbox.unread) && <span className="admin-unread">{overview?.inbox.unread}</span>}</button>
    </nav>
    {alert && <div role="status" className="admin-notice">{alert}</div>}

    {tab==="overview" && <section className="admin-panel">
      <div className="admin-panel-header"><div><span className="admin-kicker">SYNTHÈSE</span><h2>Vue d'ensemble</h2><p>Indicateurs calculés depuis PostgreSQL.</p></div><button className="admin-refresh" disabled={busy} type="button" onClick={fetchOverview}><RefreshCw size={17}/> Actualiser</button></div>
      <div className="admin-stats">
        <div><BookOpenText size={20}/><strong>{overview?.catalogue.total ?? "—"}</strong><span>Contenus enregistrés</span></div>
        <div><CheckCheck size={20}/><strong>{overview?.catalogue.published ?? "—"}</strong><span>Publications actives</span></div>
        <div><EyeOff size={20}/><strong>{overview?.catalogue.drafts ?? "—"}</strong><span>Brouillons</span></div>
        <div><Inbox size={20}/><strong>{overview?.inbox.unread ?? "—"}</strong><span>Messages non lus</span></div>
      </div>
      <div className="admin-panel-steps">
        <div><strong>Gérer les contenus</strong><p>Organisez les rubriques et publiez uniquement les fiches vérifiées.</p><button type="button" onClick={()=>changeTab("catalogue")}>Ouvrir le catalogue <ArrowRight size={15}/></button></div>
        <div><strong>Suivre les demandes</strong><p>Retrouvez vos contacts au même endroit, sans exposer les échanges publiquement.</p><button type="button" onClick={()=>changeTab("messages")}>Consulter les messages <ArrowRight size={15}/></button></div>
      </div>
    </section>}

    {tab==="catalogue" && <section className="admin-panel">
      <div className="admin-panel-header"><div><span className="admin-kicker">GESTION ÉDITORIALE</span><h2>Catalogue</h2><p>Création, modification et publication des fiches.</p></div><button className="btn btn-primary" type="button" disabled={busy} onClick={()=>setSelected({...freshItem})}><Plus size={17}/> Nouveau contenu</button></div>
      <div className="admin-catalogue-toolbar"><label><Search size={17}/><input value={catalogueQuery} maxLength={80} onChange={e=>setCatalogueQuery(e.target.value)} aria-label="Filtrer les contenus" placeholder="Filtrer les contenus…"/></label><span>{filtered.length} éléments</span></div>
      <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Contenu</th><th>Type</th><th>Publication</th><th>Action</th></tr></thead><tbody>{filtered.map(item=><tr key={item.id}>
        <td><strong>{item.title}</strong><small>{item.category} · /{item.slug}</small></td>
        <td>{categories.find(x=>x.value===item.type)?.label}</td>
        <td><span className={item.published?"admin-status published":"admin-status draft"}>{item.published?"Publié":"Brouillon"}</span></td>
        <td><button type="button" className="admin-edit" onClick={()=>setSelected({...item})}>Modifier <ArrowRight size={14}/></button></td>
      </tr>)}</tbody></table></div>
      {filtered.length===0 && <p className="admin-empty">Aucun contenu enregistré pour cette recherche.</p>}
    </section>}

    {tab==="messages" && <section className="admin-panel">
      <div className="admin-panel-header"><div><span className="admin-kicker">MESSAGERIE PRIVÉE</span><h2>Messages reçus</h2><p>Conservez un suivi clair des demandes entrantes.</p></div><button type="button" className="admin-refresh" onClick={()=>changeTab("messages")} disabled={busy}><RefreshCw size={17}/> Actualiser</button></div>
      <div className="admin-message-stack">{messages.map(msg=><article className={msg.read_at?"admin-message":"admin-message unread"} key={msg.id}>
        <div className="admin-message-head"><span className="admin-status draft">{msg.read_at?"Lu":"Non lu"}</span><time dateTime={msg.created_at}>{formatDate(msg.created_at)}</time></div>
        <h3>{msg.subject}</h3><p className="admin-message-sender">{msg.name} · <a href={"mailto:"+encodeURIComponent(msg.email)}>{msg.email}</a></p>
        <p className="admin-message-body">{msg.message}</p>
        <button type="button" disabled={busy} onClick={()=>toggleRead(msg)}>{msg.read_at?"Marquer comme non lu":"Marquer comme lu"} <CheckCheck size={16}/></button>
      </article>)}</div>
      {messages.length===0 && <p className="admin-empty">Aucun message enregistré.</p>}
    </section>}

    {selected && <div className="admin-editor-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setSelected(null);}}>
      <div className="admin-editor" role="dialog" aria-modal="true" aria-labelledby="admin-edit-title">
        <div className="admin-editor-title"><div><span className="admin-kicker">ÉDITION</span><h2 id="admin-edit-title">{selected.id?"Modifier le contenu":"Ajouter un contenu"}</h2></div><button type="button" aria-label="Fermer l'éditeur" onClick={()=>setSelected(null)}>×</button></div>
        <form onSubmit={saveItem} className="admin-editor-form">
          <label>Rubrique<select value={selected.type} onChange={e=>setSelected({...selected,type:e.target.value as Kind})}>{categories.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
          <label>Titre<input required minLength={4} maxLength={180} value={selected.title} onChange={e=>setSelected({...selected,title:e.target.value,...(!selected.id?{slug:slugify(e.target.value)}:{})})}/></label>
          <label>Identifiant d'URL<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={90} value={selected.slug} onChange={e=>setSelected({...selected,slug:slugify(e.target.value)})}/></label>
          <label>Catégorie<input required minLength={2} maxLength={80} value={selected.category} onChange={e=>setSelected({...selected,category:e.target.value})}/></label>
          <label>Résumé<textarea required minLength={12} maxLength={480} rows={3} value={selected.description} onChange={e=>setSelected({...selected,description:e.target.value})}/></label>
          <label>Description complète<textarea maxLength={4000} rows={5} value={selected.detail} onChange={e=>setSelected({...selected,detail:e.target.value})}/></label>
          <label>Statut éditorial<input maxLength={100} placeholder="Ex. En développement" value={selected.status} onChange={e=>setSelected({...selected,status:e.target.value})}/></label>
          <label>Ordre d'affichage<input type="number" min={0} max={100000} value={selected.sort_order} onChange={e=>setSelected({...selected,sort_order:Number(e.target.value)})}/></label>
          <label className="admin-publish-checkbox"><input type="checkbox" checked={selected.published} onChange={e=>setSelected({...selected,published:e.target.checked})}/><span>Publier ce contenu sur le site</span></label>
          <p className="admin-editor-help">Les nouvelles fiches sont créées en brouillon. Publiez uniquement des informations vérifiées.</p>
          <div className="admin-editor-actions"><button type="button" className="btn btn-outline" onClick={()=>setSelected(null)}>Annuler</button><button type="submit" className="btn btn-primary" disabled={busy}><Save size={17}/>{busy?"Enregistrement…":"Enregistrer"}</button></div>
        </form>
      </div>
    </div>}
  </div>;
}
