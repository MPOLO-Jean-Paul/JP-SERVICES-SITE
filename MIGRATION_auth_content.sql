-- Contenus éditoriaux des écrans de connexion et d’inscription.
-- Exécutable sans écraser les textes déjà personnalisés par l’administration.

INSERT IGNORE INTO site_settings (cle, valeur) VALUES
('auth_showcase_badge', 'ESPACE MEMBRE'),
('auth_showcase_title', 'Votre parcours numérique, au même endroit.'),
('auth_register_title', 'Créer votre compte'),
('auth_register_intro', 'Rejoignez les formations, les outils et la communauté JP-Services.');
