# JP-Services — plateforme web

Site et plateforme de JP-Services (Lubumbashi, RDC) : formations, sessions en direct, médiathèque de logiciels, SCOLIA Pro, projets, forum d’entraide, partenariats, espace membre et console d’administration.

Cette version **remplace entièrement l’ancien site PHP**. Elle est écrite en TypeScript avec Next.js et reste compatible avec la base MySQL de production existante.

## Technologies

| Couche | Choix |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions, Turbopack) |
| Interface | React 19, Tailwind CSS 4, Radix UI, cmdk, Lucide, Sonner |
| Typographie | Geist et Geist Mono (auto-hébergées par `next/font`) |
| Données | MySQL / MariaDB, Drizzle ORM, migrations versionnées |
| Authentification | Sessions serveur révocables, bcrypt compatible avec les anciens comptes PHP, Google Identity Services |
| E-mails | Nodemailer (SMTP) |
| Fichiers | Disque local ou stockage compatible S3 (Cloudflare R2, AWS S3, MinIO) |
| Langues | Français et anglais (next-intl) |
| Qualité | ESLint, TypeScript strict, Vitest, Playwright, GitHub Actions |

## Démarrage local

Prérequis : Node.js 22 et pnpm 10, MySQL 8 ou MariaDB 10.11.

```bash
pnpm install
cp .env.example .env          # renseigner DATABASE_URL et APP_SECRET
pnpm db:migrate               # crée les tables
SEED_DEMO=1 ADMIN_EMAIL=admin@exemple.test ADMIN_PASSWORD='Admin-Demo-2026' pnpm db:seed
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
| `pnpm db:seed` | Paramètres, catégories et, en option, administrateur et contenus de démonstration |
| `pnpm db:upgrade-legacy` | Met à niveau une base de l’ancien site PHP sans perte de données |
| `pnpm icons` | Régénère les icônes PWA à partir du monogramme |

## Organisation du code

```
src/
├─ app/
│  ├─ (site)/        pages publiques et espace membre
│  ├─ (auth)/        connexion, inscription, activation, mot de passe
│  ├─ admin/         console d’administration (19 rubriques)
│  ├─ api/           recherche globale
│  └─ telecharger/   téléchargements contrôlés des logiciels
├─ components/       interface (ui, site, visuals, admin, formulaires)
├─ server/
│  ├─ db/            schéma Drizzle et connexion MySQL
│  ├─ auth/          sessions, mots de passe, Google
│  ├─ actions/       Server Actions (formulaires publics et administration)
│  ├─ services/      requêtes de lecture
│  ├─ mail/          e-mails transactionnels
│  └─ storage/       téléversements (local ou S3)
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
