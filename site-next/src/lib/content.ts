export type Kind = "service" | "formation" | "logiciel" | "projet" | "actualite";

export type CatalogueItem = {
  id: string;
  kind: Kind;
  category: string;
  title: string;
  description: string;
  detail: string;
  status?: string;
};

export const offerings: CatalogueItem[] = [
  { id: "strategie", kind: "service", category: "Conseil", title: "Conseil & stratégie digitale", description: "Transformer une problématique réelle en plan de réalisation mesurable.", detail: "Cadrage, analyse métier, parcours utilisateurs et feuille de route." },
  { id: "web", kind: "service", category: "Développement", title: "Applications web modernes", description: "Des plateformes rapides, accessibles et maintenables.", detail: "Next.js, interfaces métiers, API sécurisées et intégrations." },
  { id: "mobile", kind: "service", category: "Développement", title: "Applications mobiles & desktop", description: "Une expérience cohérente sur tous les écrans.", detail: "Applications multiplateformes, interfaces natives et données locales." },
  { id: "data", kind: "service", category: "Infrastructure", title: "Données & infrastructure", description: "Des architectures robustes qui peuvent évoluer avec votre activité.", detail: "PostgreSQL, intégration, sauvegardes et hébergement cloud." },
  { id: "formation-dev", kind: "formation", category: "Développement", title: "Développement d'applications", description: "Apprendre à concevoir une application de l'idée au déploiement.", detail: "Approche pratique fondée sur des projets. Modalités sur demande.", status: "Modalités sur demande" },
  { id: "formation-data", kind: "formation", category: "Données", title: "Bases de données & SQL", description: "Modéliser, interroger et sécuriser l'information.", detail: "Fondamentaux de la conception relationnelle et ateliers SQL.", status: "Modalités sur demande" },
  { id: "formation-outils", kind: "formation", category: "Productivité", title: "Outils numériques professionnels", description: "Mieux organiser les données, les documents et les processus.", detail: "Méthodes de travail reproductibles et exercices pratiques.", status: "Modalités sur demande" },
  { id: "scolia", kind: "logiciel", category: "Gestion scolaire", title: "SCOLIA Pro", description: "Une plateforme de gestion scolaire conçue pour les établissements.", detail: "Gestion des apprenants, encaissements, suivi et fonctionnement local. Projet en développement.", status: "En développement" },
  { id: "outil-metier", kind: "logiciel", category: "Sur mesure", title: "Solutions métiers adaptées", description: "Des outils conçus autour du fonctionnement de votre organisation.", detail: "Nous étudions les besoins avant de proposer une réalisation.", status: "Sur étude" },
  { id: "projet-scolia", kind: "projet", category: "Éducation", title: "SCOLIA — système de gestion scolaire", description: "Une initiative pour simplifier les opérations des établissements.", detail: "Conception d'une interface unifiée et d'une gestion structurée des données.", status: "En développement" },
  { id: "projet-formations", kind: "projet", category: "Formation", title: "Écosystème de formation JP-SERVICES", description: "Centraliser les parcours, contenus et ressources numériques.", detail: "Refonte progressive de l'expérience de consultation et de participation.", status: "Refonte en cours" },
  { id: "veille", kind: "actualite", category: "Perspectives", title: "Technologie utile, impact concret", description: "Nos réflexions sur les usages numériques et leurs bénéfices.", detail: "Les publications seront ajoutées depuis l'interface éditoriale.", status: "À paraître" }
];

export const navLinks = [
  { href: "/formations", label: "Formations" },
  { href: "/services", label: "Expertises" },
  { href: "/logiciels", label: "Logiciels" },
  { href: "/projets", label: "Projets" },
  { href: "/a-propos", label: "À propos" }
] as const;

export const sectionContent = {
  services: {
    eyebrow: "NOS SAVOIR-FAIRE",
    title: "Le numérique qui fait avancer vos projets.",
    subtitle: "De la conception au déploiement, des solutions précises pour des besoins réels.",
    kind: "service" as Kind
  },
  formations: {
    eyebrow: "APPRENDRE & PROGRESSER",
    title: "Développez des compétences qui comptent.",
    subtitle: "Explorez nos domaines de formation et les possibilités d'un accompagnement pratique. Programmes et modalités sur demande.",
    kind: "formation" as Kind
  },
  logiciels: {
    eyebrow: "DES OUTILS MÉTIERS UTILES",
    title: "Des logiciels pensés pour simplifier.",
    subtitle: "Des produits conçus au plus près des usages, dont SCOLIA Pro actuellement en développement.",
    kind: "logiciel" as Kind
  },
  projets: {
    eyebrow: "NOTRE TRAVAIL",
    title: "Des projets qui répondent au terrain.",
    subtitle: "Découvrez nos initiatives et les solutions que nous construisons progressivement.",
    kind: "projet" as Kind
  },
  actualites: {
    eyebrow: "NOTRE JOURNAL",
    title: "Idées, découvertes et perspectives.",
    subtitle: "Les évolutions du numérique et les projets JP-SERVICES, au fil de leur publication.",
    kind: "actualite" as Kind
  }
} as const;
