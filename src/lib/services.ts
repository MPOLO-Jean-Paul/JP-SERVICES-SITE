import type { LucideIcon } from "lucide-react";
import { AppWindow, Code2, GraduationCap, Globe, Palette, ServerCog, Workflow } from "lucide-react";

/** Services réalisés par JP-Services (page /services, accueil, recherche). */
export type Service = {
  slug: string;
  title: string;
  short: string;
  text: string;
  points: [string, string, string];
  Icon: LucideIcon;
  tone: "blue" | "violet" | "red" | "amber" | "mint";
};

export const SERVICES: Service[] = [
  {
    slug: "applications-web-mobile",
    title: "Applications web et mobiles",
    short: "Conception et développement d’applications sur mesure, sur ordinateur comme sur téléphone.",
    text: "Nous concevons et développons des applications adaptées à votre activité, de l’analyse du besoin à la mise en ligne : interfaces soignées, comptes utilisateurs, paiements, tableaux de bord et notifications.",
    points: ["Analyse du besoin et maquettes", "Développement web et mobile", "Mise en ligne et maintenance"],
    Icon: AppWindow,
    tone: "blue",
  },
  {
    slug: "sites-web",
    title: "Sites web professionnels",
    short: "Des sites rapides, élégants et bien référencés, que vous pouvez mettre à jour vous-même.",
    text: "Site vitrine, catalogue ou plateforme : nous réalisons des sites professionnels rapides, adaptés au mobile et pensés pour être trouvés sur les moteurs de recherche.",
    points: ["Design sur mesure", "Référencement et performance", "Nom de domaine et hébergement"],
    Icon: Globe,
    tone: "violet",
  },
  {
    slug: "monetisation-automatisation",
    title: "Monétisation et automatisation",
    short: "Monétisation de vos comptes et automatisation des tâches répétitives.",
    text: "Nous vous accompagnons pour activer et faire fructifier la monétisation de vos comptes et pages, et nous automatisons les tâches qui vous prennent du temps : publications, rapports, formulaires et envois.",
    points: ["Configuration de la monétisation", "Automatisation des tâches", "Suivi des résultats"],
    Icon: Workflow,
    tone: "red",
  },
  {
    slug: "logiciels-professionnels",
    title: "Logiciels professionnels",
    short: "Logiciels métiers pour tous les domaines : écoles, commerce, finances, stocks…",
    text: "Nous concevons des logiciels de gestion pour tous les domaines d’activité, à l’image de SCOLIA Pro pour les écoles : fiables, simples à utiliser et capables de fonctionner en réseau ou hors ligne.",
    points: ["Logiciels de gestion sur mesure", "Réseau local ou hors ligne", "Formation des utilisateurs"],
    Icon: ServerCog,
    tone: "mint",
  },
  {
    slug: "encadrement-programmation-design",
    title: "Encadrement en programmation et design",
    short: "Un accompagnement pratique, projet à l’appui, pour apprendre à coder et à concevoir.",
    text: "Nous encadrons apprenants et équipes sur des projets réels : programmation, conception d’interfaces et bonnes pratiques, avec des exercices, des revues de travail et des conseils personnalisés.",
    points: ["Séances pratiques", "Suivi personnalisé", "Projets concrets"],
    Icon: Code2,
    tone: "blue",
  },
  {
    slug: "graphisme-evenementiel",
    title: "Logos, affiches et événementiel",
    short: "Logos, affiches, flyers et visuels pour vos événements et vos réseaux sociaux.",
    text: "Nous créons votre identité visuelle et vos supports de communication : logos, affiches, flyers, invitations, kakémonos et visuels pour les réseaux sociaux et les événements.",
    points: ["Logo et identité visuelle", "Affiches, flyers et invitations", "Visuels pour réseaux sociaux"],
    Icon: Palette,
    tone: "amber",
  },
  {
    slug: "formation-informatique",
    title: "Formation et services informatiques",
    short: "Formations pour tous les niveaux et services informatiques du quotidien.",
    text: "Nous formons à l’informatique pour tous les niveaux et intervenons sur les besoins du quotidien : bureautique, internet, maintenance, réseaux, sécurité et outils numériques.",
    points: ["Bureautique et internet", "Maintenance et réseaux", "Sécurité numérique"],
    Icon: GraduationCap,
    tone: "violet",
  },
];

export const serviceContactHref = (s: Service) => `/contact?sujet=${encodeURIComponent(s.title)}`;
