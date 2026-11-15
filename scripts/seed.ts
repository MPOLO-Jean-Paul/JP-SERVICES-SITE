import "dotenv/config";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../src/server/db/schema";

/**
 * Données de démarrage : paramètres du site, catégories de logiciels et, hors
 * production, un compte administrateur + un jeu de contenus de démonstration.
 *
 *   pnpm db:seed                       → paramètres + catégories (sans danger en production)
 *   SEED_DEMO=1 pnpm db:seed           → ajoute contenus de démonstration
 *   ADMIN_EMAIL=… ADMIN_PASSWORD=… pnpm db:seed → crée/promeut un administrateur
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL est requis.");
  const connection = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(connection, { schema });

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
    ["contact_email", "contact@jp-services.com"],
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

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await db
      .insert(schema.users)
      .values({ nom: "Administrateur", prenom: "JP-Services", email: adminEmail, motDePasse: hash, role: "admin", isActive: 1 })
      .onConflictDoUpdate({ target: schema.users.email, set: { role: "admin", isActive: 1, motDePasse: hash } });
    console.log(`✔ Administrateur prêt : ${adminEmail}`);
  }

  if (process.env.SEED_DEMO === "1") {
    const [{ count }] = (await db.select({ count: sql<number>`COUNT(*)` }).from(schema.formations)) as [{ count: number }];
    if (Number(count) === 0) {
      const d = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
      await db.insert(schema.formations).values([
        { titre: "Développement web moderne (HTML, CSS, JavaScript)", description: "Apprenez à concevoir des sites web professionnels : structure HTML sémantique, mise en page CSS moderne, interactivité JavaScript et mise en ligne.\n\nChaque module alterne explications, démonstrations et exercices pratiques sur un projet fil rouge.", prix: "120.00", niveau: "Débutant", dateDebut: d(21), duree: "8 semaines", modulesListe: "Bases du web et HTML\nMise en page CSS et responsive\nJavaScript : fondamentaux\nJavaScript : DOM et événements\nProjet final et mise en ligne", joursPossibles: "Lundi,Mercredi,Vendredi,Samedi", heureDebutDefaut: "09:00:00", heureFinDefaut: "12:00:00" },
        { titre: "Bureautique professionnelle : Word, Excel et PowerPoint", description: "Maîtrisez les outils bureautiques indispensables en entreprise : documents structurés, tableaux et formules, présentations impactantes.", prix: "60.00", niveau: "Tous niveaux", dateDebut: d(10), duree: "4 semaines", modulesListe: "Word : documents longs et modèles\nExcel : formules et tableaux croisés\nPowerPoint : présentations efficaces\nAtelier de synthèse", joursPossibles: "Lundi,Mardi,Jeudi", heureDebutDefaut: "14:00:00", heureFinDefaut: "17:00:00" },
        { titre: "Marketing digital et réseaux sociaux", description: "Construisez une présence en ligne cohérente : stratégie de contenu, création visuelle avec Canva, publicité et mesure des résultats.", prix: "0.00", niveau: "Intermédiaire", dateDebut: d(35), duree: "6 semaines", modulesListe: "Stratégie et personas\nCréation de contenu et Canva\nPublicité Facebook et Instagram\nAnalyse et reporting", joursPossibles: "Mardi,Jeudi,Samedi", heureDebutDefaut: "10:00:00", heureFinDefaut: "13:00:00" },
        { titre: "Analyse de données avec Excel et Power BI", description: "Transformez des données brutes en tableaux de bord décisionnels : nettoyage, modélisation, visualisations et partage.", prix: "150.00", niveau: "Avancé", dateDebut: d(45), duree: "5 semaines", modulesListe: "Préparer et nettoyer les données\nModéliser avec Power Query\nVisualiser avec Power BI\nPublier et automatiser", joursPossibles: "Mercredi,Vendredi", heureDebutDefaut: "15:00:00", heureFinDefaut: "18:00:00" },
      ]);
      await db.insert(schema.actualites).values([
        { titre: "Ouverture des inscriptions pour la session de rentrée", contenu: "Les inscriptions aux prochaines formations sont ouvertes. Découvrez le catalogue, comparez les niveaux et réservez votre place. Un accompagnement personnalisé est proposé à chaque apprenant dès la première semaine.", media: "" },
        { titre: "SCOLIA Pro : la gestion scolaire sans Excel", contenu: "JP-Services présente SCOLIA Pro, son logiciel de gestion scolaire pour les établissements privés : secrétariat, caisse, recouvrement, scolarité, personnel et paie, avec reçus numérotés et journal d'audit.", media: "" },
        { titre: "Nouvelles sessions en visioconférence", contenu: "Les formations en ligne reprennent chaque semaine. Rejoignez une salle depuis votre navigateur, sans installation, et posez vos questions en direct aux formateurs.", media: "" },
      ]);
      await db.insert(schema.logiciels).values([
        { categorieId: 7, nom: "SCOLIA Pro", description: "Logiciel de gestion scolaire professionnel : secrétariat, caisse, recouvrement, scolarité, personnel et paie. Installateur Windows autonome, multiposte et sauvegardes vérifiées.", version: "1.2", tailleOctets: 98_000_000, plateforme: "Windows 10/11 (x64)", licence: "Licence établissement", lienExterne: `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/scolia`, telechargements: 128, statut: "publie" },
        { categorieId: 2, nom: "Visual Studio Code", description: "Éditeur de code gratuit et extensible utilisé dans les formations de développement web.", version: "1.9x", tailleOctets: 95_000_000, plateforme: "Windows, macOS, Linux", licence: "Gratuit", lienExterne: "https://code.visualstudio.com/", telechargements: 342, statut: "publie" },
        { categorieId: 1, nom: "LibreOffice", description: "Suite bureautique libre et complète : traitement de texte, tableur et présentations.", version: "24.x", tailleOctets: 350_000_000, plateforme: "Windows, macOS, Linux", licence: "Libre (MPL)", lienExterne: "https://fr.libreoffice.org/", telechargements: 210, statut: "publie" },
      ]);
      await db.insert(schema.equipe).values([
        { nom: "Équipe pédagogique", role: "Formation et accompagnement", email: "contact@jp-services.com", linkedin: null, ordre: 1 },
      ]);
      await db.insert(schema.partenaires).values([
        { nom: "Institut Technique de Lubumbashi", description: "Établissement partenaire pour les formations bureautiques et la gestion scolaire.", siteWeb: "", typePartenariat: "Formation et éducation", ordre: 1, actif: 1 },
      ]);
      const live = new Date(Date.now() + 3 * 86_400_000);
      live.setHours(18, 0, 0, 0);
      await db.insert(schema.liveSessions).values([
        { formationId: 1, titre: "Atelier découverte : créer sa première page web", description: "Session d'introduction en direct, ouverte à tous.", formateur: "Équipe JP-Services", roomName: "JPServicesAtelierWeb" + Math.random().toString(36).slice(2, 8), dateDebut: live, dureeMinutes: 90, acces: "public", statut: "planifiee" },
      ]);
      console.log("✔ Contenus de démonstration insérés.");
    } else {
      console.log("• Contenus déjà présents : démonstration ignorée.");
    }
  }

  // Les identifiants insérés explicitement (catégories) ne doivent pas bloquer les prochaines insertions.
  await connection.unsafe("SELECT setval(pg_get_serial_sequence('logiciel_categories', 'id'), (SELECT COALESCE(MAX(id), 1) FROM logiciel_categories))");
  await connection.end();
  console.log("✔ Seed terminé.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
