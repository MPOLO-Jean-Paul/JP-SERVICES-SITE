-- JP-SERVICES — Migration Google Sign-In (2026-01, corrigée 2026-06)
-- Ajoute les colonnes nécessaires à l'authentification via Google Identity Services.
-- À exécuter une seule fois sur la base de production.
-- Note : la colonne `prenom` existe déjà dans le schéma principal (JP_SERVICES_BASE_COMPLETE_V2.sql).

ALTER TABLE `users`
    ADD COLUMN `google_id` VARCHAR(64) NULL AFTER `mot_de_passe`,
    ADD COLUMN `auth_provider` VARCHAR(20) NOT NULL DEFAULT 'local' AFTER `google_id`,
    ADD UNIQUE KEY `uq_users_google_id` (`google_id`);
