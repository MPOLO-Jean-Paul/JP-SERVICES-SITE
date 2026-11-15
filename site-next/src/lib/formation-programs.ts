import type { CatalogueItem } from "@/lib/content";
import { offerings } from "@/lib/content";

/**
 * Programmes éditoriaux indicatifs de préproduction.
 * Les prix, dates, durées, intervenants et certificats ne sont pas annoncés.
 * Ils ne deviennent pas des offres contractuelles sans validation métier.
 */
export type FormationModule = { title: string; description: string; topics: readonly string[] };
export type FormationProgram = {
  seedId: string;
  slug: string;
  eyebrow: string;
  promise: string;
  introduction: string;
  audience: string;
  prerequisites: string;
  outcomes: readonly string[];
  modules: readonly FormationModule[];
  practical: string;
};

export const formationPrograms: readonly FormationProgram[] = [
  {
    seedId: "formation-dev",
    slug: "developpement-applications",
    eyebrow: "DÉVELOPPEMENT & PRODUIT",
    promise: "Passez d'une idée à un prototype d'application.",
    introduction: "Un parcours de découverte pour comprendre comment structurer, développer et tester une application. Les exemples et outils définitifs sont à préciser avec l'équipe pédagogique.",
    audience: "Personnes qui souhaitent découvrir ou renforcer les bases du développement d'applications.",
    prerequisites: "Une utilisation courante de l'ordinateur est utile. Le niveau technique sera défini selon les participants.",
    outcomes: [
      "Identifier les besoins et fonctions essentielles d'un projet",
      "Organiser les écrans et les données d'une application simple",
      "Comprendre les étapes de développement et de test",
      "Présenter une première réalisation à partir d'un cas pratique"
    ],
    modules: [
      { title: "Comprendre un projet numérique", description: "Du problème utilisateur aux premières spécifications.", topics: ["Analyse du besoin", "Fonctionnalités prioritaires", "Parcours utilisateurs"] },
      { title: "Dessiner l'expérience", description: "Traduire les besoins en écrans et interactions cohérents.", topics: ["Maquettes", "Navigation", "Accessibilité"] },
      { title: "Construire les premiers composants", description: "Relier les interfaces, la logique et les informations.", topics: ["Structure d'un projet", "Composants", "Notions de données"] },
      { title: "Tester et améliorer", description: "Vérifier que les cas essentiels fonctionnent.", topics: ["Scénarios de test", "Correction des anomalies", "Présentation du prototype"] }
    ],
    practical: "Exemple d'atelier proposé : concevoir la maquette et le prototype d'un petit outil de gestion adapté à un besoin local."
  },
  {
    seedId: "formation-data",
    slug: "bases-donnees-sql",
    eyebrow: "DONNÉES & ORGANISATION",
    promise: "Comprenez les données et apprenez à mieux les exploiter.",
    introduction: "Une découverte progressive des bases de données relationnelles et des requêtes SQL, avec une attention particulière portée à la qualité et à la sécurité de l'information.",
    audience: "Débutants, étudiants et professionnels amenés à organiser ou interroger des données.",
    prerequisites: "Être à l'aise avec les fichiers et tableaux numériques. Des connaissances préalables en SQL ne sont pas supposées.",
    outcomes: [
      "Distinguer tables, colonnes, clés et relations",
      "Imaginer un schéma de données adapté à un besoin",
      "Lire et rédiger des requêtes SQL fondamentales",
      "Comprendre les notions de sauvegarde, d'intégrité et d'accès"
    ],
    modules: [
      { title: "Penser en données", description: "Reconnaître les informations utiles et leurs relations.", topics: ["Entités", "Attributs", "Relations"] },
      { title: "Concevoir une base relationnelle", description: "Structurer les tables et les contraintes essentielles.", topics: ["Clés primaires", "Clés étrangères", "Normalisation élémentaire"] },
      { title: "Interroger avec SQL", description: "Chercher, filtrer et relier des données.", topics: ["SELECT et WHERE", "ORDER BY", "JOIN"] },
      { title: "Protéger et vérifier", description: "Introduire les bonnes pratiques de gestion.", topics: ["Contrôles de qualité", "Droits d'accès", "Sauvegardes"] }
    ],
    practical: "Exemple d'atelier proposé : organiser les informations d'une bibliothèque ou d'un établissement dans un schéma relationnel simple."
  },
  {
    seedId: "formation-outils",
    slug: "outils-numeriques-professionnels",
    eyebrow: "PRODUCTIVITÉ & MÉTHODES",
    promise: "Travaillez plus clairement avec vos outils numériques.",
    introduction: "Un parcours d'initiation à l'organisation de documents, de tableaux et de processus de travail, pensé pour des tâches concrètes du quotidien.",
    audience: "Personnes souhaitant gagner en autonomie dans la préparation, l'organisation et le suivi de documents professionnels.",
    prerequisites: "Aucun logiciel spécifique n'est imposé à ce stade. Les applications retenues seront précisées lors du cadrage.",
    outcomes: [
      "Organiser et retrouver des documents de manière cohérente",
      "Construire un tableau lisible et exploitable",
      "Appliquer une méthode simple de vérification des informations",
      "Préparer un petit processus de travail reproductible"
    ],
    modules: [
      { title: "Organiser son espace de travail", description: "Adopter des dossiers, noms de fichiers et versions cohérents.", topics: ["Classement", "Nommage", "Sauvegarde"] },
      { title: "Présenter des documents professionnels", description: "Améliorer la structure et la lisibilité des contenus.", topics: ["Hiérarchie des titres", "Modèles", "Mise en forme"] },
      { title: "Exploiter les tableaux", description: "Structurer une liste et vérifier ses données.", topics: ["Colonnes et filtres", "Formules de base", "Contrôles simples"] },
      { title: "Formaliser une routine", description: "Transformer des gestes répétés en étapes faciles à suivre.", topics: ["Procédures", "Suivi des tâches", "Vérification finale"] }
    ],
    practical: "Exemple d'atelier proposé : créer un modèle de suivi de dossiers et une procédure de classement pour une petite structure."
  }
] as const;

export function formationProgramFromSlug(slug: string): FormationProgram | undefined {
  return formationPrograms.find(program => program.slug === slug);
}

export function formationSeedItem(slug: string): CatalogueItem | undefined {
  const program = formationProgramFromSlug(slug);
  return program ? offerings.find(item => item.kind === "formation" && item.id === program.seedId) : undefined;
}

export function formationDetailHref(item: Pick<CatalogueItem, "id" | "kind" | "slug">): string | null {
  if (item.kind !== "formation") return null;
  const slug = item.slug || formationPrograms.find(program => program.seedId === item.id)?.slug;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return "/formations/" + slug;
}
