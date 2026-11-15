# Mise en production

## 1. Choisir un hébergement Node.js

L’ancien hébergeur **InfinityFree ne peut pas exécuter ce site** : il ne propose que PHP. Next.js a besoin d’un environnement Node.js 22.

| Option | Pour qui | Base de données | Fichiers téléversés |
|---|---|---|---|
| **VPS + Docker** (Hetzner, Contabo, OVH…) | Contrôle complet, coût fixe | MySQL inclus dans `docker-compose.yml` | Volume Docker `uploads` |
| **Vercel** | Le plus simple, CDN mondial | MySQL externe accessible à distance (Aiven, TiDB Cloud, PlanetScale, ou votre serveur) | `STORAGE_DRIVER=s3` obligatoire (Cloudflare R2 conseillé) |
| **Render / Railway** | Simple, serveur persistant | MySQL du fournisseur ou externe | Disque persistant ou S3 |

## 2. Variables d’environnement

Copiez `.env.example`. Les variables indispensables :

| Variable | Rôle |
|---|---|
| `APP_URL` | Origine HTTPS canonique, par exemple `https://jp-services.org`. Sert aux liens des e-mails, au sitemap et au SEO. |
| `APP_SECRET` | Au moins 32 caractères aléatoires : `openssl rand -base64 48`. |
| `DATABASE_URL` | `mysql://utilisateur:motdepasse@hote:3306/base` |
| `SMTP_*` | Envoi des codes d’activation, réinitialisations et notifications. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Facultatif. Active « Continuer avec Google ». |
| `STORAGE_DRIVER`, `S3_*` | `local` sur un serveur, `s3` sur Vercel. |

Les anciens identifiants MySQL et SMTP présents dans l’archive PHP doivent être considérés comme compromis. Créez-en de nouveaux.

## 3. Base de données

### Base existante de l’ancien site (cas habituel)

1. Faites une sauvegarde complète (export phpMyAdmin ou `mysqldump`).
2. Pointez `DATABASE_URL` vers cette base.
3. Lancez :

```bash
pnpm db:upgrade-legacy
```

Le script ajoute seulement ce qui manque : colonnes `google_id`, `auth_provider`, `themes`, et tables `sessions`, `rate_limits`, `audit_log`. Il ne supprime et ne modifie aucune donnée. Il peut être relancé sans risque.

Les membres gardent leur mot de passe : les condensats PHP (`$2y$`) sont reconnus, puis renforcés automatiquement à leur prochaine connexion.

### Installation neuve

```bash
pnpm db:migrate
ADMIN_EMAIL=vous@domaine.tld ADMIN_PASSWORD='Mot-De-Passe-Solide-2026' pnpm db:seed
```

## 4. Déployer

### VPS avec Docker

```bash
cp .env.example .env     # APP_URL, APP_SECRET, SMTP, DB_PASSWORD, DB_ROOT_PASSWORD, ADMIN_*
docker compose up -d --build
```

Placez un proxy HTTPS devant le port 3000 (Caddy ou Nginx avec Let’s Encrypt). Pour reprendre une base existante, importez la sauvegarde dans le conteneur `db`, puis exécutez `docker compose run --rm migrate pnpm db:upgrade-legacy`.

### Vercel

1. Importez le dépôt GitHub dans Vercel.
2. Renseignez les variables d’environnement, avec `STORAGE_DRIVER=s3` et les clés R2.
3. Lancez `pnpm db:upgrade-legacy` ou `pnpm db:migrate` une fois depuis votre poste, avec la `DATABASE_URL` de production.

## 5. Fichiers existants

Les images de profil (`images/profils/`) sont conservées dans `public/images/profils/`. Les médias des actualités (`uploads/actualites/`) sont dans `public/uploads/actualites/`. Les fichiers de logiciels hébergés (`uploads/logiciels/`) doivent être copiés depuis l’ancien serveur vers `public/uploads/logiciels/`, ou vers le bucket S3 sous le même chemin.

Les anciennes images de couverture des formations ne sont plus affichées : une couverture est générée selon le domaine. Téléversez une nouvelle image depuis la console si vous le souhaitez.

## 6. Après la mise en ligne

1. Ouvrez **Administration → Santé du système** : base, migrations, SMTP, stockage et Google doivent être au vert.
2. Envoyez un e-mail de test depuis cette page.
3. Créez un compte de test, activez-le, connectez-vous, inscrivez-vous à une formation.
4. Dans Google Cloud Console, ajoutez `APP_URL` aux origines JavaScript autorisées de l’ID client OAuth.
5. Soumettez `https://votre-domaine/sitemap.xml` dans Google Search Console.

Les anciennes adresses `.php` sont redirigées de façon permanente vers les nouvelles routes : le référencement est conservé.

## 7. Sécurité intégrée

- Sessions stockées en base, cookie `HttpOnly`, `SameSite=Lax`, `Secure` en production, révocation à la réinitialisation du mot de passe.
- Server Actions protégées par Next.js contre les requêtes d’une autre origine.
- Limitation des tentatives en base : connexion, inscription, activation, réinitialisation et formulaires publics.
- Validation stricte des entrées (Zod) et requêtes paramétrées (Drizzle).
- Téléversements contrôlés par signature binaire, taille limitée et noms aléatoires.
- En-têtes HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy` et `Permissions-Policy`.
- Journal d’activité des actions d’administration.
