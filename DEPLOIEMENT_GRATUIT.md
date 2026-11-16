# JP-Services — déploiement gratuit sans carte (novembre 2026)

## Décision technique

Conserver le code **Next.js 16 / Drizzle PostgreSQL** existant.
- **Application** : Render Web Service Free, 512 Mo RAM, mise en veille après inactivité
- **Données durables** : Neon Free PostgreSQL, **1 Go par projet**, calcul et transferts limités
- **Fichiers** : Neon Object Storage compatible S3, **5 Go gratuits par projet** (sous conditions de quota)
- **E-mails** : Resend Free via HTTPS, **3 000/mois, 100/jour**, domaine expéditeur vérifié
- **Domaine** : DNS Cloudflare Free et HTTPS du domaine personnalisé Render
- **Cloudflare Workers** : chemin alternatif possible grâce à `pnpm cf:build`, mais
  nécessite une validation réelle SSR/sessions et une connexion PostgreSQL distante.
  La réussite d'un build Workers ne constitue pas une validation de production.

Aucune carte n'est nécessaire pour préparer ce dépôt. **L'ouverture des comptes
Neon et Resend et la vérification du domaine demandent une action du propriétaire.**
Les offres gratuites peuvent être suspendues en cas de dépassement de quota.

## Étapes de configuration (ne rien faire sur le domaine officiel avant validation)

### 1. Créer et protéger Neon Free
1. Ouvrir [Neon](https://console.neon.tech/) et créer un projet gratuit nommé
   `jp-services-official`, avec une région aussi proche que possible de Render Francfort.
2. Récupérer dans `Connect` l'URI **pooled** PostgreSQL avec TLS
   (`sslmode=require`). Il s'agit d'un **secret** : ne jamais le publier dans GitHub
   ou dans cette conversation.
3. Dans Render → service officiel → `Environment`, coller l'URI dans
   `DATABASE_URL` et générer `APP_SECRET` (32 caractères au minimum).
4. Faire exécuter `pnpm db:migrate` au démarrage. Ne jamais faire
   `pnpm db:reset` sur la production et ne pas recopier les données de la base
   de démonstration sans inventaire et sauvegarde.
5. Vérifier `/api/readiness` : `status=ok`, `database=ok`,
   `schema=ok`. Cela ne suffit pas à prouver l'envoi réel d'e-mails.

### 2. Activer un stockage permanent sans carte
1. Dans Neon, activer `Object Storage` si disponible sur le plan gratuit.
2. Créer un bucket **privé** pour `uploads`, isolé des projets de démonstration.
3. Renseigner **uniquement dans Render** les secrets
   `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`,
   `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
4. Conserver `STORAGE_DRIVER=s3`. Le code actuel dispose déjà du client S3,
   qui permet d'utiliser un stockage objet compatible.

### 3. E-mails transactionnels sans SMTP
1. Créer un compte Resend Free sur https://resend.com/ et faire vérifier
   l'autorisation d'envoi pour `jp-services.org` (souvent par TXT/DKIM Cloudflare).
2. Ne pas toucher aux enregistrements MX du courriel professionnel. Ajouter
   seulement les enregistrements d'authentification demandés en vérifiant
   les doublons SPF/DMARC.
3. Créer une clé API Resend et la placer dans `RESEND_API_KEY` sur Render.
   `SMTP_FROM_ADDRESS=contact@jp-services.org` doit être autorisée.
4. Le code privilégie automatiquement l'envoi HTTPS quand la clé API est présente;
   sinon il conserve le transport SMTP pour un autre hébergeur.
5. Tester une inscription réelle sur un compte de test et la réception du
   message de confirmation **avant** d'ouvrir la plateforme aux visiteurs.

### 4. Hébergement et DNS
1. Réutiliser si possible un service Render Free existant dédié à la validation,
   afin de ne pas multiplier les heures gratuites du workspace.
   Le fichier `render.free-official.yaml` est un **plan**, pas un déploiement.
2. Démarrer uniquement lorsque les secrets Neon/Resend/S3 sont renseignés.
   L'application refusera le démarrage si les prérequis critiques manquent.
3. Utiliser d'abord l'adresse `.onrender.com` pour les tests de bout en bout :
   inscription, connexion, vérification de courriel, formulaires, uploads,
   déconnexion, restauration de mot de passe.
4. Dans Render → `Settings → Custom Domains`, enregistrer
   `jp-services.org` et `www.jp-services.org`, puis utiliser les cibles DNS
   **effectivement fournies par Render**, pas des IP ou CNAME inventés.
5. Dans Cloudflare → `DNS → Records`, modifier les entrées Web `@`/`www`
   selon Render en gardant les MX/TXT et sous-domaines non concernés.
   D'abord `DNS only` pour valider Render HTTPS. Avec proxy Cloudflare,
   choisir le mode SSL/TLS **Full (strict)** après certification.
6. Vérifier HTTPS, `/api/readiness`, les redirections `www`, les formulaires et
   les performances sur mobile avant de déclarer la bascule terminée.

## Ce que l'offre gratuite ne garantit pas

- Render Free se met en veille et partage **750 heures d'instance/mois**
  entre les applications du workspace. Plusieurs services peuvent épuiser ce quota.
- Neon Free a des plafonds de calcul, stockage et réseau; la base peut devenir
  indisponible temporairement à l'atteinte de certains quotas.
- Resend Free impose des quotas et nécessite un domaine vérifié.
- La base Render Free actuelle `jp-services-claude-preview-db` expire le
  **15 décembre 2026**. Elle ne doit pas devenir la base définitive.
- Les téléchargements et médias nécessitent le stockage S3 permanent.
- Aucun de ces fichiers ne modifie automatiquement les DNS du domaine ni ne
  crée un compte chez Neon/Resend/Cloudflare.
