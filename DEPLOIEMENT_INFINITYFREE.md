# Déploiement JP-Services sur InfinityFree

## Cause du message 403

InfinityFree affiche cette page lorsqu'aucun fichier d'index valide n'est présent directement dans le dossier `htdocs` associé au domaine. Le projet contient bien un fichier `index.php` : l'erreur signifie généralement que le dossier complet `SITE JP SERVICES` a été envoyé dans `htdocs` au lieu de son contenu.

Structure incorrecte :

```text
htdocs/
└── SITE JP SERVICES/
    ├── index.php
    ├── router.php
    └── ...
```

Structure correcte :

```text
htdocs/
├── index.php
├── router.php
├── .htaccess
├── admin/
├── app/
├── css/
├── images/
├── includes/
├── js/
├── storage/
└── uploads/
```

## Procédure

1. Télécharger `JP-SERVICES-INFINITYFREE-DESIGN-20260812.zip` sur l'ordinateur et l'extraire localement.
2. Ouvrir le gestionnaire FTP du domaine concerné.
3. Entrer dans le dossier `htdocs` associé exactement à ce domaine.
4. Supprimer uniquement l'ancienne page par défaut `index2.html` si elle est présente.
5. Envoyer **le contenu extrait**, et non le dossier parent ni l'archive ZIP seule.
6. Vérifier que `htdocs/index.php`, `htdocs/router.php` et `htdocs/.htaccess` existent directement.
7. Envoyer séparément le fichier local `.env` dans `htdocs/.env`. Il est volontairement absent de l'archive afin d'éviter de diffuser les secrets de production.
8. Utiliser `755` pour les dossiers et `644` pour les fichiers lorsque le client FTP permet de régler les permissions.
9. Vider le cache du navigateur et rouvrir le domaine en HTTPS.

Configuration minimale attendue dans `.env` :

```dotenv
APP_ENV=production
APP_URL=https://jp-services.wuaze.com
APP_BASE_PATH=
APP_KEY=une-cle-aleatoire-longue-et-unique

DB_HOST=nom-hote-mysql-fourni-par-infinityfree
DB_PORT=3306
DB_NAME=nom-base-fourni
DB_USER=utilisateur-fourni
DB_PASSWORD=mot-de-passe-base
```

Ne jamais placer `.env` dans une archive publique, un dépôt Git ou une pièce jointe. Après le téléversement, vérifier que `https://jp-services.wuaze.com/.env` renvoie bien une interdiction et ne montre aucun contenu.

## Contrôle rapide

- Si `/index.php` renvoie encore 403, le fichier n'est pas dans le bon `htdocs` ou ses permissions sont incorrectes.
- Si le site renvoie ensuite 503, la racine est corrigée mais `.env` ou la base MySQL n'est pas encore configurée.
- Si le site renvoie 500, renommer temporairement `htdocs/.htaccess` en `htdocs/.htaccess.off`, puis actualiser la page.
  - Si la réponse change, remettre le fichier `.htaccess` fourni dans l'archive corrective. La version corrective n'utilise plus `Options -Indexes` ni `Require all denied`, deux directives susceptibles d'être refusées sur certains hébergements mutualisés.
  - Si la réponse ne change pas, la panne vient de PHP : vérifier que `.env` existe et que `storage/logs` est accessible en écriture, puis lire `storage/logs/php-error.log`.

Le projet requiert PHP 8.1 ou plus récent et les extensions `pdo_mysql`, `fileinfo` et `openssl`. L'extension `mbstring` reste recommandée, mais une couche de compatibilité UTF-8 empêche désormais les pages Actualités et Formations de tomber en erreur 500 lorsqu'elle n'est pas activée par l'hébergeur.

Ne laissez jamais `APP_ENV=development` ni l'affichage public des erreurs activé en production. Le journal `storage/logs/php-error.log` permet d'obtenir le détail sans exposer de secrets aux visiteurs.

## Mise à jour du design

Pour une installation déjà fonctionnelle, envoyer au minimum les fichiers suivants en conservant leur arborescence :

- `index.php`
- `actualites.php`
- `langue.php`
- `app/bootstrap.php`
- `app/i18n.php`
- `app/routes.php`
- `app/formation_helpers.php`
- `includes/header.php`
- `includes/footer.php`
- `includes/connexion_db.php`
- `css/app.css`
- `css/classroom-refinement.css`
- `js/site-ui.js`

La préférence Français/English est conservée dans une session et un cookie de langue. Après la mise à jour, tester le changement de langue depuis l'entête, le panneau de compte mobile et le pied de page.

Le fichier local `.env` reste volontairement absent de l'archive. Ne supprimez pas et ne remplacez pas le fichier `htdocs/.env` déjà configuré sur le serveur.

## Connexion Google et e-mails

Ajoutez dans `.env` les valeurs SMTP réelles, `GOOGLE_CLIENT_ID` et, si nécessaire, `GOOGLE_ALLOWED_HOSTED_DOMAIN`. Dans Google Cloud Console, l’origine JavaScript autorisée de l’ID client Web doit être exactement :

```text
https://jp-services.wuaze.com
```

Le flux Google vérifie le jeton côté serveur et ne demande pas d’URI de redirection. Ne placez jamais le secret client Google dans une page HTML ou JavaScript. Après l’envoi des fichiers, ouvrez `/admin/smtp-test` avec un compte administrateur et envoyez un e-mail de test ; les liens d’activation et de réinitialisation dépendront de ce résultat.
