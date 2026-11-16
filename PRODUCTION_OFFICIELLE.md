# Déploiement officiel de JP-Services

## Architecture
- **Domaine canonique** : `https://jp-services.org` (redirection `www` intégrée)
- **Application** : `jp-services-production` (Render, Francfort, Node 22, Next.js)
- **PostgreSQL** : `jp-services-production-db` (Render, Francfort, réseau interne)
- **Prévualisation indépendante** : `jp-services-claude-preview.onrender.com` (inchangée)
- **Fichiers** : Cloudflare R2 privé, bucket `jp-services-uploads`
- **Messagerie** : compte SMTP de `contact@jp-services.org` (secrets dans Render uniquement)

Le fichier `render.production.yaml` prépare l'infrastructure. Il ne déploie ni ne facture à lui seul.

## Budget à autoriser
Tarif Render de référence (novembre 2026) : instance web 0.5c-512mb **7 USD/mois**
et PostgreSQL 0.1c-256mb **6 USD/mois**, soit **13 USD/mois** avant bande passante,
stockage R2 ou extensions. Vérifier le prix final proposé par Render.

La base de démonstration actuelle est gratuite et **expire le 15/12/2026** :
ne pas en faire la base du site officiel. La production reçoit une base séparée.

## Mise en œuvre ordonnée
1. **Valider le budget et la création des ressources.** Créer/approuver un Blueprint
   Render à partir de la branche `ccr-598b649d-2fiktj`, fichier
   `render.production.yaml`. Aucun changement de `main` n'est nécessaire.
2. **Renseigner les secrets** uniquement dans le tableau de bord Render :
   `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
   `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`.
   Ne pas envoyer les mots de passe dans GitHub ou dans le chat. Le Blueprint
   fournit directement `DATABASE_URL` via la base gérée et génère `APP_SECRET`.
3. **Valider la base** : le démarrage `pnpm db:migrate && pnpm start` applique les
   migrations. Vérifier `https://jp-services-production.onrender.com/api/health`
   (HTTP 200 avec `database:ok`) puis les parcours.
4. **Initialiser l'administration** : utiliser les commandes
   `ADMIN_EMAIL=… ADMIN_PASSWORD=… pnpm db:seed` dans un environnement
   sécurisé possédant les variables de la production. Ne jamais committer les
   identifiants, et ne pas lancer `db:reset` sur la production.
5. **Vérifier** : inscription, connexion, fermeture de session, récupération
   de mot de passe, messagerie, envoi de formulaire, création de cours,
   recherche, upload et téléchargement R2, changements de thème/langue.
   Importer les anciennes données MySQL uniquement après validation d'un
   export de sauvegarde et de la méthode d'importation.
6. **Rattacher le domaine officiel dans Cloudflare** après les vérifications :
   conserver les enregistrements `MX`, `TXT` (SPF, DKIM, DMARC) et autres
   sous-domaines; modifier uniquement l'origine web `@` et `www`.
   Créer des `CNAME` vers le domaine `.onrender.com` **exact** affiché par
   Render. Les mettre d'abord en **DNS only** ; vérifier le domaine et les
   certificats dans Render ; passer Cloudflare en **Full (strict)**.
7. **Vérifier après bascule** : HTTPS, redirection `www`, anciennes URLs PHP,
   `/api/health` et tous les parcours de compte. Activer les déploiements
   automatiques seulement après acceptation des tests de production.

## Limites connues
- Une URL officielle et un build réussi ne suffisent pas à rendre tous les
  parcours opérationnels : il faut la base, le SMTP et R2 correctement configurés.
- La prévisualisation doit rester indépendante pour tester les nouveaux designs.
- Les offres Render gratuites ne sont pas adaptées au fonctionnement permanent :
  mise en veille, absence de Shell et ports SMTP bloqués.
- Render n'offre aucun outil direct de modification des DNS Cloudflare ici.
  Les changements DNS nécessitent une action dans le tableau de bord Cloudflare.


## Renforcement des contrôles avant le domaine officiel (16/11/2026)

- La validation Render utilise désormais son **URL réelle**
  `https://jp-services-db-validation-75v5.onrender.com` comme `APP_URL`.
  Cela évite d'émettre de mauvais liens de retour dans les courriers et
  métadonnées. Mettre à jour la configuration Render par une synchronisation
  manuelle du Blueprint pour appliquer cette modification.
- La route `/api/health` teste désormais à la fois la connexion PostgreSQL
  et l'accès en lecture à trois tables réelles : `site_settings`, `users`,
  `messages`. Un défaut de schéma ou de base donne **HTTP 503** et bloque
  la readiness (sans révéler de mot de passe ni le détail des erreurs).
- En production uniquement, le démarrage exécute
  `scripts/check-production-env.ts` avant les migrations. Ce précontrôle
  exige les secrets d'application, SMTP et R2 et l'URL HTTPS canonique.
  Il ne vérifie pas l'envoi réel d'e-mails : un test transactionnel sur
  le domaine officiel reste nécessaire après mise en route.
- Ne pas brancher `jp-services.org` sur une offre gratuite ni sur la base
  de validation : sa fin de validité est annoncée pour le **15/12/2026**.
- Le basculement DNS et la facturation ne sont pas automatisés par ces fichiers.

## Variante sans carte bancaire
Le fichier `render.free-official.yaml` et le guide `DEPLOIEMENT_GRATUIT.md`
préparent un service Render gratuit branché sur Neon Free (PostgreSQL et stockage
objet) et Resend Free par API HTTPS. **N'activer le domaine qu'après une validation
de bout en bout.** Render Free et Neon Free restent soumis aux quotas.
