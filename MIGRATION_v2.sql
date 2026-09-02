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
('partenariat_intro', 'JP-Services grandit grâce à des partenaires qui partagent la même ambition : rendre les compétences numériques accessibles. Découvrez nos partenaires actuels et proposez une collaboration.');
