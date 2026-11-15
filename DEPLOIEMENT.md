# Mise en production

Le site est une application **Next.js 16** (TypeScript) avec une base **PostgreSQL**. Il n’y a plus de PHP ni de MySQL. Deux hébergements sont prêts et testés :

| | **A. Render** (recommandé) | **B. Cloudflare Workers** |
|---|---|---|
| Application | Service web Node.js 22 | Worker (adaptateur OpenNext) |
| Base de données | Render PostgreSQL, créée par le Blueprint | PostgreSQL externe (Neon, Render…) via Cloudflare Hyperdrive |
| Fichiers téléversés | Cloudflare R2 | Cloudflare R2 |
| Mise en place | Un clic avec `render.yaml` | `pnpm cf:deploy` |
| Coût indicatif | Web Starter + Postgres Basic | Workers Paid (le plan gratuit limite le calcul à 10 ms par requête, insuffisant pour le rendu des pages et le hachage des mots de passe) |

Dans les deux cas, gardez votre domaine `jp-services.org` sur Cloudflare (DNS, HTTPS, CDN) et stockez les fichiers sur R2.

## 1. Préparer Cloudflare R2 (fichiers)

1. Tableau de bord Cloudflare → **R2** → créer le bucket `jp-services-uploads`.
2. **R2 → Gérer les jetons d’API** → créer un jeton « Lecture et écriture d’objets » limité à ce bucket.
3. Notez `S3_ENDPOINT` (`https://<ID_COMPTE>.r2.cloudflarestorage.com`), `S3_ACCESS_KEY_ID` et `S3_SECRET_ACCESS_KEY`.

Le bucket reste privé : le site sert lui-même les fichiers par la route `/uploads/…`.

Pour transférer les médias historiques (actualités) vers R2, une seule fois :

```bash
S3_ENDPOINT=… S3_ACCESS_KEY_ID=… S3_SECRET_ACCESS_KEY=… S3_BUCKET=jp-services-uploads pnpm storage:upload-r2
```

Copiez d’abord dans `uploads/logiciels/` les fichiers de logiciels de l’ancien serveur, s’il y en avait.

## 2. Option A : Render

1. Poussez le dépôt sur GitHub, branche `main`.
2. Render → **New → Blueprint** → choisissez le dépôt. Render lit `render.yaml` et crée :
   - le service web `jp-services` (région Francfort) ;
   - la base PostgreSQL 16 `jp-services-db`, reliée automatiquement par `DATABASE_URL` ;
   - un `APP_SECRET` aléatoire.
3. Renseignez les variables demandées : `APP_URL` (`https://jp-services.org`), les clés R2, le SMTP et, si besoin, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
4. Au démarrage, `pnpm db:migrate` crée les tables, puis le serveur démarre. La sonde `/api/health` vérifie la base.
5. Créez le premier administrateur depuis le **Shell** du service :

```bash
ADMIN_EMAIL=vous@domaine.tld ADMIN_PASSWORD='Mot-De-Passe-Solide-2026' pnpm db:seed
```

6. Domaine : Render → **Settings → Custom Domains** → ajoutez `jp-services.org`, puis créez l’enregistrement CNAME indiqué dans le DNS Cloudflare.

Le plan gratuit de Render existe mais met le site en veille après 15 minutes et sa base PostgreSQL gratuite expire après 30 jours. Pour un site professionnel, gardez les plans du Blueprint, ou utilisez une base Neon gratuite en remplaçant `DATABASE_URL`.

## 3. Option B : Cloudflare Workers

1. Créez une base PostgreSQL (par exemple Neon, région Europe) et notez son URL.
2. Créez la liaison Hyperdrive et reportez son identifiant dans `wrangler.jsonc` :

```bash
npx wrangler hyperdrive create jp-services-db --connection-string="postgres://…"
```

3. Ajoutez les secrets :

```bash
npx wrangler secret put APP_URL
npx wrangler secret put APP_SECRET        # openssl rand -base64 48
npx wrangler secret put S3_ENDPOINT
npx wrangler secret put S3_ACCESS_KEY_ID
npx wrangler secret put S3_SECRET_ACCESS_KEY
npx wrangler secret put SMTP_HOST         # et SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_ADDRESS
```

4. Appliquez les migrations depuis votre poste, puis déployez :

```bash
DATABASE_URL="postgres://…" pnpm db:migrate
DATABASE_URL="postgres://…" ADMIN_EMAIL=… ADMIN_PASSWORD=… pnpm db:seed
pnpm cf:deploy
```

5. Cloudflare → Workers → `jp-services` → **Domains & Routes** → ajoutez `jp-services.org`.

`pnpm cf:preview` lance le Worker en local (workerd) avec les valeurs de `.dev.vars`.

## 4. Reprendre les données de l’ancien site

L’ancienne base MySQL (InfinityFree) est importée dans PostgreSQL en conservant les identifiants, les comptes et leurs mots de passe.

1. Exportez la base depuis phpMyAdmin (format SQL).
2. Chargez cet export dans un MySQL temporaire sur votre poste :

```bash
docker run -d --name ancien-mysql -e MYSQL_ROOT_PASSWORD=temp -e MYSQL_DATABASE=ancien -p 3307:3306 mysql:8.4
docker exec -i ancien-mysql mysql -uroot -ptemp ancien < export.sql
```

3. Créez les tables dans PostgreSQL, puis importez :

```bash
DATABASE_URL="postgres://…production…" pnpm db:migrate
MYSQL_URL="mysql://root:temp@127.0.0.1:3307/ancien" DATABASE_URL="postgres://…production…" pnpm db:import-mysql
```

Le script affiche, table par table, les lignes lues, importées et ignorées. Il peut être relancé sans créer de doublons. Les membres se connectent ensuite avec leur mot de passe habituel.

## 5. Variables d’environnement

| Variable | Rôle |
|---|---|
| `APP_URL` | Origine HTTPS canonique (liens des e-mails, sitemap, SEO). |
| `APP_SECRET` | 32 caractères aléatoires minimum. |
| `DATABASE_URL` | URL PostgreSQL. Ajoutez `?sslmode=require` pour une base externe. |
| `STORAGE_DRIVER` | `s3` (R2) en production ; `local` pour Docker avec volume. |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Accès au bucket R2. |
| `SMTP_*`, `ADMIN_NOTIFICATION_EMAIL` | E-mails transactionnels et notifications internes. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Facultatif : « Continuer avec Google ». |

Les anciens identifiants MySQL et SMTP présents dans l’archive PHP sont à considérer comme compromis : créez-en de nouveaux.

## 6. Après la mise en ligne

1. **Administration → Santé du système** : base, migrations, SMTP, stockage et Google doivent être au vert.
2. Envoyez un e-mail de test depuis cette page.
3. Créez un compte de test, activez-le et inscrivez-vous à une formation.
4. Dans Google Cloud Console, ajoutez `APP_URL` aux origines JavaScript autorisées.
5. Soumettez `https://jp-services.org/sitemap.xml` dans Google Search Console.

Les anciennes adresses `.php` sont redirigées de façon permanente : le référencement est conservé.

## 7. Autre option : VPS avec Docker

`docker compose up -d --build` démarre PostgreSQL, applique les migrations et lance le site sur le port 3000. Les fichiers sont conservés dans un volume (`STORAGE_DRIVER=local`). Placez Caddy ou Nginx devant pour le HTTPS.

## 8. Sécurité intégrée

- Sessions stockées en base, cookie `HttpOnly`, `SameSite=Lax`, `Secure`, révoquées à la réinitialisation du mot de passe.
- Server Actions protégées par Next.js contre les requêtes d’une autre origine.
- Limitation des tentatives en base : connexion, inscription, activation, réinitialisation et formulaires publics.
- Validation stricte des entrées (Zod) et requêtes paramétrées (Drizzle).
- Téléversements contrôlés par signature binaire, taille limitée et noms aléatoires ; bucket privé.
- En-têtes HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Journal d’activité des actions d’administration.
