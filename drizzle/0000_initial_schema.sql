CREATE TABLE `abonnements` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`formation_id` bigint unsigned NOT NULL,
	`formation_titre` varchar(180) NOT NULL,
	`formation_description` longtext NOT NULL,
	`formation_prix` decimal(12,2) unsigned NOT NULL DEFAULT '0.00',
	`formation_duree` varchar(80) NOT NULL DEFAULT '',
	`formation_niveau` varchar(80) NOT NULL DEFAULT '',
	`formation_date_debut` date,
	`prenom` varchar(100) NOT NULL,
	`nom` varchar(100) NOT NULL,
	`email` varchar(254) NOT NULL,
	`ip_utilisateur` varchar(45),
	`user_agent` varchar(255),
	`notifications_active` tinyint unsigned NOT NULL DEFAULT 1,
	`date_abonnement` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `abonnements_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_abonnements_user_formation` UNIQUE(`user_id`,`formation_id`)
);
--> statement-breakpoint
CREATE TABLE `actualites` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`titre` varchar(180) NOT NULL,
	`contenu` longtext NOT NULL,
	`media` varchar(500) NOT NULL DEFAULT '',
	`date_publication` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `actualites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned,
	`action` varchar(80) NOT NULL,
	`cible` varchar(160) NOT NULL DEFAULT '',
	`details` text,
	`ip_address` varchar(45),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`post_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`contenu` longtext NOT NULL,
	`date_commentaire` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipe` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`nom` varchar(120) NOT NULL,
	`role` varchar(120) NOT NULL,
	`email` varchar(254) NOT NULL,
	`linkedin` varchar(500),
	`photo` varchar(500) NOT NULL DEFAULT 'default-avatar.svg',
	`ordre` smallint unsigned NOT NULL DEFAULT 0,
	`date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `equipe_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `formations` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`titre` varchar(180) NOT NULL,
	`description` longtext NOT NULL,
	`prix` decimal(12,2) unsigned NOT NULL DEFAULT '0.00',
	`niveau` varchar(80) NOT NULL DEFAULT 'Debutant',
	`date_debut` date,
	`duree` varchar(80) NOT NULL,
	`image` varchar(500) NOT NULL DEFAULT 'images/formations/default.jpg',
	`modules_liste` longtext NOT NULL,
	`jours_possibles` varchar(255) NOT NULL DEFAULT 'Lundi,Mardi,Mercredi,Jeudi,Vendredi',
	`heure_debut_defaut` time NOT NULL DEFAULT '08:00:00',
	`heure_fin_defaut` time NOT NULL DEFAULT '17:00:00',
	`date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `formations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inscriptions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`formation_id` bigint unsigned NOT NULL,
	`date_inscription` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `inscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_inscriptions_user_formation` UNIQUE(`user_id`,`formation_id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`post_id` bigint unsigned NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `likes_post_id_user_id_pk` PRIMARY KEY(`post_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `live_sessions` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`formation_id` bigint unsigned,
	`titre` varchar(190) NOT NULL,
	`description` text,
	`formateur` varchar(160) NOT NULL DEFAULT '',
	`room_name` varchar(120) NOT NULL,
	`date_debut` datetime NOT NULL,
	`duree_minutes` int unsigned NOT NULL DEFAULT 60,
	`acces` enum('public','membres') NOT NULL DEFAULT 'membres',
	`statut` enum('planifiee','en_cours','terminee','annulee') NOT NULL DEFAULT 'planifiee',
	`date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `live_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_live_room` UNIQUE(`room_name`)
);
--> statement-breakpoint
CREATE TABLE `logiciel_categories` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`nom` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`icone` varchar(60) NOT NULL DEFAULT 'fa-box-open',
	`ordre` int NOT NULL DEFAULT 0,
	CONSTRAINT `logiciel_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_logiciel_categorie_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `logiciels` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`categorie_id` bigint unsigned,
	`nom` varchar(180) NOT NULL,
	`description` text,
	`version` varchar(40) NOT NULL DEFAULT '',
	`taille_octets` bigint unsigned NOT NULL DEFAULT 0,
	`plateforme` varchar(120) NOT NULL DEFAULT '',
	`licence` varchar(60) NOT NULL DEFAULT 'Gratuit',
	`fichier` varchar(255) NOT NULL DEFAULT '',
	`lien_externe` varchar(500) NOT NULL DEFAULT '',
	`image` varchar(255) NOT NULL DEFAULT '',
	`telechargements` int unsigned NOT NULL DEFAULT 0,
	`statut` enum('publie','brouillon') NOT NULL DEFAULT 'publie',
	`date_ajout` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`mis_a_jour` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `logiciels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`nom` varchar(120) NOT NULL,
	`email` varchar(254) NOT NULL,
	`sujet` varchar(180) NOT NULL,
	`message` longtext NOT NULL,
	`date_envoi` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`email` varchar(254) NOT NULL,
	`ip_address` varchar(45),
	`user_agent` varchar(255),
	`statut` varchar(20) NOT NULL DEFAULT 'actif',
	`themes` varchar(255) NOT NULL DEFAULT 'formations,formations_en_ligne,logiciels,actualites,offres',
	`date_inscription` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`date_desinscription` datetime,
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_newsletter_email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`formation_id` bigint unsigned NOT NULL,
	`titre` varchar(180) NOT NULL,
	`message` longtext NOT NULL,
	`date_envoi` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications_lues` (
	`user_id` bigint unsigned NOT NULL,
	`notification_id` bigint unsigned NOT NULL,
	`date_lecture` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_lues_user_id_notification_id_pk` PRIMARY KEY(`user_id`,`notification_id`)
);
--> statement-breakpoint
CREATE TABLE `partenaires` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`nom` varchar(160) NOT NULL,
	`logo` varchar(255) NOT NULL DEFAULT '',
	`description` text,
	`site_web` varchar(500) NOT NULL DEFAULT '',
	`type_partenariat` varchar(80) NOT NULL DEFAULT '',
	`ordre` int NOT NULL DEFAULT 0,
	`actif` tinyint NOT NULL DEFAULT 1,
	`date_ajout` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `partenaires_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partenariat_demandes` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`organisation` varchar(180) NOT NULL,
	`contact_nom` varchar(160) NOT NULL,
	`email` varchar(190) NOT NULL,
	`telephone` varchar(40) NOT NULL DEFAULT '',
	`type_partenariat` varchar(80) NOT NULL,
	`message` text NOT NULL,
	`statut` enum('nouvelle','en_discussion','acceptee','refusee') NOT NULL DEFAULT 'nouvelle',
	`note_admin` text,
	`date_demande` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `partenariat_demandes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planning_valide` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`formation_id` bigint unsigned NOT NULL,
	`modules_choisis` longtext NOT NULL,
	`horaire_details` longtext NOT NULL,
	`statut` varchar(20) NOT NULL DEFAULT 'en_attente',
	`date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`date_validation` datetime,
	CONSTRAINT `planning_valide_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_planning_user_formation` UNIQUE(`user_id`,`formation_id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`titre` varchar(180) NOT NULL,
	`contenu` longtext NOT NULL,
	`auteur_id` bigint unsigned NOT NULL,
	`date_publication` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `produits` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`nom` varchar(180) NOT NULL,
	`description` longtext NOT NULL,
	`prix` decimal(12,2) unsigned NOT NULL DEFAULT '0.00',
	`image_url` varchar(500) NOT NULL DEFAULT '',
	`date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `produits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projets` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`titre` varchar(180) NOT NULL,
	`description` longtext NOT NULL,
	`auteur_id` bigint unsigned NOT NULL,
	`statut` varchar(20) NOT NULL DEFAULT 'en_attente',
	`date_soumission` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `projets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` char(64) NOT NULL,
	`count` int unsigned NOT NULL DEFAULT 0,
	`window_start` datetime NOT NULL,
	CONSTRAINT `rate_limits_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` char(64) NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`user_agent` varchar(255),
	`ip_address` varchar(45),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_seen_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`cle` varchar(80) NOT NULL,
	`valeur` text,
	`mis_a_jour` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_cle` PRIMARY KEY(`cle`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`nom` varchar(120) NOT NULL,
	`email` varchar(254) NOT NULL,
	`sujet` varchar(180) NOT NULL,
	`message` longtext NOT NULL,
	`statut` varchar(20) NOT NULL DEFAULT 'nouveau',
	`date_envoi` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `temp_users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`nom` varchar(100) NOT NULL DEFAULT '',
	`prenom` varchar(100) NOT NULL DEFAULT '',
	`email` varchar(254) NOT NULL,
	`mot_de_passe` varchar(255) NOT NULL,
	`photo_profil` varchar(500) NOT NULL DEFAULT 'images/default-avatar.svg',
	`token` char(64) NOT NULL,
	`date_demande` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `temp_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_temp_users_email` UNIQUE(`email`),
	CONSTRAINT `uq_temp_users_token` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`nom` varchar(100) NOT NULL DEFAULT '',
	`prenom` varchar(100) NOT NULL DEFAULT '',
	`email` varchar(254) NOT NULL,
	`mot_de_passe` varchar(255) NOT NULL,
	`google_id` varchar(64),
	`auth_provider` varchar(20) NOT NULL DEFAULT 'local',
	`role` varchar(20) NOT NULL DEFAULT 'utilisateur',
	`is_active` tinyint unsigned NOT NULL DEFAULT 1,
	`photo_profil` varchar(500) NOT NULL DEFAULT 'images/default-avatar.svg',
	`reset_token` char(64),
	`reset_expire` datetime,
	`date_inscription` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_users_email` UNIQUE(`email`),
	CONSTRAINT `uq_users_google_id` UNIQUE(`google_id`),
	CONSTRAINT `uq_users_reset_token` UNIQUE(`reset_token`)
);
--> statement-breakpoint
ALTER TABLE `abonnements` ADD CONSTRAINT `abonnements_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `abonnements` ADD CONSTRAINT `abonnements_formation_id_formations_id_fk` FOREIGN KEY (`formation_id`) REFERENCES `formations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `inscriptions` ADD CONSTRAINT `inscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `inscriptions` ADD CONSTRAINT `inscriptions_formation_id_formations_id_fk` FOREIGN KEY (`formation_id`) REFERENCES `formations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_post_id_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `logiciels` ADD CONSTRAINT `logiciels_categorie_id_logiciel_categories_id_fk` FOREIGN KEY (`categorie_id`) REFERENCES `logiciel_categories`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_formation_id_formations_id_fk` FOREIGN KEY (`formation_id`) REFERENCES `formations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notifications_lues` ADD CONSTRAINT `notifications_lues_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `notifications_lues` ADD CONSTRAINT `notifications_lues_notification_id_notifications_id_fk` FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `planning_valide` ADD CONSTRAINT `planning_valide_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `planning_valide` ADD CONSTRAINT `planning_valide_formation_id_formations_id_fk` FOREIGN KEY (`formation_id`) REFERENCES `formations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_auteur_id_users_id_fk` FOREIGN KEY (`auteur_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `projets` ADD CONSTRAINT `projets_auteur_id_users_id_fk` FOREIGN KEY (`auteur_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `idx_abonnements_formation_notifications` ON `abonnements` (`formation_id`,`notifications_active`);--> statement-breakpoint
CREATE INDEX `idx_abonnements_user_date` ON `abonnements` (`user_id`,`date_abonnement`);--> statement-breakpoint
CREATE INDEX `idx_abonnements_email` ON `abonnements` (`email`);--> statement-breakpoint
CREATE INDEX `idx_actualites_date_publication` ON `actualites` (`date_publication`);--> statement-breakpoint
CREATE INDEX `idx_actualites_titre` ON `actualites` (`titre`);--> statement-breakpoint
CREATE INDEX `idx_audit_created` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_user` ON `audit_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_comments_post_date` ON `comments` (`post_id`,`date_commentaire`);--> statement-breakpoint
CREATE INDEX `idx_comments_user` ON `comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_equipe_ordre_nom` ON `equipe` (`ordre`,`nom`);--> statement-breakpoint
CREATE INDEX `idx_equipe_email` ON `equipe` (`email`);--> statement-breakpoint
CREATE INDEX `idx_formations_titre` ON `formations` (`titre`);--> statement-breakpoint
CREATE INDEX `idx_formations_date_debut` ON `formations` (`date_debut`);--> statement-breakpoint
CREATE INDEX `idx_formations_niveau` ON `formations` (`niveau`);--> statement-breakpoint
CREATE INDEX `idx_inscriptions_formation_date` ON `inscriptions` (`formation_id`,`date_inscription`);--> statement-breakpoint
CREATE INDEX `idx_likes_user` ON `likes` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_live_debut` ON `live_sessions` (`date_debut`);--> statement-breakpoint
CREATE INDEX `idx_live_statut` ON `live_sessions` (`statut`);--> statement-breakpoint
CREATE INDEX `idx_logiciels_categorie` ON `logiciels` (`categorie_id`);--> statement-breakpoint
CREATE INDEX `idx_logiciels_statut` ON `logiciels` (`statut`);--> statement-breakpoint
CREATE INDEX `idx_messages_date_envoi` ON `messages` (`date_envoi`);--> statement-breakpoint
CREATE INDEX `idx_messages_email` ON `messages` (`email`);--> statement-breakpoint
CREATE INDEX `idx_newsletter_statut_date` ON `newsletter_subscribers` (`statut`,`date_inscription`);--> statement-breakpoint
CREATE INDEX `idx_notifications_formation_date` ON `notifications` (`formation_id`,`date_envoi`);--> statement-breakpoint
CREATE INDEX `idx_notifications_date_envoi` ON `notifications` (`date_envoi`);--> statement-breakpoint
CREATE INDEX `idx_notifications_lues_notification` ON `notifications_lues` (`notification_id`);--> statement-breakpoint
CREATE INDEX `idx_partenaires_actif` ON `partenaires` (`actif`);--> statement-breakpoint
CREATE INDEX `idx_partenariat_statut` ON `partenariat_demandes` (`statut`);--> statement-breakpoint
CREATE INDEX `idx_planning_formation_statut` ON `planning_valide` (`formation_id`,`statut`);--> statement-breakpoint
CREATE INDEX `idx_planning_statut_date` ON `planning_valide` (`statut`,`date_creation`);--> statement-breakpoint
CREATE INDEX `idx_posts_auteur_date` ON `posts` (`auteur_id`,`date_publication`);--> statement-breakpoint
CREATE INDEX `idx_posts_date_publication` ON `posts` (`date_publication`);--> statement-breakpoint
CREATE INDEX `idx_posts_titre` ON `posts` (`titre`);--> statement-breakpoint
CREATE INDEX `idx_produits_nom` ON `produits` (`nom`);--> statement-breakpoint
CREATE INDEX `idx_produits_date_creation` ON `produits` (`date_creation`);--> statement-breakpoint
CREATE INDEX `idx_projets_auteur_date` ON `projets` (`auteur_id`,`date_soumission`);--> statement-breakpoint
CREATE INDEX `idx_projets_statut_date` ON `projets` (`statut`,`date_soumission`);--> statement-breakpoint
CREATE INDEX `idx_sessions_user` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_sessions_expires` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_support_statut_date` ON `support_tickets` (`statut`,`date_envoi`);--> statement-breakpoint
CREATE INDEX `idx_support_email` ON `support_tickets` (`email`);--> statement-breakpoint
CREATE INDEX `idx_temp_users_date_demande` ON `temp_users` (`date_demande`);--> statement-breakpoint
CREATE INDEX `idx_users_role_active` ON `users` (`role`,`is_active`);--> statement-breakpoint
CREATE INDEX `idx_users_date_inscription` ON `users` (`date_inscription`);