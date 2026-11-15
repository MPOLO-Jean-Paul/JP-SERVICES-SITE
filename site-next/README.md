# JP-SERVICES — nouvelle vitrine Next.js

## Périmètre de la livraison

Nouvelle vitrine **entièrement distincte** de l'application PHP historique : design responsive original (aucune ancienne photo ni illustration), navigation, thèmes clair/sombre, pages Expertises, Formations, Logiciels, Réalisations, Actualités, À propos et Contact. Recherche et filtres interactifs. Routes serveur Next.js pour la santé, le catalogue PostgreSQL et l'enregistrement des messages.

**Important :** ceci n'est pas encore une migration fonctionnelle de tous les modules du site historique. Les comptes, authentification, inscriptions aux formations, commentaires, paiements, téléversements, espace membre, newsletter et administration ne sont **pas encore migrés**. Ne pas basculer le domaine de production avant les migrations non destructives et les tests métier.

## Développement local

- Node.js 22 ou supérieur.
- Depuis le répertoire `site-next` : `npm install`, copier `.env.example` vers `.env.local`, puis `npm run dev`.
- Ouvrir `http://localhost:3000`.
- Sans base, la vitrine fonctionne en **mode présentation**. Le formulaire Contact affiche une indisponibilité explicite tant qu'aucune base n'est configurée.

## PostgreSQL partagé entre Render et Cloudflare

Créer une base PostgreSQL gérée (par exemple Neon) et exécuter `db/001_initial.sql` depuis l'éditeur SQL de la base. Configurer les variables d'environnement suivantes **en secrets serveur** :

- `DATABASE_URL` : chaîne de connexion `postgresql://...` (à garder secrète).
- `CONTACT_RATE_LIMIT_SALT` : valeur aléatoire privée d'au moins 24 caractères.
- `CONTACT_EMAIL` : adresse publique de contact.
- `NEXT_PUBLIC_SITE_URL` : URL canonique HTTPS du futur site.

Le client HTTP Neon est compatible avec Node.js et Workers. La base est unique et externe : ni SQLite local, ni données d'établissement ne sont transférées automatiquement. Une sauvegarde et une politique de rétention sont nécessaires avant utilisation réelle.

Les fiches codées dans `src/lib/content.ts` sont des **contenus éditoriaux de présentation** ; leurs modalités sont à confirmer. `GET /api/catalogue?kind=service` retourne les fiches publiées si la base est configurée, ou les fiches de présentation sinon. La console d'administration du catalogue reste à construire.

## Render

Le fichier `render.yaml` à la racine du dépôt décrit un service Node avec `rootDir: site-next`. Dans Render, créer un Blueprint ou un Web Service lié au dépôt et configurer les secrets. Commandes manuelles : build `npm install --include=dev && npm run build`, start `npm run start`. Vérifier `/api/health` et la route Contact sur un domaine de préproduction.

## Cloudflare Workers

En novembre 2026, Cloudflare recommande **vinext** pour Next.js sur Workers, mais cet outil est en bêta. Initialiser depuis `site-next` en vérifiant la compatibilité avant déploiement :

1. `npm install`
2. `npx vinext check`
3. `npx vinext init`
4. `npm run build:vinext`
5. `npx @vinext/cloudflare deploy`

`vinext init` génère sa configuration Workers et ses scripts. Ne pas annoncer de déploiement Cloudflare réussi avant un build sur la plateforme, des tests fonctionnels des API et le raccordement des secrets. Cloudflare Pages avec export statique ne remplace pas Workers pour les routes dynamiques.

## Checklist de bascule

1. Confirmer le build Next.js CI et les tests responsive/accessibilité.
2. Configurer PostgreSQL en préproduction et exécuter les migrations.
3. Vérifier l'enregistrement du formulaire Contact, le catalogue, les filtres et les erreurs.
4. Migrer sans perte les contenus et fonctionnalités PHP/MySQL nécessaires.
5. Protéger le futur back-office par une authentification solide et une séparation des rôles.
6. Vérifier les déploiements Render et Cloudflare, le fonctionnement mobile et les domaines.
7. Après validation, basculer le DNS avec plan de retour arrière.

### Références de conception

Direction graphique originale inspirée des principes de hiérarchie visuelle et de sobriété de [Linear](https://linear.app) et [Vercel](https://vercel.com), sans réutilisation de leurs assets ni reproduction de leur identité.

## Console d'administration privée (phase 3)

L'espace /admin comprend un tableau de bord, la gestion éditoriale (brouillons, publication et ordre d'affichage), et une boîte de réception privée avec états lu/non lu. Son identité graphique reprend les composants du nouveau site.

**La console est désactivée par défaut** : sans base durable et secrets valides, aucune donnée privée n'est accessible. Activation sur une base PostgreSQL **Neon** :

1. Exécuter les migrations db/001_initial.sql puis db/002_admin.sql, dans cet ordre, après sauvegarde.
2. Sur votre ordinateur, lancer : node scripts/generate-admin-credentials.mjs administrateur
3. Conserver le mot de passe généré dans un gestionnaire sécurisé. Ne jamais coller la sortie de la commande dans un dépôt, ticket, chat public ou journal CI.
4. Définir uniquement dans les secrets de l'hébergement : DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET ; renseigner CONTACT_RATE_LIMIT_SALT pour le formulaire public.
5. Ouvrir /admin, vérifier le login, les sessions, les brouillons et les autorisations avant d'activer la réception de messages réels.

Les mots de passe ne sont pas stockés en clair : PBKDF2-SHA256 (240 000 itérations dans l'utilitaire), cookie HttpOnly signé, SameSite Strict, Secure en production, expiration 8 heures et sessions conservées et révocables côté PostgreSQL. Les mutations vérifient leur origine et les champs passent par une validation serveur. La tentative de connexion est limitée en base sur une fenêtre de 15 minutes.

### Base PostgreSQL : éviter une configuration incorrecte

Le client actuel @neondatabase/serverless s'utilise directement avec **Neon** (ou un proxy PostgreSQL compatible avec son protocole HTTP). Il ne se connecte pas à une base Render PostgreSQL standard sur le port TCP 5432. Pour Render Postgres, il faudrait changer le client en node-postgres, et pour Cloudflare Workers utiliser Hyperdrive et un pilote compatible avant de déployer. Ne pas utiliser une URL Render PostgreSQL avec ce client.

Render PostgreSQL gratuit **expire 30 jours après création**, avec suppression des données après la période de grâce si aucun changement de plan n'est effectué. Pour la préproduction, choisir un stockage persistant adapté avant d'accepter des demandes réelles. Le site public historique et ses données n'ont pas été migrés.


## Charte graphique éditoriale JP-SERVICES (novembre 2026)

Audit de référence de [la plateforme OpenClassrooms](https://openclassrooms.com/fr/), notamment [les parcours](https://openclassrooms.com/fr/paths), [les offres](https://openclassrooms.com/fr/offers) et leur description de [Classify, le design system](https://openclassrooms.com/fr/courses/5249021-initiez-vous-a-la-methode-atomic-design/5630311-federez-les-collaborateurs-autour-de-votre-nouveau-produit-le-design-system).

**Principes retenus** : organisation éditoriale, clarté des cartes de formation, navigation explicite, mise en avant des catégories, titres et CTA lisibles, fonctionnement sur mobile. **Aucune reproduction de leurs visuels, textes, logos ni palette violette.** Le site étant dynamique, nous n'avons pas prétendu consulter chaque écran ou vérifier la police exacte chargée dans tous les navigateurs.

**Identité propre** :
- Couleurs JP-SERVICES inchangées : bleu #416FFF, marine #142038 / #11213C, blanc et gris bleuté ; contraste et mode sombre adaptés.
- Typographie : **Manrope** pour les titres, **DM Sans** pour les composants et le corps. Ce sont nos choix, pas une attribution non vérifiée à OpenClassrooms.
- Composition : zone d'accueil blanche et bleu pâle, illustrations originales entièrement en CSS, trois axes (Formations, Expertises, Logiciels), catalogue éditorial, prévisualisation SCOLIA Pro conceptuelle et pied de page bleu nuit.
- Styles répartis entre globals.css (composants fonctionnels et administration) et editorial.css (nouvelle direction graphique).
- Domaine professionnel : **jp-services.org** ; contact officiel : **contact@jp-services.org**.

Les pages se consultent aux chemins /formations, /services, /logiciels, /projets, /actualites, /a-propos, /contact et /admin/demo sur le **même hôte du déploiement**. Ne pas mettre en service une redirection DNS automatique du domaine officiel vers la préproduction. Sur Render, conserver NEXT_PUBLIC_SITE_URL=https://jp-services-next-preview.onrender.com et l'indexation désactivée ; lors de la vraie bascule, passer NEXT_PUBLIC_SITE_URL=https://jp-services.org seulement après vérification des données et du SSL.

**Contrôles** : GitHub CI + Playwright couvrent maintenant les pages principales en 320, 390 et 1440 px, avec captures des nouveaux parcours graphiques.


## Parcours de formation détaillés (phase 4)

Les fiches pédagogiques de présentation disposent maintenant de pages :
- /formations/developpement-applications
- /formations/bases-donnees-sql
- /formations/outils-numeriques-professionnels

Chaque page comprend une introduction, des objectifs **indicatifs**, quatre modules dépliables, un exemple d'atelier, une FAQ, les informations pratiques et un accès au formulaire de contact avec sujet prérempli. Les liens sont intégrés à l'accueil, au catalogue et à la recherche globale.

Les données de démonstration sont décrites dans src/lib/formation-programs.ts. **Il ne s'agit pas d'un programme officiel finalisé.** Aucune durée, date, disponibilité, inscription, tarif, attestation, certificat ou diplôme n'est annoncé sans validation. Les pages de démonstration sont marquées noindex.

Quand DATABASE_URL est configuré, seules les formations réellement **publiées** dans public.catalogue_items sont accessibles à /formations/<slug>, et aucune fiche fictive ne remplace un contenu absent. Les fiches PostgreSQL sans programme structuré affichent une présentation factuelle avec invitation à demander le programme détaillé. Le catalogue et la recherche API exposent désormais le champ slug, compatible avec la création de fiches dans la console. Le sitemap n'annonce que les slugs publiés lorsqu'une base réelle est connectée. Les requêtes en erreur ne sont pas silencieusement remplacées par des exemples.

Les tests Playwright vérifient le rendu à 320/390/820/1440 px, le fonctionnement des modules, les liens catalogue → fiche → contact, les slugs invalides et les métadonnées de préproduction. La migration vers un catalogue réellement administrable et le suivi des inscriptions restent distincts de cette phase.
