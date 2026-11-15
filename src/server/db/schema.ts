/**
 * Schéma PostgreSQL (Drizzle). Les noms de tables et de colonnes reprennent ceux de la
 * base historique de JP-Services afin de pouvoir importer les données existantes à
 * l’identique (voir scripts/import-mysql.ts). Les tables « sessions », « rate_limits »
 * et « audit_log » sont propres à la nouvelle plateforme.
 */
import { relations } from "drizzle-orm";
import { bigint, char, date, index, integer, numeric, pgTable, primaryKey, smallint, text, time, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

const id = () => bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity();
const fk = (name: string) => bigint(name, { mode: "number" });
const ts = (name: string) => timestamp(name, { mode: "date", withTimezone: true });
const created = (name: string) => ts(name).notNull().defaultNow();

export const users = pgTable(
  "users",
  {
    id: id(),
    nom: varchar("nom", { length: 100 }).notNull().default(""),
    prenom: varchar("prenom", { length: 100 }).notNull().default(""),
    email: varchar("email", { length: 254 }).notNull(),
    motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
    googleId: varchar("google_id", { length: 64 }),
    authProvider: varchar("auth_provider", { length: 20 }).notNull().default("local"),
    role: varchar("role", { length: 20 }).notNull().default("utilisateur"),
    isActive: smallint("is_active").notNull().default(1),
    photoProfil: varchar("photo_profil", { length: 500 }).notNull().default("images/default-avatar.svg"),
    resetToken: char("reset_token", { length: 64 }),
    resetExpire: ts("reset_expire"),
    dateInscription: created("date_inscription"),
  },
  (t) => [
    uniqueIndex("uq_users_email").on(t.email),
    uniqueIndex("uq_users_google_id").on(t.googleId),
    uniqueIndex("uq_users_reset_token").on(t.resetToken),
    index("idx_users_role_active").on(t.role, t.isActive),
    index("idx_users_date_inscription").on(t.dateInscription),
  ],
);

export const tempUsers = pgTable(
  "temp_users",
  {
    id: id(),
    nom: varchar("nom", { length: 100 }).notNull().default(""),
    prenom: varchar("prenom", { length: 100 }).notNull().default(""),
    email: varchar("email", { length: 254 }).notNull(),
    motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
    photoProfil: varchar("photo_profil", { length: 500 }).notNull().default("images/default-avatar.svg"),
    token: char("token", { length: 64 }).notNull(),
    dateDemande: created("date_demande"),
  },
  (t) => [uniqueIndex("uq_temp_users_email").on(t.email), uniqueIndex("uq_temp_users_token").on(t.token), index("idx_temp_users_date_demande").on(t.dateDemande)],
);

export const formations = pgTable(
  "formations",
  {
    id: id(),
    titre: varchar("titre", { length: 180 }).notNull(),
    description: text("description").notNull(),
    prix: numeric("prix", { precision: 12, scale: 2 }).notNull().default("0.00"),
    niveau: varchar("niveau", { length: 80 }).notNull().default("Débutant"),
    dateDebut: date("date_debut", { mode: "string" }),
    duree: varchar("duree", { length: 80 }).notNull(),
    image: varchar("image", { length: 500 }).notNull().default(""),
    modulesListe: text("modules_liste").notNull().default(""),
    joursPossibles: varchar("jours_possibles", { length: 255 }).notNull().default("Lundi,Mardi,Mercredi,Jeudi,Vendredi"),
    heureDebutDefaut: time("heure_debut_defaut").notNull().default("08:00:00"),
    heureFinDefaut: time("heure_fin_defaut").notNull().default("17:00:00"),
    dateCreation: created("date_creation"),
  },
  (t) => [index("idx_formations_titre").on(t.titre), index("idx_formations_date_debut").on(t.dateDebut), index("idx_formations_niveau").on(t.niveau)],
);

export const actualites = pgTable(
  "actualites",
  {
    id: id(),
    titre: varchar("titre", { length: 180 }).notNull(),
    contenu: text("contenu").notNull(),
    media: varchar("media", { length: 500 }).notNull().default(""),
    datePublication: created("date_publication"),
  },
  (t) => [index("idx_actualites_date_publication").on(t.datePublication), index("idx_actualites_titre").on(t.titre)],
);

export const produits = pgTable(
  "produits",
  {
    id: id(),
    nom: varchar("nom", { length: 180 }).notNull(),
    description: text("description").notNull().default(""),
    prix: numeric("prix", { precision: 12, scale: 2 }).notNull().default("0.00"),
    imageUrl: varchar("image_url", { length: 500 }).notNull().default(""),
    dateCreation: created("date_creation"),
  },
  (t) => [index("idx_produits_nom").on(t.nom), index("idx_produits_date_creation").on(t.dateCreation)],
);

export const equipe = pgTable(
  "equipe",
  {
    id: id(),
    nom: varchar("nom", { length: 120 }).notNull(),
    role: varchar("role", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull().default(""),
    linkedin: varchar("linkedin", { length: 500 }),
    photo: varchar("photo", { length: 500 }).notNull().default("default-avatar.svg"),
    ordre: smallint("ordre").notNull().default(0),
    dateCreation: created("date_creation"),
  },
  (t) => [index("idx_equipe_ordre_nom").on(t.ordre, t.nom), index("idx_equipe_email").on(t.email)],
);

export const messages = pgTable(
  "messages",
  {
    id: id(),
    nom: varchar("nom", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    sujet: varchar("sujet", { length: 180 }).notNull(),
    message: text("message").notNull(),
    dateEnvoi: created("date_envoi"),
  },
  (t) => [index("idx_messages_date_envoi").on(t.dateEnvoi), index("idx_messages_email").on(t.email)],
);

export const supportTickets = pgTable(
  "support_tickets",
  {
    id: id(),
    nom: varchar("nom", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    sujet: varchar("sujet", { length: 180 }).notNull(),
    message: text("message").notNull(),
    statut: varchar("statut", { length: 20 }).notNull().default("nouveau"),
    dateEnvoi: created("date_envoi"),
  },
  (t) => [index("idx_support_statut_date").on(t.statut, t.dateEnvoi), index("idx_support_email").on(t.email)],
);

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: id(),
    email: varchar("email", { length: 254 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 255 }),
    statut: varchar("statut", { length: 20 }).notNull().default("actif"),
    themes: varchar("themes", { length: 255 }).notNull().default("formations,formations_en_ligne,logiciels,actualites,offres"),
    dateInscription: created("date_inscription"),
    dateDesinscription: ts("date_desinscription"),
  },
  (t) => [uniqueIndex("uq_newsletter_email").on(t.email), index("idx_newsletter_statut_date").on(t.statut, t.dateInscription)],
);

export const posts = pgTable(
  "posts",
  {
    id: id(),
    titre: varchar("titre", { length: 180 }).notNull(),
    contenu: text("contenu").notNull(),
    auteurId: fk("auteur_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    datePublication: created("date_publication"),
  },
  (t) => [index("idx_posts_auteur_date").on(t.auteurId, t.datePublication), index("idx_posts_date_publication").on(t.datePublication), index("idx_posts_titre").on(t.titre)],
);

export const comments = pgTable(
  "comments",
  {
    id: id(),
    postId: fk("post_id").notNull().references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    contenu: text("contenu").notNull(),
    dateCommentaire: created("date_commentaire"),
  },
  (t) => [index("idx_comments_post_date").on(t.postId, t.dateCommentaire), index("idx_comments_user").on(t.userId)],
);

export const likes = pgTable(
  "likes",
  {
    postId: fk("post_id").notNull().references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    dateCreation: created("date_creation"),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] }), index("idx_likes_user").on(t.userId)],
);

export const projets = pgTable(
  "projets",
  {
    id: id(),
    titre: varchar("titre", { length: 180 }).notNull(),
    description: text("description").notNull(),
    auteurId: fk("auteur_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    statut: varchar("statut", { length: 20 }).notNull().default("en_attente"),
    dateSoumission: created("date_soumission"),
  },
  (t) => [index("idx_projets_auteur_date").on(t.auteurId, t.dateSoumission), index("idx_projets_statut_date").on(t.statut, t.dateSoumission)],
);

export const inscriptions = pgTable(
  "inscriptions",
  {
    id: id(),
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    formationId: fk("formation_id").notNull().references(() => formations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    dateInscription: created("date_inscription"),
  },
  (t) => [uniqueIndex("uq_inscriptions_user_formation").on(t.userId, t.formationId), index("idx_inscriptions_formation_date").on(t.formationId, t.dateInscription)],
);

export const abonnements = pgTable(
  "abonnements",
  {
    id: id(),
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    formationId: fk("formation_id").notNull().references(() => formations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    formationTitre: varchar("formation_titre", { length: 180 }).notNull(),
    formationDescription: text("formation_description").notNull().default(""),
    formationPrix: numeric("formation_prix", { precision: 12, scale: 2 }).notNull().default("0.00"),
    formationDuree: varchar("formation_duree", { length: 80 }).notNull().default(""),
    formationNiveau: varchar("formation_niveau", { length: 80 }).notNull().default(""),
    formationDateDebut: date("formation_date_debut", { mode: "string" }),
    prenom: varchar("prenom", { length: 100 }).notNull().default(""),
    nom: varchar("nom", { length: 100 }).notNull().default(""),
    email: varchar("email", { length: 254 }).notNull(),
    ipUtilisateur: varchar("ip_utilisateur", { length: 45 }),
    userAgent: varchar("user_agent", { length: 255 }),
    notificationsActive: smallint("notifications_active").notNull().default(1),
    dateAbonnement: created("date_abonnement"),
  },
  (t) => [
    uniqueIndex("uq_abonnements_user_formation").on(t.userId, t.formationId),
    index("idx_abonnements_formation_notifications").on(t.formationId, t.notificationsActive),
    index("idx_abonnements_user_date").on(t.userId, t.dateAbonnement),
    index("idx_abonnements_email").on(t.email),
  ],
);

export const planningValide = pgTable(
  "planning_valide",
  {
    id: id(),
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    formationId: fk("formation_id").notNull().references(() => formations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    modulesChoisis: text("modules_choisis").notNull(),
    horaireDetails: text("horaire_details").notNull(),
    statut: varchar("statut", { length: 20 }).notNull().default("en_attente"),
    dateCreation: created("date_creation"),
    dateValidation: ts("date_validation"),
  },
  (t) => [uniqueIndex("uq_planning_user_formation").on(t.userId, t.formationId), index("idx_planning_formation_statut").on(t.formationId, t.statut), index("idx_planning_statut_date").on(t.statut, t.dateCreation)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    formationId: fk("formation_id").notNull().references(() => formations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    titre: varchar("titre", { length: 180 }).notNull(),
    message: text("message").notNull(),
    dateEnvoi: created("date_envoi"),
  },
  (t) => [index("idx_notifications_formation_date").on(t.formationId, t.dateEnvoi), index("idx_notifications_date_envoi").on(t.dateEnvoi)],
);

export const notificationsLues = pgTable(
  "notifications_lues",
  {
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    notificationId: fk("notification_id").notNull().references(() => notifications.id, { onDelete: "cascade", onUpdate: "cascade" }),
    dateLecture: created("date_lecture"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.notificationId] }), index("idx_notifications_lues_notification").on(t.notificationId)],
);

export const siteSettings = pgTable("site_settings", {
  cle: varchar("cle", { length: 80 }).primaryKey(),
  valeur: text("valeur"),
  misAJour: created("mis_a_jour").$onUpdate(() => new Date()),
});

export const logicielCategories = pgTable(
  "logiciel_categories",
  {
    id: id(),
    nom: varchar("nom", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    icone: varchar("icone", { length: 60 }).notNull().default("box"),
    ordre: integer("ordre").notNull().default(0),
  },
  (t) => [uniqueIndex("uq_logiciel_categorie_slug").on(t.slug)],
);

export const logiciels = pgTable(
  "logiciels",
  {
    id: id(),
    categorieId: fk("categorie_id").references(() => logicielCategories.id, { onDelete: "set null" }),
    nom: varchar("nom", { length: 180 }).notNull(),
    description: text("description"),
    version: varchar("version", { length: 40 }).notNull().default(""),
    tailleOctets: bigint("taille_octets", { mode: "number" }).notNull().default(0),
    plateforme: varchar("plateforme", { length: 120 }).notNull().default(""),
    licence: varchar("licence", { length: 60 }).notNull().default("Gratuit"),
    fichier: varchar("fichier", { length: 255 }).notNull().default(""),
    lienExterne: varchar("lien_externe", { length: 500 }).notNull().default(""),
    image: varchar("image", { length: 255 }).notNull().default(""),
    telechargements: integer("telechargements").notNull().default(0),
    statut: varchar("statut", { length: 20, enum: ["publie", "brouillon"] }).notNull().default("publie"),
    dateAjout: created("date_ajout"),
    misAJour: created("mis_a_jour").$onUpdate(() => new Date()),
  },
  (t) => [index("idx_logiciels_categorie").on(t.categorieId), index("idx_logiciels_statut").on(t.statut)],
);

export const partenaires = pgTable(
  "partenaires",
  {
    id: id(),
    nom: varchar("nom", { length: 160 }).notNull(),
    logo: varchar("logo", { length: 255 }).notNull().default(""),
    description: text("description"),
    siteWeb: varchar("site_web", { length: 500 }).notNull().default(""),
    typePartenariat: varchar("type_partenariat", { length: 80 }).notNull().default(""),
    ordre: integer("ordre").notNull().default(0),
    actif: smallint("actif").notNull().default(1),
    dateAjout: created("date_ajout"),
  },
  (t) => [index("idx_partenaires_actif").on(t.actif)],
);

export const partenariatDemandes = pgTable(
  "partenariat_demandes",
  {
    id: id(),
    organisation: varchar("organisation", { length: 180 }).notNull(),
    contactNom: varchar("contact_nom", { length: 160 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    telephone: varchar("telephone", { length: 40 }).notNull().default(""),
    typePartenariat: varchar("type_partenariat", { length: 80 }).notNull(),
    message: text("message").notNull(),
    statut: varchar("statut", { length: 20, enum: ["nouvelle", "en_discussion", "acceptee", "refusee"] }).notNull().default("nouvelle"),
    noteAdmin: text("note_admin"),
    dateDemande: created("date_demande"),
  },
  (t) => [index("idx_partenariat_statut").on(t.statut)],
);

export const liveSessions = pgTable(
  "live_sessions",
  {
    id: id(),
    formationId: fk("formation_id").references(() => formations.id, { onDelete: "set null" }),
    titre: varchar("titre", { length: 190 }).notNull(),
    description: text("description"),
    formateur: varchar("formateur", { length: 160 }).notNull().default(""),
    roomName: varchar("room_name", { length: 120 }).notNull(),
    dateDebut: ts("date_debut").notNull(),
    dureeMinutes: integer("duree_minutes").notNull().default(60),
    acces: varchar("acces", { length: 20, enum: ["public", "membres"] }).notNull().default("membres"),
    statut: varchar("statut", { length: 20, enum: ["planifiee", "en_cours", "terminee", "annulee"] }).notNull().default("planifiee"),
    dateCreation: created("date_creation"),
  },
  (t) => [uniqueIndex("uq_live_room").on(t.roomName), index("idx_live_debut").on(t.dateDebut), index("idx_live_statut").on(t.statut)],
);

/* ───────────── Sessions serveur révocables ───────────── */
export const sessions = pgTable(
  "sessions",
  {
    id: char("id", { length: 64 }).primaryKey(), // SHA-256 du jeton remis au navigateur
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userAgent: varchar("user_agent", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: created("created_at"),
    lastSeenAt: created("last_seen_at"),
    expiresAt: ts("expires_at").notNull(),
  },
  (t) => [index("idx_sessions_user").on(t.userId), index("idx_sessions_expires").on(t.expiresAt)],
);

/* ───────────── Limitation de débit persistante ───────────── */
export const rateLimits = pgTable("rate_limits", {
  key: char("key", { length: 64 }).primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: ts("window_start").notNull(),
});

/* ───────────── Journal d’audit administrateur ───────────── */
export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    userId: fk("user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 80 }).notNull(),
    cible: varchar("cible", { length: 160 }).notNull().default(""),
    details: text("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: created("created_at"),
  },
  (t) => [index("idx_audit_created").on(t.createdAt), index("idx_audit_user").on(t.userId)],
);

/* ───────────── Relations ───────────── */
export const usersRelations = relations(users, ({ many }) => ({ posts: many(posts), projets: many(projets), inscriptions: many(inscriptions), abonnements: many(abonnements), sessions: many(sessions) }));
export const postsRelations = relations(posts, ({ one, many }) => ({ auteur: one(users, { fields: [posts.auteurId], references: [users.id] }), comments: many(comments), likes: many(likes) }));
export const commentsRelations = relations(comments, ({ one }) => ({ post: one(posts, { fields: [comments.postId], references: [posts.id] }), user: one(users, { fields: [comments.userId], references: [users.id] }) }));
export const projetsRelations = relations(projets, ({ one }) => ({ auteur: one(users, { fields: [projets.auteurId], references: [users.id] }) }));
export const formationsRelations = relations(formations, ({ many }) => ({ inscriptions: many(inscriptions), notifications: many(notifications), liveSessions: many(liveSessions) }));
export const inscriptionsRelations = relations(inscriptions, ({ one }) => ({ user: one(users, { fields: [inscriptions.userId], references: [users.id] }), formation: one(formations, { fields: [inscriptions.formationId], references: [formations.id] }) }));
export const logicielsRelations = relations(logiciels, ({ one }) => ({ categorie: one(logicielCategories, { fields: [logiciels.categorieId], references: [logicielCategories.id] }) }));
export const liveSessionsRelations = relations(liveSessions, ({ one }) => ({ formation: one(formations, { fields: [liveSessions.formationId], references: [formations.id] }) }));
export const sessionsRelations = relations(sessions, ({ one }) => ({ user: one(users, { fields: [sessions.userId], references: [users.id] }) }));

export type User = typeof users.$inferSelect;
export type Formation = typeof formations.$inferSelect;
export type Actualite = typeof actualites.$inferSelect;
export type Logiciel = typeof logiciels.$inferSelect;
export type LogicielCategorie = typeof logicielCategories.$inferSelect;
export type Partenaire = typeof partenaires.$inferSelect;
export type LiveSession = typeof liveSessions.$inferSelect;
export type Projet = typeof projets.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Produit = typeof produits.$inferSelect;
export type MembreEquipe = typeof equipe.$inferSelect;

