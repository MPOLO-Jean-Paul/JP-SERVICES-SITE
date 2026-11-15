/** Constantes partagées entre actions serveur et composants (hors fichiers « use server »). */
export const NEWSLETTER_THEMES = { formations: "Formations", formations_en_ligne: "Formations en ligne", logiciels: "Logiciels", actualites: "Actualités", offres: "Offres & promotions" } as const;
export type NewsletterTheme = keyof typeof NEWSLETTER_THEMES;

export const SUPPORT_SUBJECTS: Record<string, string> = { Connexion: "Problème de connexion", Bug: "Signaler un dysfonctionnement", Securite: "Question sur la sécurité", Formation: "Accès à une formation", Autre: "Autre demande" };

export const PARTNERSHIP_TYPES = [
  { slug: "education", label: "Formation et éducation", text: "Co-construire des parcours de formation, ateliers ou programmes de mentorat." },
  { slug: "technologie", label: "Technologie", text: "Mettre à disposition des outils, licences, infrastructures ou expertise technique." },
  { slug: "sponsoring", label: "Sponsoring et mécénat", text: "Soutenir financièrement ou matériellement les apprenants et les projets." },
  { slug: "communautaire", label: "Communautaire", text: "Relayer les initiatives, co-organiser des événements et élargir la communauté." },
] as const;

export const PROJECT_STATUS: Record<string, { label: string; tone: "warning" | "success" | "danger" | "neutral" }> = { en_attente: { label: "En attente", tone: "warning" }, valide: { label: "Validé", tone: "success" }, approuve: { label: "Validé", tone: "success" }, rejete: { label: "À revoir", tone: "danger" }, refuse: { label: "À revoir", tone: "danger" } };
export const PLANNING_STATUS: Record<string, { label: string; tone: "warning" | "success" | "danger" | "neutral" }> = { brouillon: { label: "Brouillon", tone: "neutral" }, en_attente: { label: "En attente de validation", tone: "warning" }, valide: { label: "Planning validé", tone: "success" }, refuse: { label: "À revoir", tone: "danger" } };
