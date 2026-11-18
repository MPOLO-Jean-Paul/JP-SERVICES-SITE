import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../src/server/db/schema";

/** Données de base d’une installation neuve (idempotent : rien n’est écrasé). */
export async function ensureBaseData(db: PostgresJsDatabase<typeof schema>) {
  const settings: Array<[string, string]> = [
    ["annonce_texte", "De nouvelles sessions sont ouvertes. Formez-vous à votre rythme avec un accompagnement concret."],
    ["annonce_url", "/formations"],
    ["annonce_lien_label", "Découvrir les formations"],
    ["logiciels_intro", "Retrouvez ici les logiciels et outils recommandés par JP-Services : utilitaires, environnements de développement et applications utilisés pendant nos formations. Chaque fiche indique la version, la plateforme et la licence."],
    ["partenariat_intro", "JP-Services grandit grâce à des partenaires qui partagent la même ambition : rendre les compétences numériques accessibles. Découvrez nos partenaires actuels et proposez une collaboration."],
    ["auth_showcase_badge", "ESPACE MEMBRE"],
    ["auth_showcase_title", "Votre parcours numérique, au même endroit."],
    ["auth_register_title", "Créer votre compte"],
    ["auth_register_intro", "Rejoignez les formations, les outils et la communauté JP-Services."],
    ["contact_telephone", "+243 977 152 825"],
    ["contact_whatsapp", "243860951131"],
    ["contact_email", "contact@jp-services.org"],
    ["contact_adresse", "Lubumbashi, République démocratique du Congo"],
    ["social_facebook", "https://www.facebook.com/groups/1236192878705291"],
    ["social_linkedin", "https://www.linkedin.com/in/jp-services-b51940381"],
    ["social_youtube", "https://www.youtube.com/@jp-services-v8d"],
    ["social_tiktok", ""],
  ];
  for (const [cle, valeur] of settings) {
    await db.insert(schema.siteSettings).values({ cle, valeur }).onConflictDoNothing();
  }

  const categories = [
    { id: 1, nom: "Bureautique", slug: "bureautique", icone: "file-text", ordre: 1 },
    { id: 2, nom: "Développement", slug: "developpement", icone: "code", ordre: 2 },
    { id: 3, nom: "Design et création", slug: "design", icone: "pen-tool", ordre: 3 },
    { id: 4, nom: "Sécurité", slug: "securite", icone: "shield", ordre: 4 },
    { id: 5, nom: "Utilitaires", slug: "utilitaires", icone: "wrench", ordre: 5 },
    { id: 6, nom: "Mobile", slug: "mobile", icone: "smartphone", ordre: 6 },
    { id: 7, nom: "Gestion scolaire", slug: "gestion-scolaire", icone: "graduation-cap", ordre: 7 },
  ];
  for (const c of categories) {
    await db.insert(schema.logicielCategories).values(c).onConflictDoNothing();
  }
}
