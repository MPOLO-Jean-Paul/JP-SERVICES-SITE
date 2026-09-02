# Rapport de refonte technique et UX — JP-SERVICES

**Date de finalisation : 11 août 2026**  
**Périmètre : site public, accueil, contenus, recherche, authentification, espace membre, projets, forum et administration**

## 1. Direction de refonte

La direction finale s’inspire des principes d’interface observés sur OpenClassrooms : navigation compacte, hiérarchie pédagogique, palette violette et lavande, cartes sobres, appels à l’action rectangulaires, espaces de lecture confortables et pied de page repliable sur mobile. Ces principes ont été transposés à l’identité et aux contenus JP-SERVICES sans reprendre la marque ni les textes de la référence.

La priorité a été de conserver la logique métier PHP/MySQL existante tout en reconstruisant un socle visuel et interactif commun.

## 2. Frontend natif

- Suppression des dépendances frontend Bootstrap.
- Suppression d'AOS et d'Animate.css.
- Aucun jQuery, React, Vue, Angular ou Tailwind.
- Contrôleur d'interface en JavaScript natif dans `js/site-ui.js`.
- Composants CSS natifs pour grille, formulaires, boutons, cartes, tableaux, onglets et modales historiques.
- Système commun de surfaces, bordures, rayons, ombres, espacements et états de focus.
- Typographie globale harmonisée autour d’Inter.
- Tailles de titres plafonnées pour éviter les mises en page excessivement démonstratives.
- Couche finale `css/learning-platform.css` chargée après les styles historiques afin d’unifier le site public sans casser les écrans métier existants.

## 3. Navigation, recherche et thèmes

Le header public a été restructuré avec :

- navigation principale cohérente ;
- menu responsive ;
- panneau utilisateur ;
- recherche globale ;
- raccourcis `Ctrl/Cmd + K` et `/` ;
- gestion des thèmes Clair, Sombre et Système ;
- mémorisation du choix dans le navigateur ;
- adaptation automatique au thème système ;
- lien d'évitement et états de focus visibles.

L'administration dispose du même mécanisme de thème et d'une recherche/filtration de sa navigation.

## 4. Animations

Les animations de l'accueil et des blocs compatibles reposent sur :

- CSS natif ;
- `IntersectionObserver` ;
- transitions de panneaux, recherche, cartes et rotateur d'actualités ;
- arrêt ou neutralisation des mouvements lorsque `prefers-reduced-motion` est activé.

Les anciennes bibliothèques d'animation tierces ont été retirées.

## 5. Responsive et structure HTML

Une couche native de compatibilité remplace les anciennes classes de grille Bootstrap sans charger Bootstrap.

Un problème structurel hérité concernait 19 pages qui pouvaient produire deux documents HTML imbriqués lorsqu'elles incluaient le header commun. Le bootstrap applicatif normalise désormais la réponse finale pour produire un document unique. Les tests locaux sur les pages publiques sans dépendance base de données confirment un seul doctype, `<html>`, `<head>` et `<body>`.

## 6. Authentification et récupération de compte

- Connexion normalisée sur l'adresse e-mail unique.
- Réponses de connexion volontairement génériques.
- Rotation de l'identifiant de session après authentification.
- Limitation persistante des tentatives par fenêtre de temps, côté serveur et indépendante du cookie de session.
- Politique de nouveau mot de passe : 10 caractères minimum, majuscule, minuscule et chiffre.
- Jetons d'activation/réinitialisation traités sous forme de condensat lorsqu'ils sont persistés par les flux révisés.
- Expiration des jetons de récupération.
- Réinitialisation et modification de profil alignées sur la même politique de mot de passe.
- Déconnexion effectuée par POST.
- reCAPTCHA v3, lorsqu'il est configuré, vérifie le succès, l'action `login` et un score minimal.

## 7. Protection contre le détournement de l'hôte

Les URL d'activation et de récupération ne sont plus construites à partir de `HTTP_HOST`. Elles utilisent `APP_URL`, définie côté serveur. La redirection HTTPS du header utilise également cette origine canonique lorsqu'elle est configurée.

Le contrôle Same-Origin des requêtes mutantes privilégie lui aussi l'hôte canonique défini par `APP_URL`.

## 8. Secrets et configuration

L'archive source contenait des identifiants MySQL en clair. Ils ont été supprimés du code actif.

`includes/connexion_db.php` lit désormais uniquement :

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

La configuration SMTP est également centralisée par variables d'environnement.

**Les identifiants historiques doivent être révoqués avant tout déploiement.** Leur retrait du ZIP ne suffit pas à les rendre sûrs s'ils ont déjà été exposés.

## 9. Sessions et requêtes sensibles

Le socle commun applique :

- sessions en mode strict ;
- cookies `HttpOnly`, `SameSite=Lax`, `Secure` sous HTTPS ;
- délai d'inactivité configurable ;
- rotation périodique de l'identifiant de session ;
- protection CSRF globale sur POST/PUT/PATCH/DELETE ;
- vérification de l'origine des requêtes mutantes ;
- routes administratives protégées par `require_admin()` ;
- actions destructives contrôlées en POST.

## 10. Base de données et sorties HTML

Les requêtes examinées qui reçoivent des valeurs utilisateur utilisent des paramètres PDO préparés. Les noms de colonnes dynamiques des actualités proviennent d'une fonction d'allowlist basée sur le schéma (`image` ou `media`).

Un second passage de sécurité a renforcé l'échappement HTML des données issues de la base ou des formulaires dans plusieurs écrans publics et administratifs, particulièrement dans les attributs HTML, listes, cartes, modales et champs cachés.

## 11. Téléversements

La fonction commune de téléversement :

- vérifie le MIME réel avec `fileinfo` ;
- accepte uniquement les formats d'image explicitement autorisés ;
- applique une limite de taille ;
- génère un nom aléatoire ;
- limite les suppressions aux dossiers autorisés.

Les dossiers `images/` et `uploads/` comportent en plus des règles Apache interdisant l'exécution de fichiers de script.

## 12. En-têtes HTTP

Le bootstrap applicatif envoie :

- Content Security Policy ;
- HSTS lorsque le site fonctionne réellement sous HTTPS en production ;
- `X-Content-Type-Options: nosniff` ;
- `X-Frame-Options: SAMEORIGIN` ;
- Referrer-Policy ;
- Permissions-Policy ;
- Cross-Origin-Opener-Policy.

La CSP attribue désormais un nonce aléatoire à chaque bloc JavaScript, n’autorise plus globalement les scripts inline et bloque les gestionnaires d'événements HTML avec `script-src-attr 'none'`. Les interactions ont été migrées vers des écouteurs JavaScript natifs. Les styles inline hérités restent compatibles pendant leur extraction progressive.

## 13. Nettoyage technique

- Retrait de la fonction frontend FCM legacy invalide/historique.
- Retrait du faux écran de recherche d'exemple non utilisé.
- Retrait d'une image d'état vide chargée depuis un domaine tiers dans l'administration.
- Centralisation de la recherche réelle dans `/recherche`.
- Conservation de PHPMailer uniquement comme dépendance backend de messagerie.

## 14. Contrôles réalisés

- Syntaxe PHP de l'ensemble du projet.
- Syntaxe JavaScript des scripts applicatifs.
- Recherche de Bootstrap, `data-bs-*`, jQuery, AOS, Animate.css, React, Vue, Angular et Tailwind dans le frontend actif.
- Recherche de secrets historiques et de clés longues évidentes.
- Recherche de `move_uploaded_file` hors de la fonction commune sécurisée.
- Vérification de la protection des scripts administratifs.
- Vérification des cibles du registre des routes.
- Test HTTP local des routes sans base de données.
- Vérification de la normalisation du document HTML rendu.
- Test des thèmes, de la recherche, du menu mobile, des pièges de focus, de la fermeture par Échap et de la restitution du focus.
- Contrôle visuel sur ordinateur et mobile, en thèmes clair et sombre, sans débordement horizontal.
- Vérification des en-têtes de sécurité, de l'absence de `X-Powered-By`, du rejet CSRF et du blocage HTTP des fichiers sensibles.

## 15. Limites de validation

L'environnement de travail ne contient pas les vraies informations de connexion MySQL, le serveur SMTP de production ni les clés reCAPTCHA finales. Les parcours dépendant de ces services ne peuvent donc pas être validés de bout en bout ici.

Avant publication, une préproduction connectée à une copie de la base réelle doit tester l'inscription, l'activation, la connexion, la récupération de compte, les formations, les projets, le forum, les messages, les médias et chaque action d'administration.

## 16. Conclusion

Le site est désormais structuré autour d'une interface native commune, responsive et plus cohérente, avec recherche et thèmes intégrés, tout en préservant le backend PHP existant. Les défauts de sécurité les plus critiques identifiés dans l'archive — en particulier les secrets codés en dur, la construction de liens depuis `Host`, les actions historiques et plusieurs sorties non échappées — ont été traités dans le code livré.

## 17. Parcours de formation

Le catalogue et les parcours de formation ont fait l'objet d'une seconde refonte dédiée :

- recherche instantanée avec conservation des filtres dans l'URL ;
- filtres par domaine professionnel, niveau et tarif ;
- tri par titre, prix ou prochaine session ;
- cartes détaillées présentant uniquement les informations réellement stockées ;
- fiche structurée en aperçu, compétences, méthode et programme ;
- action d'inscription persistante et état utilisateur explicite ;
- sélection accessible des modules et de trois disponibilités maximum ;
- récapitulatif avant transmission et contrôle serveur des valeurs autorisées ;
- vérification de l'inscription avant tout accès au planning ;
- correction de l'enregistrement de la durée dans l'administration ;
- harmonisation de l'espace « Mes formations » avec les inscriptions et alertes réelles.

Les nouveaux écrans ont été contrôlés en thèmes clair et sombre, sur ordinateur et sur une largeur mobile de 390 pixels. La recherche, les filtres, le compteur, l'état vide et la limite des disponibilités ont été testés dans le navigateur local.
