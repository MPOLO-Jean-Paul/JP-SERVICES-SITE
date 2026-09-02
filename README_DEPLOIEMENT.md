# JP-SERVICES — Déploiement de la refonte native 2026

## 1. Prérequis

- PHP **8.1+** (validation réalisée sous PHP 8.4).
- Apache 2.4 recommandé avec `mod_rewrite` et `mod_headers`.
- Extensions PHP : `pdo_mysql`, `fileinfo`, `mbstring`, `openssl`, `json`.
- MySQL/MariaDB en `utf8mb4`.
- HTTPS obligatoire en production.

La couche d'interface ne dépend plus de Bootstrap, jQuery, AOS ou Animate.css. Le comportement de l'interface est assuré par **JavaScript natif** (`js/site-ui.js`) et le design system par les feuilles CSS du projet.

## 2. Mesure impérative avant mise en production

L'archive d'origine contenait des identifiants de base de données en clair. Ils ont été retirés du code livré, mais ils doivent être considérés comme compromis.

Avant tout déploiement :

1. changer le mot de passe MySQL/MariaDB historique ;
2. changer tout mot de passe SMTP historique ayant pu être réutilisé ;
3. ne jamais remettre les anciennes valeurs dans un fichier PHP ;
4. stocker les nouveaux secrets uniquement dans `.env` ou dans les variables d'environnement de l'hébergeur.

## 3. Configuration `.env`

Copier `.env.example` vers `.env`, puis renseigner les vraies valeurs :

```dotenv
APP_ENV=production
APP_KEY=generez-ici-une-cle-aleatoire-longue
APP_TIMEZONE=Africa/Lubumbashi
APP_BASE_PATH=
APP_URL=https://votre-domaine.tld
SESSION_NAME=jp_session
SESSION_IDLE_TIMEOUT=7200
SESSION_ROTATE_INTERVAL=900

DB_HOST=localhost
DB_PORT=3306
DB_NAME=nom_base
DB_USER=utilisateur_base
DB_PASSWORD=mot_de_passe_aleatoire_nouveau

SMTP_HOST=smtp.exemple.tld
SMTP_PORT=587
SMTP_ENCRYPTION=tls
SMTP_USERNAME=compte_smtp
SMTP_PASSWORD=mot_de_passe_smtp_nouveau
SMTP_FROM_ADDRESS=contact@votre-domaine.tld
SMTP_FROM_NAME="JP-SERVICES"
SMTP_REPLY_TO=
SMTP_TIMEOUT=15

RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_ALLOWED_HOSTED_DOMAIN=
```

### `APP_URL`

`APP_URL` doit contenir **l'origine canonique HTTPS du site**. Elle sert notamment à construire les liens d'activation et de récupération de compte sans faire confiance à l'en-tête `Host` du navigateur.

Exemple :

```dotenv
APP_URL=https://jp-services.cd
```

### `APP_BASE_PATH`

Laisser vide si le projet est installé à la racine du domaine. Pour une installation dans `https://domaine.tld/plateforme/`, utiliser :

```dotenv
APP_BASE_PATH=plateforme
```

Le fichier `.env` ne doit jamais être publié, envoyé par e-mail, ajouté à Git ou inclus dans une archive publique.

## 4. Base de données

Exécuter `MIGRATION.sql` sur une sauvegarde ou une base de préproduction avant le passage en production. Toujours effectuer une sauvegarde complète de la base avant toute migration.

## 4.1 Connexion Google et e-mails transactionnels

Dans Google Cloud Console, l’ID client OAuth doit être de type **Application Web**. Ajoutez l’origine JavaScript autorisée exacte :

```text
https://jp-services.wuaze.com
```

Ajoutez aussi chaque origine locale réellement utilisée, par exemple `http://localhost:8000`. Le flux actuel utilise le bouton Google en fenêtre contextuelle et vérifie le jeton sur le serveur ; il ne requiert pas d’URI de redirection OAuth. Le `GOOGLE_CLIENT_SECRET` éventuellement présent dans `.env` reste privé et n’est jamais envoyé au navigateur ; il n’est pas utilisé par ce flux de vérification de jeton.

Pour l’e-mail, renseignez une adresse expéditrice autorisée chez votre fournisseur SMTP. Avec Gmail, utilisez un **mot de passe d’application**, jamais le mot de passe du compte. Après déploiement, connectez-vous comme administrateur et envoyez un test depuis `/admin/smtp-test` avant d’ouvrir les inscriptions au public.

Sur une base existante, exécutez également `MIGRATION_google_auth.sql` après sauvegarde pour créer les colonnes `google_id` et `auth_provider`. Une installation neuve à partir de `JP_SERVICES_BASE_COMPLETE_V2.sql` les contient déjà.

## 5. Installation

Téléverser l'ensemble du projet en conservant l'arborescence :

- `.htaccess`
- `router.php`
- `app/`
- `includes/`
- `css/`
- `js/`
- `images/`
- `uploads/`
- `admin/`

Permissions usuelles :

- dossiers : `0755` ;
- fichiers : `0644` ;
- dossiers réellement écrits par PHP : `0755` ou `0775` selon l'hébergeur.

Dossiers pouvant nécessiter une écriture PHP :

- `storage/logs/`
- `images/profils/`
- `images/formations/`
- `images/produits/`
- `uploads/actualites/`
- `admin/images/`

Éviter `0777` sauf contrainte documentée de l'hébergeur.

## 6. URL propres

Le routeur central publie des URL métier, par exemple :

- `/formations`
- `/formation?id=12`
- `/actualites`
- `/projets`
- `/forum`
- `/profil`
- `/admin`
- `/admin/utilisateurs`

Les anciennes URL `.php` déclarées dans la table de routes sont redirigées vers leur URL métier.

## 7. Fonctions d'interface à contrôler

Après mise en ligne, vérifier au minimum :

1. affichage ordinateur, tablette et mobile ;
2. menu mobile et panneaux utilisateur ;
3. recherche globale du header et raccourci `Ctrl/Cmd + K` ;
4. thème **Clair / Sombre / Système** et persistance après rechargement ;
5. animations d'apparition et comportement avec « réduire les animations » activé au niveau du système ;
6. onglets, modales et fenêtres de confirmation de l'administration ;
7. navigation clavier et visibilité du focus.

## 8. Parcours de compte à contrôler

1. créer un compte ;
2. recevoir et ouvrir le lien d'activation ;
3. se connecter avec **l'adresse e-mail** ;
4. tester un mauvais mot de passe et la limitation des tentatives ;
5. lancer « Mot de passe oublié » ;
6. ouvrir le lien de réinitialisation ;
7. vérifier l'expiration du jeton ;
8. modifier le profil et le mot de passe ;
9. vérifier la déconnexion par POST ;
10. contrôler les droits d'accès à toutes les routes `/admin/*` avec un compte non administrateur.

Les mots de passe nouveaux sont soumis à une politique de 10 à 128 caractères, avec majuscule, minuscule et chiffre. Les tentatives de connexion et de récupération sont limitées côté serveur.

## 9. Vérifications métier

Sur une copie de la base réelle :

- publier/modifier/supprimer une formation ;
- s'abonner et enregistrer un planning ;
- publier une actualité et vérifier ses médias ;
- soumettre et traiter un projet ;
- créer une publication forum et un commentaire ;
- envoyer un message de contact ;
- vérifier les pages utilisateurs et les tableaux admin ;
- tester newsletter, SMTP et reCAPTCHA si configurés.

## 10. Sécurité opérationnelle

Le projet applique notamment :

- requêtes PDO préparées sur les entrées utilisateur ;
- protection CSRF globale des requêtes mutantes ;
- contrôle d'origine ;
- cookies de session `HttpOnly` et `SameSite=Lax`, avec `Secure` sous HTTPS ;
- expiration d'inactivité et rotation périodique de session ;
- vérification de l'origine du téléversement, du type MIME réel, des dimensions et du poids des images, avec noms de fichiers aléatoires ;
- blocage de l'exécution de scripts dans `images/` et `uploads/` ;
- en-têtes CSP, HSTS sous HTTPS, `nosniff`, `SAMEORIGIN`, Referrer-Policy et Permissions-Policy ;
- échappement HTML des données dynamiques dans les interfaces révisées.

La CSP utilise un nonce aléatoire pour les blocs JavaScript et interdit les gestionnaires d'événements JavaScript inline avec `script-src-attr 'none'`. Certains styles inline historiques restent temporairement compatibles pendant leur extraction progressive ; `APP_KEY` doit être une valeur aléatoire longue et propre à l’installation.

## 11. Journaux et diagnostic

Les erreurs PHP sont journalisées dans :

```text
storage/logs/php-error.log
```

Le mode production masque les erreurs internes aux visiteurs. Pour diagnostiquer temporairement en préproduction :

```dotenv
APP_ENV=development
```

Ne pas laisser ce mode actif sur le site public.

## 12. Retour arrière

Avant remplacement : sauvegarder les fichiers et exporter la base. En cas d'incident, restaurer les fichiers et, seulement si nécessaire, la base sauvegardée. **Ne jamais réutiliser les anciens secrets exposés.**
