import "server-only";
import { cache } from "react";
import { db, schema } from "@/server/db";

export const DEFAULT_SETTINGS: Record<string, string> = {
  annonce_texte: "",
  annonce_url: "/formations",
  annonce_lien_label: "Découvrir les formations",
  logiciels_intro: "Téléchargez les logiciels et outils recommandés par JP-Services.",
  partenariat_intro: "JP-Services grandit grâce à des partenaires qui partagent la même ambition : rendre les compétences numériques accessibles.",
  auth_showcase_badge: "ESPACE MEMBRE",
  auth_showcase_title: "Votre parcours numérique, au même endroit.",
  auth_register_title: "Créer votre compte",
  auth_register_intro: "Rejoignez les formations, les outils et la communauté JP-Services.",
  contact_telephone: "+243 977 152 825",
  contact_whatsapp: "243860951131",
  contact_email: "contact@jp-services.org",
  contact_adresse: "Lubumbashi, République démocratique du Congo",
  social_facebook: "https://www.facebook.com/groups/1236192878705291",
  social_linkedin: "https://www.linkedin.com/in/jp-services-b51940381",
  social_youtube: "https://www.youtube.com/@jp-services-v8d",
  social_tiktok: "",
  temoignage_1_auteur: "",
  temoignage_1_fonction: "",
  temoignage_1_citation: "",
  temoignage_1_publier: "",
  temoignage_2_auteur: "",
  temoignage_2_fonction: "",
  temoignage_2_citation: "",
  temoignage_2_publier: "",
  temoignage_3_auteur: "",
  temoignage_3_fonction: "",
  temoignage_3_citation: "",
  temoignage_3_publier: "",
};

export const SETTING_FIELDS: Array<{ key: keyof typeof DEFAULT_SETTINGS & string; label: string; help: string; multiline?: boolean; toggle?: boolean; group: string }> = [
  { key: "annonce_texte", label: "Texte du bandeau d’annonce", help: "Laisser vide pour masquer le bandeau en haut du site.", group: "Annonce" },
  { key: "annonce_url", label: "Lien du bandeau", help: "Chemin interne (/formations) ou URL complète.", group: "Annonce" },
  { key: "annonce_lien_label", label: "Libellé du lien", help: "", group: "Annonce" },
  { key: "logiciels_intro", label: "Introduction de la page Logiciels", help: "", multiline: true, group: "Pages" },
  { key: "partenariat_intro", label: "Introduction de la page Partenariat", help: "", multiline: true, group: "Pages" },
  { key: "auth_showcase_badge", label: "Badge de l’écran de connexion", help: "", group: "Authentification" },
  { key: "auth_showcase_title", label: "Titre de l’écran de connexion", help: "", group: "Authentification" },
  { key: "auth_register_title", label: "Titre de l’inscription", help: "", group: "Authentification" },
  { key: "auth_register_intro", label: "Introduction de l’inscription", help: "", multiline: true, group: "Authentification" },
  { key: "contact_telephone", label: "Téléphone", help: "", group: "Coordonnées" },
  { key: "contact_whatsapp", label: "Numéro WhatsApp", help: "Format international sans « + » (ex. 243860951131).", group: "Coordonnées" },
  { key: "contact_email", label: "Adresse e-mail publique", help: "", group: "Coordonnées" },
  { key: "contact_adresse", label: "Adresse", help: "", group: "Coordonnées" },
  { key: "social_facebook", label: "Facebook", help: "", group: "Réseaux sociaux" },
  { key: "social_linkedin", label: "LinkedIn", help: "", group: "Réseaux sociaux" },
  { key: "social_youtube", label: "YouTube", help: "", group: "Réseaux sociaux" },
  { key: "social_tiktok", label: "TikTok", help: "", group: "Réseaux sociaux" },
  { key: "temoignage_1_auteur", label: "Témoignage 1 · Auteur", help: "Nom affiché uniquement avec son accord.", group: "Témoignages" },
  { key: "temoignage_1_fonction", label: "Témoignage 1 · Contexte", help: "Ex. participant à une formation (uniquement si confirmé).", group: "Témoignages" },
  { key: "temoignage_1_citation", label: "Témoignage 1 · Citation réelle", help: "Reproduire fidèlement une citation recueillie auprès de la personne.", multiline: true, group: "Témoignages" },
  { key: "temoignage_1_publier", label: "Publier le témoignage 1", help: "Cocher seulement après avoir obtenu l'autorisation de publication de l'auteur.", toggle: true, group: "Témoignages" },
  { key: "temoignage_2_auteur", label: "Témoignage 2 · Auteur", help: "Nom affiché uniquement avec son accord.", group: "Témoignages" },
  { key: "temoignage_2_fonction", label: "Témoignage 2 · Contexte", help: "Fonction ou expérience réelle.", group: "Témoignages" },
  { key: "temoignage_2_citation", label: "Témoignage 2 · Citation réelle", help: "Ne pas inventer ni modifier le sens du témoignage.", multiline: true, group: "Témoignages" },
  { key: "temoignage_2_publier", label: "Publier le témoignage 2", help: "Confirmer l'autorisation de publication.", toggle: true, group: "Témoignages" },
  { key: "temoignage_3_auteur", label: "Témoignage 3 · Auteur", help: "Nom affiché uniquement avec son accord.", group: "Témoignages" },
  { key: "temoignage_3_fonction", label: "Témoignage 3 · Contexte", help: "Fonction ou expérience réelle.", group: "Témoignages" },
  { key: "temoignage_3_citation", label: "Témoignage 3 · Citation réelle", help: "Ne publier que des retours authentiques.", multiline: true, group: "Témoignages" },
  { key: "temoignage_3_publier", label: "Publier le témoignage 3", help: "Confirmer l'autorisation de publication.", toggle: true, group: "Témoignages" },
];

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    const rows = await db.select().from(schema.siteSettings);
    const map = { ...DEFAULT_SETTINGS };
    for (const row of rows) if (row.valeur !== null) map[row.cle] = row.valeur;
    return map;
  } catch (error) {
    console.error("settings", error);
    return { ...DEFAULT_SETTINGS };
  }
});

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const all = await getSettings();
  const value = (all[key] ?? "").trim();
  return value || fallback;
}
