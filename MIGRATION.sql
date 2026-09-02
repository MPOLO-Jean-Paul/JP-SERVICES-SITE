-- JP-SERVICES — migration complémentaire de la refonte 2026
-- À exécuter une seule fois sur la base de production si la table n’existe pas.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    email VARCHAR(190) NOT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    statut ENUM('actif','inactif') NOT NULL DEFAULT 'actif',
    date_inscription DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_desinscription DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_newsletter_email (email),
    KEY idx_newsletter_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Remplace les anciens avatars par la ressource SVG réellement livrée.
UPDATE users
SET photo_profil = 'images/default-avatar.svg'
WHERE photo_profil IS NULL
   OR photo_profil = ''
   OR photo_profil IN ('images/default-avatar.png', 'images/default-avatar.jpg');

UPDATE equipe
SET photo = 'default-avatar.svg'
WHERE photo IS NULL
   OR photo = ''
   OR photo IN ('default-avatar.png', 'default-avatar.jpg');
