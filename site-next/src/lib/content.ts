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
  { href: "/services", label: "Expertises" },
  { href: "/formations", label: "Formations" },
  { href: "/logiciels", label: "Logiciels" },
  { href: "/projets", label: "Réalisations" },
  { href: "/a-propos", label: "À propos" }
] as const;

export const sectionContent = {
  services: {
    eyebrow: "NOS EXPERTISES",
    title: "Une expertise qui sert votre ambition.",
    subtitle: "Du conseil aux applications, chaque solution répond à un usage précis.",
    kind: "service" as Kind
  },
  formations: {
    eyebrow: "TRANSMETTRE LE SAVOIR-FAIRE",
    title: "Apprendre pour construire.",
    subtitle: "Des parcours orientés vers la pratique et les compétences utiles.",
    kind: "formation" as Kind
  },
  logiciels: {
    eyebrow: "NOS PRODUITS NUMÉRIQUES",
    title: "Des outils pour travailler mieux.",
    subtitle: "Des solutions structurées, pensées pour les besoins du terrain.",
    kind: "logiciel" as Kind
  },
  projets: {
    eyebrow: "NOTRE DÉMARCHE EN ACTION",
    title: "Des projets qui ont du sens.",
    subtitle: "Des produits en cours de conception et des ambitions concrètes.",
    kind: "projet" as Kind
  },
  actualites: {
    eyebrow: "JOURNAL JP-SERVICES",
    title: "Les idées qui nous font avancer.",
    subtitle: "Analyses, perspectives et nouveautés de notre studio.",
    kind: "actualite" as Kind
  }
} as const;
