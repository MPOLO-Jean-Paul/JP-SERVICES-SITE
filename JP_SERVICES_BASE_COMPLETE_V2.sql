-- ============================================================================
-- JP-SERVICES - Base de donnees complete + extension 2026-08-23
-- Contient : schema de production 2026-08-12 + tables Logiciels, Partenariat,
-- Formations en ligne et Parametres du site (MIGRATION_v2).
-- Usage : installation neuve. Pour une base existante, utilisez MIGRATION_v2.sql seul.
-- ============================================================================
-- ============================================================================
-- JP-SERVICES - Base de donnees complete
-- Version : 2026-08-12
-- Compatible : MySQL 5.7/8.x et MariaDB 10.x (phpMyAdmin / InfinityFree)
-- Encodage : UTF-8 (utf8mb4)
-- ============================================================================
--
-- MODE D'EMPLOI
-- 1. Dans phpMyAdmin, selectionnez d'abord la base attribuee par l'hebergeur.
-- 2. Ouvrez l'onglet "Importer" et choisissez ce fichier.
-- 3. Conservez le jeu de caracteres UTF-8, puis lancez l'import.
--
-- IMPORTANT
-- - Ce fichier ne contient aucun identifiant MySQL et aucun mot de passe.
-- - Il ne supprime aucune table ni aucune donnee existante.
-- - Il est concu pour une installation neuve ou une base encore vide.
-- - Les comptes sont crees par le formulaire securise du site.
-- ============================================================================

SET NAMES utf8mb4;
SET @JP_OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- 1. Comptes et activation
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL DEFAULT '',
    `prenom` VARCHAR(100) NOT NULL DEFAULT '',
    `email` VARCHAR(254) NOT NULL,
    `mot_de_passe` VARCHAR(255) NOT NULL,
    `google_id` VARCHAR(64) DEFAULT NULL,
    `auth_provider` VARCHAR(20) NOT NULL DEFAULT 'local',
    `role` VARCHAR(20) NOT NULL DEFAULT 'utilisateur',
    `is_active` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
    `photo_profil` VARCHAR(500) NOT NULL DEFAULT 'images/default-avatar.svg',
    `reset_token` CHAR(64) DEFAULT NULL,
    `reset_expire` DATETIME DEFAULT NULL,
    `date_inscription` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_users_email` (`email`),
    UNIQUE KEY `uq_users_google_id` (`google_id`),
    UNIQUE KEY `uq_users_reset_token` (`reset_token`),
    KEY `idx_users_role_active` (`role`, `is_active`),
    KEY `idx_users_date_inscription` (`date_inscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `temp_users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL DEFAULT '',
    `prenom` VARCHAR(100) NOT NULL DEFAULT '',
    `email` VARCHAR(254) NOT NULL,
    `mot_de_passe` VARCHAR(255) NOT NULL,
    `photo_profil` VARCHAR(500) NOT NULL DEFAULT 'images/default-avatar.svg',
    `token` CHAR(64) NOT NULL,
    `date_demande` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_temp_users_email` (`email`),
    UNIQUE KEY `uq_temp_users_token` (`token`),
    KEY `idx_temp_users_date_demande` (`date_demande`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. Catalogue, actualites, produits et equipe
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `formations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(180) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `prix` DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
    `niveau` VARCHAR(80) NOT NULL DEFAULT 'Debutant',
    `date_debut` DATE DEFAULT NULL,
    `duree` VARCHAR(80) NOT NULL,
    `image` VARCHAR(500) NOT NULL DEFAULT 'images/formations/default.jpg',
    `modules_liste` LONGTEXT NOT NULL,
    `jours_possibles` VARCHAR(255) NOT NULL DEFAULT 'Lundi,Mardi,Mercredi,Jeudi,Vendredi',
    `heure_debut_defaut` TIME NOT NULL DEFAULT '08:00:00',
    `heure_fin_defaut` TIME NOT NULL DEFAULT '17:00:00',
    `date_creation` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_formations_titre` (`titre`),
    KEY `idx_formations_date_debut` (`date_debut`),
    KEY `idx_formations_niveau` (`niveau`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `actualites` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(180) NOT NULL,
    `contenu` LONGTEXT NOT NULL,
    `media` VARCHAR(500) NOT NULL DEFAULT '',
    `date_publication` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_actualites_date_publication` (`date_publication`),
    KEY `idx_actualites_titre` (`titre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `produits` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(180) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `prix` DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
    `image_url` VARCHAR(500) NOT NULL DEFAULT '',
    `date_creation` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_produits_nom` (`nom`),
    KEY `idx_produits_date_creation` (`date_creation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `equipe` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(120) NOT NULL,
    `role` VARCHAR(120) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `linkedin` VARCHAR(500) DEFAULT NULL,
    `photo` VARCHAR(500) NOT NULL DEFAULT 'default-avatar.svg',
    `ordre` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `date_creation` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_equipe_ordre_nom` (`ordre`, `nom`),
    KEY `idx_equipe_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. Contact, assistance et newsletter
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(120) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `sujet` VARCHAR(180) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `date_envoi` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_messages_date_envoi` (`date_envoi`),
    KEY `idx_messages_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `support_tickets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(120) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `sujet` VARCHAR(180) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `statut` VARCHAR(20) NOT NULL DEFAULT 'nouveau',
    `date_envoi` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_support_statut_date` (`statut`, `date_envoi`),
    KEY `idx_support_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(254) NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `user_agent` VARCHAR(255) DEFAULT NULL,
    `statut` VARCHAR(20) NOT NULL DEFAULT 'actif',
    `date_inscription` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_desinscription` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_newsletter_email` (`email`),
    KEY `idx_newsletter_statut_date` (`statut`, `date_inscription`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. Communaute : publications, commentaires et appreciations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `posts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(180) NOT NULL,
    `contenu` LONGTEXT NOT NULL,
    `auteur_id` BIGINT UNSIGNED NOT NULL,
    `date_publication` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_posts_auteur_date` (`auteur_id`, `date_publication`),
    KEY `idx_posts_date_publication` (`date_publication`),
    KEY `idx_posts_titre` (`titre`),
    CONSTRAINT `fk_posts_auteur`
        FOREIGN KEY (`auteur_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `comments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `post_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `contenu` LONGTEXT NOT NULL,
    `date_commentaire` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_comments_post_date` (`post_id`, `date_commentaire`),
    KEY `idx_comments_user` (`user_id`),
    CONSTRAINT `fk_comments_post`
        FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_comments_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `likes` (
    `post_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `date_creation` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`post_id`, `user_id`),
    KEY `idx_likes_user` (`user_id`),
    CONSTRAINT `fk_likes_post`
        FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_likes_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. Projets des membres
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `projets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(180) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `auteur_id` BIGINT UNSIGNED NOT NULL,
    `statut` VARCHAR(20) NOT NULL DEFAULT 'en_attente',
    `date_soumission` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_projets_auteur_date` (`auteur_id`, `date_soumission`),
    KEY `idx_projets_statut_date` (`statut`, `date_soumission`),
    CONSTRAINT `fk_projets_auteur`
        FOREIGN KEY (`auteur_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. Inscriptions, programmes et suivi des formations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `inscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `formation_id` BIGINT UNSIGNED NOT NULL,
    `date_inscription` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_inscriptions_user_formation` (`user_id`, `formation_id`),
    KEY `idx_inscriptions_formation_date` (`formation_id`, `date_inscription`),
    CONSTRAINT `fk_inscriptions_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_inscriptions_formation`
        FOREIGN KEY (`formation_id`) REFERENCES `formations` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `abonnements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `formation_id` BIGINT UNSIGNED NOT NULL,
    `formation_titre` VARCHAR(180) NOT NULL,
    `formation_description` LONGTEXT NOT NULL,
    `formation_prix` DECIMAL(12,2) UNSIGNED NOT NULL DEFAULT 0.00,
    `formation_duree` VARCHAR(80) NOT NULL DEFAULT '',
    `formation_niveau` VARCHAR(80) NOT NULL DEFAULT '',
    `formation_date_debut` DATE DEFAULT NULL,
    `prenom` VARCHAR(100) NOT NULL,
    `nom` VARCHAR(100) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `ip_utilisateur` VARCHAR(45) DEFAULT NULL,
    `user_agent` VARCHAR(255) DEFAULT NULL,
    `notifications_active` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
    `date_abonnement` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_abonnements_user_formation` (`user_id`, `formation_id`),
    KEY `idx_abonnements_formation_notifications` (`formation_id`, `notifications_active`),
    KEY `idx_abonnements_user_date` (`user_id`, `date_abonnement`),
    KEY `idx_abonnements_email` (`email`),
    CONSTRAINT `fk_abonnements_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_abonnements_formation`
        FOREIGN KEY (`formation_id`) REFERENCES `formations` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `planning_valide` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `formation_id` BIGINT UNSIGNED NOT NULL,
    `modules_choisis` LONGTEXT NOT NULL,
    `horaire_details` LONGTEXT NOT NULL,
    `statut` VARCHAR(20) NOT NULL DEFAULT 'en_attente',
    `date_creation` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_validation` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_planning_user_formation` (`user_id`, `formation_id`),
    KEY `idx_planning_formation_statut` (`formation_id`, `statut`),
    KEY `idx_planning_statut_date` (`statut`, `date_creation`),
    CONSTRAINT `fk_planning_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_planning_formation`
        FOREIGN KEY (`formation_id`) REFERENCES `formations` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. Notifications de formation
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `formation_id` BIGINT UNSIGNED NOT NULL,
    `titre` VARCHAR(180) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `date_envoi` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_notifications_formation_date` (`formation_id`, `date_envoi`),
    KEY `idx_notifications_date_envoi` (`date_envoi`),
    CONSTRAINT `fk_notifications_formation`
        FOREIGN KEY (`formation_id`) REFERENCES `formations` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications_lues` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `notification_id` BIGINT UNSIGNED NOT NULL,
    `date_lecture` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `notification_id`),
    KEY `idx_notifications_lues_notification` (`notification_id`),
    CONSTRAINT `fk_notifications_lues_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_notifications_lues_notification`
        FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = @JP_OLD_FOREIGN_KEY_CHECKS;

-- ============================================================================
-- FIN DE L'INSTALLATION
--
-- CREATION DU PREMIER ADMINISTRATEUR (methode recommandee)
-- 1. Creez et activez d'abord votre compte depuis le site.
-- 2. Remplacez l'adresse ci-dessous, puis executez uniquement la requete UPDATE.
--
-- UPDATE `users`
-- SET `role` = 'admin', `is_active` = 1
-- WHERE `email` = 'votre-adresse@example.com';
--
-- Ne stockez jamais un mot de passe en clair dans la base.
-- ============================================================================
-- JP-SERVICES — migration 2026-08-13
-- Nouveaux modules : Logiciels, Partenariat, Formations en ligne (visio), Paramètres du site.
-- À exécuter une seule fois sur la base de production.

CREATE TABLE IF NOT EXISTS site_settings (
    cle VARCHAR(80) NOT NULL,
    valeur TEXT DEFAULT NULL,
    mis_a_jour DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (cle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS logiciel_categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL,
    icone VARCHAR(60) NOT NULL DEFAULT 'fa-box-open',
    ordre INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_logiciel_categorie_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS logiciels (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    categorie_id BIGINT UNSIGNED DEFAULT NULL,
    nom VARCHAR(180) NOT NULL,
    description TEXT DEFAULT NULL,
    version VARCHAR(40) NOT NULL DEFAULT '',
    taille_octets BIGINT UNSIGNED NOT NULL DEFAULT 0,
    plateforme VARCHAR(120) NOT NULL DEFAULT '',
    licence VARCHAR(60) NOT NULL DEFAULT 'Gratuit',
    fichier VARCHAR(255) NOT NULL DEFAULT '',
    lien_externe VARCHAR(500) NOT NULL DEFAULT '',
    image VARCHAR(255) NOT NULL DEFAULT '',
    telechargements INT UNSIGNED NOT NULL DEFAULT 0,
    statut ENUM('publie','brouillon') NOT NULL DEFAULT 'publie',
    date_ajout DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mis_a_jour DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_logiciels_categorie (categorie_id),
    KEY idx_logiciels_statut (statut),
    CONSTRAINT fk_logiciels_categorie FOREIGN KEY (categorie_id) REFERENCES logiciel_categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partenaires (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom VARCHAR(160) NOT NULL,
    logo VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT DEFAULT NULL,
    site_web VARCHAR(500) NOT NULL DEFAULT '',
    type_partenariat VARCHAR(80) NOT NULL DEFAULT '',
    ordre INT NOT NULL DEFAULT 0,
    actif TINYINT(1) NOT NULL DEFAULT 1,
    date_ajout DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_partenaires_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partenariat_demandes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    organisation VARCHAR(180) NOT NULL,
    contact_nom VARCHAR(160) NOT NULL,
    email VARCHAR(190) NOT NULL,
    telephone VARCHAR(40) NOT NULL DEFAULT '',
    type_partenariat VARCHAR(80) NOT NULL,
    message TEXT NOT NULL,
    statut ENUM('nouvelle','en_discussion','acceptee','refusee') NOT NULL DEFAULT 'nouvelle',
    note_admin TEXT DEFAULT NULL,
    date_demande DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_partenariat_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS live_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    formation_id BIGINT UNSIGNED DEFAULT NULL,
    titre VARCHAR(190) NOT NULL,
    description TEXT DEFAULT NULL,
    formateur VARCHAR(160) NOT NULL DEFAULT '',
    room_name VARCHAR(120) NOT NULL,
    date_debut DATETIME NOT NULL,
    duree_minutes INT UNSIGNED NOT NULL DEFAULT 60,
    acces ENUM('public','membres') NOT NULL DEFAULT 'membres',
    statut ENUM('planifiee','en_cours','terminee','annulee') NOT NULL DEFAULT 'planifiee',
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_live_room (room_name),
    KEY idx_live_debut (date_debut),
    KEY idx_live_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Données de départ
INSERT IGNORE INTO logiciel_categories (id, nom, slug, icone, ordre) VALUES
(1, 'Bureautique', 'bureautique', 'fa-file-lines', 1),
(2, 'Développement', 'developpement', 'fa-code', 2),
(3, 'Design et création', 'design', 'fa-pen-nib', 3),
(4, 'Sécurité', 'securite', 'fa-shield-halved', 4),
(5, 'Utilitaires', 'utilitaires', 'fa-screwdriver-wrench', 5),
(6, 'Mobile', 'mobile', 'fa-mobile-screen', 6);

INSERT IGNORE INTO site_settings (cle, valeur) VALUES
('annonce_texte', 'De nouvelles sessions sont ouvertes. Formez-vous à votre rythme avec un accompagnement concret.'),
('annonce_url', '/formations'),
('annonce_lien_label', 'Découvrir les formations'),
('logiciels_intro', 'Retrouvez ici les logiciels et outils recommandés par JP-Services : utilitaires, environnements de développement et applications utilisés pendant nos formations. Chaque fiche indique la version, la plateforme et la licence.'),
('partenariat_intro', 'JP-Services grandit grâce à des partenaires qui partagent la même ambition : rendre les compétences numériques accessibles. Découvrez nos partenaires actuels et proposez une collaboration.'),
('auth_showcase_badge', 'ESPACE MEMBRE'),
('auth_showcase_title', 'Votre parcours numérique, au même endroit.'),
('auth_register_title', 'Créer votre compte'),
('auth_register_intro', 'Rejoignez les formations, les outils et la communauté JP-Services.');
