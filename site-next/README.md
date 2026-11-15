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
