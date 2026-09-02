-- JP-SERVICES — Migration préférences newsletter (2026-06)
-- Permet à chaque abonné de choisir les thèmes qui l'intéressent.
-- À exécuter une seule fois sur la base de production.

ALTER TABLE `newsletter_subscribers`
    ADD COLUMN `themes` VARCHAR(255) NOT NULL DEFAULT 'formations,formations_en_ligne,logiciels,actualites,offres' AFTER `statut`;

-- Harmonise le statut (les anciennes bases utilisaient un ENUM sans valeur 'desinscrit')
ALTER TABLE `newsletter_subscribers`
    MODIFY `statut` VARCHAR(20) NOT NULL DEFAULT 'actif';
