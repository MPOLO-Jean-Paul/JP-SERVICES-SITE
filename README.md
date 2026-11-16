# JP-Services — plateforme web

Site et plateforme de JP-Services (Lubumbashi, RDC) : formations, sessions en direct, médiathèque de logiciels, SCOLIA Pro, projets, forum d’entraide, partenariats, espace membre et console d’administration.

Cette version **remplace entièrement l’ancien site PHP et sa base MySQL**. Elle est écrite en TypeScript avec Next.js, utilise PostgreSQL et se déploie sur **Render** ou **Cloudflare Workers**.

## Technologies

| Couche | Choix |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, Turbopack) |
| Interface | React 19, Tailwind CSS 4, Radix UI, cmdk, Lucide, Sonner |
| Typographie | Geist et Geist Mono (auto-hébergées par `next/font`) |
| Données | PostgreSQL 16, Drizzle ORM, migrations versionnées, postgres.js |
| Authentification | Sessions serveur révocables, bcrypt compatible avec les anciens comptes PHP, Google Identity Services |
| E-mails | API HTTPS Resend (Render Free) ou Nodemailer (SMTP sur hébergement compatible) |
| Fichiers | Cloudflare R2 (compatible S3) ou disque local, servis par la route `/uploads` |
| Hébergement | Render (Blueprint `render.yaml`) ou Cloudflare Workers (OpenNext, Hyperdrive) |
| Langues | Français et anglais (next-intl) |
| Qualité | ESLint, TypeScript strict, Vitest, Playwright, GitHub Actions |

## Démarrage local

Prérequis : Node.js 22, pnpm 10 et PostgreSQL 16.

```bash
pnpm install
cp .env.example .env          # DATABASE_URL, APP_SECRET, et STORAGE_DRIVER=local en local
# Base vierge (tables vides + paramètres du site + premier administrateur)
ADMIN_EMAIL=admin@exemple.test ADMIN_PASSWORD='Admin-Demo-2026' pnpm db:reset --yes
# Facultatif : contenus de démonstration (formations, actualités, logiciels…)
SEED_DEMO=1 pnpm db:seed
pnpm dev                      # http://localhost:3000
```

Sans SMTP configuré, les codes d’activation et de réinitialisation s’affichent dans la console du serveur de développement.

## Scripts

| Commande | Rôle |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` puis `pnpm start` | Build et serveur de production |
| `pnpm lint` / `pnpm typecheck` | Qualité du code |
| `pnpm test` | Tests unitaires (Vitest) |
| `pnpm test:e2e` | Tests de bout en bout (Playwright) |
| `pnpm db:migrate` | Applique les migrations SQL du dossier `drizzle/` |
| `pnpm db:generate` | Génère une migration après modification du schéma |
| `pnpm db:reset --yes` | Recrée une base vierge : efface tout, rejoue les migrations, installe la configuration de base |
| `pnpm db:seed` | Paramètres, catégories et, en option, administrateur et contenus de démonstration |
| `pnpm db:import-mysql` | Importe les données de l’ancienne base MySQL dans PostgreSQL |
| `pnpm storage:upload-r2` | Envoie les fichiers locaux (`uploads/`) vers Cloudflare R2 |
| `pnpm cf:preview` / `pnpm cf:deploy` | Build Cloudflare (OpenNext), aperçu local workerd, déploiement |
| `pnpm icons` | Régénère les icônes PWA à partir du symbole « Élan » |

## Organisation du code

```
src/
├─ app/
│  ├─ (site)/        pages publiques et espace membre
│  ├─ (auth)/        connexion, inscription, activation, mot de passe
│  ├─ admin/         console d’administration (19 rubriques)
│  ├─ api/           recherche globale et sonde /api/health
│  ├─ uploads/       médias téléversés (disque ou R2)
│  └─ telecharger/   téléchargements contrôlés des logiciels
├─ components/       interface (ui, site, visuals, admin, formulaires)
├─ server/
│  ├─ db/            schéma Drizzle et connexion PostgreSQL (Node ou Workers)
│  ├─ auth/          sessions, mots de passe, Google
│  ├─ actions/       Server Actions (formulaires publics et administration)
│  ├─ services/      requêtes de lecture
│  ├─ mail/          e-mails transactionnels
│  └─ storage/       téléversements (R2/S3 ou disque)
├─ i18n/ et messages/  traductions FR / EN
└─ lib/              utilitaires, SEO, constantes
```

## Design

L’identité visuelle a été entièrement refaite. Elle ne réutilise aucune image ni aucun pictogramme de l’ancien site.

- Neutres précis, un seul accent cobalt, thèmes clair, sombre et système.
- Monogramme vectoriel « JP » ; icônes PWA générées à partir de ce SVG.
- Aucune photo décorative : les couvertures des formations et les aperçus d’interface sont générés en code.
- Les images téléversées depuis la console (dossier `uploads/`) restent affichées.

Consultez [DEPLOIEMENT.md](DEPLOIEMENT.md) pour la mise en production.
