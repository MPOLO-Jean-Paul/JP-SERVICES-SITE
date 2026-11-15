/** Structure des méga-menus (clés de traduction dans messages/*.json, espace « nav »). */
export type MegaLink = { href: string; title: string; text: string; icon: string; authOnly?: boolean };
export type MegaGroup = { label: string; links: MegaLink[] };
export type MegaMenu = { id: string; label: string; icon: string; tone: "violet" | "coral" | "blue" | "mint"; intro: { kicker: string; title: string; text: string; ctaLabel: string; ctaHref: string }; groups: MegaGroup[]; activePrefixes: string[] };

export const MEGA_MENUS: MegaMenu[] = [
  {
    id: "formations",
    label: "formations",
    icon: "graduation-cap",
    tone: "violet",
    intro: { kicker: "formations", title: "formationsIntro", text: "formationsText", ctaLabel: "compare", ctaHref: "/formations" },
    groups: [
      {
        label: "learnSkill",
        links: [
          { href: "/formations", title: "catalog", text: "catalogText", icon: "graduation-cap" },
          { href: "/formations-en-ligne", title: "live", text: "liveText", icon: "video" },
          { href: "/abonnements", title: "myTrainings", text: "myTrainingsText", icon: "book-open", authOnly: true },
        ],
      },
      {
        label: "organize",
        links: [
          { href: "/abonnements", title: "program", text: "programText", icon: "calendar-check" },
          { href: "/aide", title: "support", text: "supportText", icon: "life-buoy" },
        ],
      },
    ],
    activePrefixes: ["/formations", "/abonnements", "/programme"],
  },
  {
    id: "services",
    label: "services",
    icon: "compass",
    tone: "coral",
    intro: { kicker: "projects", title: "servicesIntro", text: "servicesText", ctaLabel: "talkNeed", ctaHref: "/contact" },
    groups: [
      {
        label: "solutions",
        links: [
          { href: "/projets", title: "projects", text: "projectsText", icon: "rocket" },
          { href: "/actualites", title: "news", text: "newsText", icon: "newspaper" },
        ],
      },
      {
        label: "community",
        links: [
          { href: "/forum", title: "forum", text: "forumText", icon: "messages-square" },
          { href: "/a-propos", title: "about", text: "aboutText", icon: "users" },
        ],
      },
    ],
    activePrefixes: ["/projets", "/mes-projets", "/forum", "/actualites", "/a-propos"],
  },
  {
    id: "logiciels",
    label: "software",
    icon: "boxes",
    tone: "blue",
    intro: { kicker: "software", title: "softwareIntro", text: "softwareText", ctaLabel: "allSoftware", ctaHref: "/logiciels" },
    groups: [
      {
        label: "discoverTools",
        links: [
          { href: "/logiciels", title: "softwareCatalog", text: "softwareCatalogText", icon: "download" },
          { href: "/scolia", title: "scolia", text: "scoliaText", icon: "school" },
        ],
      },
      {
        label: "getStarted",
        links: [
          { href: "/formations", title: "learnWithTools", text: "learnWithToolsText", icon: "graduation-cap" },
          { href: "/aide", title: "needHelp", text: "needHelpText", icon: "circle-help" },
        ],
      },
    ],
    activePrefixes: ["/logiciels", "/scolia"],
  },
  {
    id: "partenariat",
    label: "partnership",
    icon: "handshake",
    tone: "mint",
    intro: { kicker: "collaborate", title: "partnershipIntro", text: "partnershipText", ctaLabel: "discoverPartnership", ctaHref: "/partenariat" },
    groups: [
      {
        label: "collaborate",
        links: [
          { href: "/partenariat", title: "becomePartner", text: "becomePartnerText", icon: "handshake" },
          { href: "/contact", title: "presentNeed", text: "presentNeedText", icon: "send" },
        ],
      },
      {
        label: "goFurther",
        links: [
          { href: "/projets", title: "supportedProjects", text: "supportedProjectsText", icon: "folder-kanban" },
          { href: "/actualites", title: "news", text: "newsText", icon: "newspaper" },
        ],
      },
    ],
    activePrefixes: ["/partenariat"],
  },
];
