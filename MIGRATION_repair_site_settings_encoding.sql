-- Corrige uniquement les valeurs doublement encodées des annonces existantes.
-- Les textes personnalisés restent inchangés à l’exception de leur encodage.
UPDATE site_settings
SET valeur = CONVERT(BINARY CONVERT(valeur USING latin1) USING utf8mb4)
WHERE cle IN ('annonce_texte', 'annonce_lien_label')
  AND HEX(valeur) LIKE '%C383C2%';
