-- Inscription simplifiée : le nom et le prénom sont désormais optionnels
-- et peuvent être renseignés plus tard depuis le profil.
ALTER TABLE users
    MODIFY nom VARCHAR(100) NOT NULL DEFAULT '',
    MODIFY prenom VARCHAR(100) NOT NULL DEFAULT '';

ALTER TABLE temp_users
    MODIFY nom VARCHAR(100) NOT NULL DEFAULT '',
    MODIFY prenom VARCHAR(100) NOT NULL DEFAULT '';
