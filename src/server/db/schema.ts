/**
 * Schéma Drizzle — compatible avec la base MySQL de production historique (18 tables)
 * et son extension du 23/08/2026 (6 tables). Les tables marquées « nouveau » sont
 * ajoutées par la migration de la version Next.js (sessions, limitation, préférences).
 */
import { relations, sql } from "drizzle-orm";
import {
  bigint,
  char,
  datetime,
  date,
  decimal,
  index,
  int,
  longtext,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  smallint,
  text,
  time,
  tinyint,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

const id = () => bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey();
const fk = (name: string) => bigint(name, { mode: "number", unsigned: true });

export const users = mysqlTable(
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
    isActive: tinyint("is_active", { unsigned: true }).notNull().default(1),
    photoProfil: varchar("photo_profil", { length: 500 }).notNull().default("images/default-avatar.svg"),
    resetToken: char("reset_token", { length: 64 }),
    resetExpire: datetime("reset_expire", { mode: "date" }),
    dateInscription: datetime("date_inscription", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    uniqueIndex("uq_users_email").on(t.email),
    uniqueIndex("uq_users_google_id").on(t.googleId),
    uniqueIndex("uq_users_reset_token").on(t.resetToken),
    index("idx_users_role_active").on(t.role, t.isActive),
    index("idx_users_date_inscription").on(t.dateInscription),
  ],
);

export const tempUsers = mysqlTable(
  "temp_users",
  {
    id: id(),
    nom: varchar("nom", { length: 100 }).notNull().default(""),
    prenom: varchar("prenom", { length: 100 }).notNull().default(""),
    email: varchar("email", { length: 254 }).notNull(),
    motDePasse: varchar("mot_de_passe", { length: 255 }).notNull(),
    photoProfil: varchar("photo_profil", { length: 500 }).notNull().default("images/default-avatar.svg"),
    token: char("token", { length: 64 }).notNull(),
    dateDemande: datetime("date_demande", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    uniqueIndex("uq_temp_users_email").on(t.email),
    uniqueIndex("uq_temp_users_token").on(t.token),
    index("idx_temp_users_date_demande").on(t.dateDemande),
  ],
);

export const formations = mysqlTable(
  "formations",
  {
    id: id(),
    titre: varchar("titre", { length: 180 }).notNull(),
    description: longtext("description").notNull(),
    prix: decimal("prix", { precision: 12, scale: 2, unsigned: true }).notNull().default("0.00"),
    niveau: varchar("niveau", { length: 80 }).notNull().default("Debutant"),
    dateDebut: date("date_debut", { mode: "string" }),
    duree: varchar("duree", { length: 80 }).notNull(),
    image: varchar("image", { length: 500 }).notNull().default("images/formations/default.jpg"),
    modulesListe: longtext("modules_liste").notNull(),
    joursPossibles: varchar("jours_possibles", { length: 255 }).notNull().default("Lundi,Mardi,Mercredi,Jeudi,Vendredi"),
    heureDebutDefaut: time("heure_debut_defaut").notNull().default("08:00:00"),
    heureFinDefaut: time("heure_fin_defaut").notNull().default("17:00:00"),
    dateCreation: datetime("date_creation", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_formations_titre").on(t.titre), index("idx_formations_date_debut").on(t.dateDebut), index("idx_formations_niveau").on(t.niveau)],
);

export const actualites = mysqlTable(
  "actualites",
  {
    id: id(),
    titre: varchar("titre", { length: 180 }).notNull(),
    contenu: longtext("contenu").notNull(),
    media: varchar("media", { length: 500 }).notNull().default(""),
    datePublication: datetime("date_publication", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_actualites_date_publication").on(t.datePublication), index("idx_actualites_titre").on(t.titre)],
);

export const produits = mysqlTable(
  "produits",
  {
    id: id(),
    nom: varchar("nom", { length: 180 }).notNull(),
    description: longtext("description").notNull(),
    prix: decimal("prix", { precision: 12, scale: 2, unsigned: true }).notNull().default("0.00"),
    imageUrl: varchar("image_url", { length: 500 }).notNull().default(""),
    dateCreation: datetime("date_creation", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_produits_nom").on(t.nom), index("idx_produits_date_creation").on(t.dateCreation)],
);

export const equipe = mysqlTable(
  "equipe",
  {
    id: id(),
    nom: varchar("nom", { length: 120 }).notNull(),
    role: varchar("role", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    linkedin: varchar("linkedin", { length: 500 }),
    photo: varchar("photo", { length: 500 }).notNull().default("default-avatar.svg"),
    ordre: smallint("ordre", { unsigned: true }).notNull().default(0),
    dateCreation: datetime("date_creation", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_equipe_ordre_nom").on(t.ordre, t.nom), index("idx_equipe_email").on(t.email)],
);

export const messages = mysqlTable(
  "messages",
  {
    id: id(),
    nom: varchar("nom", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    sujet: varchar("sujet", { length: 180 }).notNull(),
    message: longtext("message").notNull(),
    dateEnvoi: datetime("date_envoi", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_messages_date_envoi").on(t.dateEnvoi), index("idx_messages_email").on(t.email)],
);

export const supportTickets = mysqlTable(
  "support_tickets",
  {
    id: id(),
    nom: varchar("nom", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    sujet: varchar("sujet", { length: 180 }).notNull(),
    message: longtext("message").notNull(),
    statut: varchar("statut", { length: 20 }).notNull().default("nouveau"),
    dateEnvoi: datetime("date_envoi", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_support_statut_date").on(t.statut, t.dateEnvoi), index("idx_support_email").on(t.email)],
);

export const newsletterSubscribers = mysqlTable(
  "newsletter_subscribers",
  {
    id: id(),
    email: varchar("email", { length: 254 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 255 }),
    statut: varchar("statut", { length: 20 }).notNull().default("actif"),
    themes: varchar("themes", { length: 255 }).notNull().default("formations,formations_en_ligne,logiciels,actualites,offres"),
    dateInscription: datetime("date_inscription", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
    dateDesinscription: datetime("date_desinscription", { mode: "date" }),
  },
  (t) => [uniqueIndex("uq_newsletter_email").on(t.email), index("idx_newsletter_statut_date").on(t.statut, t.dateInscription)],
);

export const posts = mysqlTable(
  "posts",
  {
    id: id(),
    titre: varchar("titre", { length: 180 }).notNull(),
    contenu: longtext("contenu").notNull(),
    auteurId: fk("auteur_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    datePublication: datetime("date_publication", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_posts_auteur_date").on(t.auteurId, t.datePublication), index("idx_posts_date_publication").on(t.datePublication), index("idx_posts_titre").on(t.titre)],
);

export const comments = mysqlTable(
  "comments",
  {
    id: id(),
    postId: fk("post_id").notNull().references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    contenu: longtext("contenu").notNull(),
    dateCommentaire: datetime("date_commentaire", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_comments_post_date").on(t.postId, t.dateCommentaire), index("idx_comments_user").on(t.userId)],
);

export const likes = mysqlTable(
  "likes",
  {
    postId: fk("post_id").notNull().references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    dateCreation: datetime("date_creation", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] }), index("idx_likes_user").on(t.userId)],
);

export const projets = mysqlTable(
  "projets",
  {
    id: id(),
    titre: varchar("titre", { length: 180 }).notNull(),
    description: longtext("description").notNull(),
    auteurId: fk("auteur_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    statut: varchar("statut", { length: 20 }).notNull().default("en_attente"),
    dateSoumission: datetime("date_soumission", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_projets_auteur_date").on(t.auteurId, t.dateSoumission), index("idx_projets_statut_date").on(t.statut, t.dateSoumission)],
);

export const inscriptions = mysqlTable(
  "inscriptions",
  {
    id: id(),
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    formationId: fk("formation_id").notNull().references(() => formations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    dateInscription: datetime("date_inscription", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [uniqueIndex("uq_inscriptions_user_formation").on(t.userId, t.formationId), index("idx_inscriptions_formation_date").on(t.formationId, t.dateInscription)],
);

export const abonnements = mysqlTable(
  "abonnements",
  {
    id: id(),
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    formationId: fk("formation_id").notNull().references(() => formations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    formationTitre: varchar("formation_titre", { length: 180 }).notNull(),
    formationDescription: longtext("formation_description").notNull(),
    formationPrix: decimal("formation_prix", { precision: 12, scale: 2, unsigned: true }).notNull().default("0.00"),
    formationDuree: varchar("formation_duree", { length: 80 }).notNull().default(""),
    formationNiveau: varchar("formation_niveau", { length: 80 }).notNull().default(""),
    formationDateDebut: date("formation_date_debut", { mode: "string" }),
    prenom: varchar("prenom", { length: 100 }).notNull(),
    nom: varchar("nom", { length: 100 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    ipUtilisateur: varchar("ip_utilisateur", { length: 45 }),
    userAgent: varchar("user_agent", { length: 255 }),
    notificationsActive: tinyint("notifications_active", { unsigned: true }).notNull().default(1),
    dateAbonnement: datetime("date_abonnement", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    uniqueIndex("uq_abonnements_user_formation").on(t.userId, t.formationId),
    index("idx_abonnements_formation_notifications").on(t.formationId, t.notificationsActive),
    index("idx_abonnements_user_date").on(t.userId, t.dateAbonnement),
    index("idx_abonnements_email").on(t.email),
  ],
);

export const planningValide = mysqlTable(
  "planning_valide",
  {
    id: id(),
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    formationId: fk("formation_id").notNull().references(() => formations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    modulesChoisis: longtext("modules_choisis").notNull(),
    horaireDetails: longtext("horaire_details").notNull(),
    statut: varchar("statut", { length: 20 }).notNull().default("en_attente"),
    dateCreation: datetime("date_creation", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
    dateValidation: datetime("date_validation", { mode: "date" }),
  },
  (t) => [
    uniqueIndex("uq_planning_user_formation").on(t.userId, t.formationId),
    index("idx_planning_formation_statut").on(t.formationId, t.statut),
    index("idx_planning_statut_date").on(t.statut, t.dateCreation),
  ],
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: id(),
    formationId: fk("formation_id").notNull().references(() => formations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    titre: varchar("titre", { length: 180 }).notNull(),
    message: longtext("message").notNull(),
    dateEnvoi: datetime("date_envoi", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_notifications_formation_date").on(t.formationId, t.dateEnvoi), index("idx_notifications_date_envoi").on(t.dateEnvoi)],
);

export const notificationsLues = mysqlTable(
  "notifications_lues",
  {
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    notificationId: fk("notification_id").notNull().references(() => notifications.id, { onDelete: "cascade", onUpdate: "cascade" }),
    dateLecture: datetime("date_lecture", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.notificationId] }), index("idx_notifications_lues_notification").on(t.notificationId)],
);

export const siteSettings = mysqlTable("site_settings", {
  cle: varchar("cle", { length: 80 }).primaryKey(),
  valeur: text("valeur"),
  misAJour: datetime("mis_a_jour", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()),
});

export const logicielCategories = mysqlTable(
  "logiciel_categories",
  {
    id: id(),
    nom: varchar("nom", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    icone: varchar("icone", { length: 60 }).notNull().default("fa-box-open"),
    ordre: int("ordre").notNull().default(0),
  },
  (t) => [uniqueIndex("uq_logiciel_categorie_slug").on(t.slug)],
);

export const logiciels = mysqlTable(
  "logiciels",
  {
    id: id(),
    categorieId: fk("categorie_id").references(() => logicielCategories.id, { onDelete: "set null" }),
    nom: varchar("nom", { length: 180 }).notNull(),
    description: text("description"),
    version: varchar("version", { length: 40 }).notNull().default(""),
    tailleOctets: bigint("taille_octets", { mode: "number", unsigned: true }).notNull().default(0),
    plateforme: varchar("plateforme", { length: 120 }).notNull().default(""),
    licence: varchar("licence", { length: 60 }).notNull().default("Gratuit"),
    fichier: varchar("fichier", { length: 255 }).notNull().default(""),
    lienExterne: varchar("lien_externe", { length: 500 }).notNull().default(""),
    image: varchar("image", { length: 255 }).notNull().default(""),
    telechargements: int("telechargements", { unsigned: true }).notNull().default(0),
    statut: mysqlEnum("statut", ["publie", "brouillon"]).notNull().default("publie"),
    dateAjout: datetime("date_ajout", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
    misAJour: datetime("mis_a_jour", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()),
  },
  (t) => [index("idx_logiciels_categorie").on(t.categorieId), index("idx_logiciels_statut").on(t.statut)],
);

export const partenaires = mysqlTable(
  "partenaires",
  {
    id: id(),
    nom: varchar("nom", { length: 160 }).notNull(),
    logo: varchar("logo", { length: 255 }).notNull().default(""),
    description: text("description"),
    siteWeb: varchar("site_web", { length: 500 }).notNull().default(""),
    typePartenariat: varchar("type_partenariat", { length: 80 }).notNull().default(""),
    ordre: int("ordre").notNull().default(0),
    actif: tinyint("actif").notNull().default(1),
    dateAjout: datetime("date_ajout", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_partenaires_actif").on(t.actif)],
);

export const partenariatDemandes = mysqlTable(
  "partenariat_demandes",
  {
    id: id(),
    organisation: varchar("organisation", { length: 180 }).notNull(),
    contactNom: varchar("contact_nom", { length: 160 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    telephone: varchar("telephone", { length: 40 }).notNull().default(""),
    typePartenariat: varchar("type_partenariat", { length: 80 }).notNull(),
    message: text("message").notNull(),
    statut: mysqlEnum("statut", ["nouvelle", "en_discussion", "acceptee", "refusee"]).notNull().default("nouvelle"),
    noteAdmin: text("note_admin"),
    dateDemande: datetime("date_demande", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_partenariat_statut").on(t.statut)],
);

export const liveSessions = mysqlTable(
  "live_sessions",
  {
    id: id(),
    formationId: fk("formation_id"),
    titre: varchar("titre", { length: 190 }).notNull(),
    description: text("description"),
    formateur: varchar("formateur", { length: 160 }).notNull().default(""),
    roomName: varchar("room_name", { length: 120 }).notNull(),
    dateDebut: datetime("date_debut", { mode: "date" }).notNull(),
    dureeMinutes: int("duree_minutes", { unsigned: true }).notNull().default(60),
    acces: mysqlEnum("acces", ["public", "membres"]).notNull().default("membres"),
    statut: mysqlEnum("statut", ["planifiee", "en_cours", "terminee", "annulee"]).notNull().default("planifiee"),
    dateCreation: datetime("date_creation", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [uniqueIndex("uq_live_room").on(t.roomName), index("idx_live_debut").on(t.dateDebut), index("idx_live_statut").on(t.statut)],
);

/* ───────────── Nouveau : sessions serveur révocables ───────────── */
export const sessions = mysqlTable(
  "sessions",
  {
    id: char("id", { length: 64 }).primaryKey(), // hash SHA-256 du jeton remis au navigateur
    userId: fk("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userAgent: varchar("user_agent", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: datetime("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
    lastSeenAt: datetime("last_seen_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
    expiresAt: datetime("expires_at", { mode: "date" }).notNull(),
  },
  (t) => [index("idx_sessions_user").on(t.userId), index("idx_sessions_expires").on(t.expiresAt)],
);

/* ───────────── Nouveau : limitation de débit persistante (compatible serverless) ───────────── */
export const rateLimits = mysqlTable("rate_limits", {
  key: char("key", { length: 64 }).primaryKey(),
  count: int("count", { unsigned: true }).notNull().default(0),
  windowStart: datetime("window_start", { mode: "date" }).notNull(),
});

/* ───────────── Nouveau : journal d'audit administrateur ───────────── */
export const auditLog = mysqlTable(
  "audit_log",
  {
    id: id(),
    userId: fk("user_id"),
    action: varchar("action", { length: 80 }).notNull(),
    cible: varchar("cible", { length: 160 }).notNull().default(""),
    details: text("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: datetime("created_at", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("idx_audit_created").on(t.createdAt), index("idx_audit_user").on(t.userId)],
);

/* ───────────── Relations ───────────── */
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  projets: many(projets),
  inscriptions: many(inscriptions),
  abonnements: many(abonnements),
  sessions: many(sessions),
}));
export const postsRelations = relations(posts, ({ one, many }) => ({
  auteur: one(users, { fields: [posts.auteurId], references: [users.id] }),
  comments: many(comments),
  likes: many(likes),
}));
export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));
export const projetsRelations = relations(projets, ({ one }) => ({
  auteur: one(users, { fields: [projets.auteurId], references: [users.id] }),
}));
export const formationsRelations = relations(formations, ({ many }) => ({
  inscriptions: many(inscriptions),
  notifications: many(notifications),
  liveSessions: many(liveSessions),
}));
export const inscriptionsRelations = relations(inscriptions, ({ one }) => ({
  user: one(users, { fields: [inscriptions.userId], references: [users.id] }),
  formation: one(formations, { fields: [inscriptions.formationId], references: [formations.id] }),
}));
export const abonnementsRelations = relations(abonnements, ({ one }) => ({
  user: one(users, { fields: [abonnements.userId], references: [users.id] }),
  formation: one(formations, { fields: [abonnements.formationId], references: [formations.id] }),
}));
export const planningRelations = relations(planningValide, ({ one }) => ({
  user: one(users, { fields: [planningValide.userId], references: [users.id] }),
  formation: one(formations, { fields: [planningValide.formationId], references: [formations.id] }),
}));
export const notificationsRelations = relations(notifications, ({ one }) => ({
  formation: one(formations, { fields: [notifications.formationId], references: [formations.id] }),
}));
export const logicielsRelations = relations(logiciels, ({ one }) => ({
  categorie: one(logicielCategories, { fields: [logiciels.categorieId], references: [logicielCategories.id] }),
}));
export const liveSessionsRelations = relations(liveSessions, ({ one }) => ({
  formation: one(formations, { fields: [liveSessions.formationId], references: [formations.id] }),
}));
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

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
