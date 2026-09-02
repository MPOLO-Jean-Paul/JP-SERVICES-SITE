# Mise à jour JP-SERVICES — 23 août 2026

## Nouveautés livrées

### 1. Onglet Logiciels (`/logiciels`)
- Catalogue public alimenté à 100 % par la base de données.
- Recherche instantanée, filtre par catégorie, filtre par plateforme, tri (plus récents, nom, plus téléchargés).
- Fiches complètes : description, version, taille, plateforme, licence, compteur de téléchargements, date de mise à jour.
- Téléchargement sécurisé via `/telecharger` (fichier hébergé streamé par PHP ou lien externe), avec compteur automatique.
- Les logiciels apparaissent aussi dans la recherche globale du site.

### 2. Onglet Partenariat (`/partenariat`)
- Présentation des formes de collaboration, processus en 3 étapes, vitrine des partenaires (logos, liens).
- Formulaire de demande de partenariat (anti-spam honeypot + limitation de débit), stocké en base.
- Texte d'introduction éditable depuis l'admin.

### 3. Formations en ligne (`/formations-en-ligne` + `/visio`)
- Sessions de visioconférence intégrées au site via Jitsi Meet (gratuit, sans clé API, sans installation).
- Salles générées automatiquement côté admin, accès « membres » ou « public ».
- Page de salle avec pré-réglages (nom d'affichage pré-rempli, micro coupé à l'entrée), conseils hôte/participant.
- Partage du lien : bouton copier, WhatsApp et Telegram.
- L'admin pilote le cycle : planifiée → en direct → terminée / annulée, et entre en premier pour être modérateur.

### 4. Gestion des cookies
- Bandeau de consentement (accepter / refuser / personnaliser), mémorisé 6 mois.
- Modale de préférences (cookies essentiels + mesure d'audience facultative).
- Page `/cookies` : politique détaillée + accès « Gérer les cookies » dans le pied de page.

### 5. Application installable (PWA)
- `manifest.webmanifest`, service worker (`sw.js`), page hors connexion (`offline.html`), icônes générées (192/512/maskable).
- Bouton « Installer l'application » dans le header et le pied de page (Chrome/Edge/Android) ; instructions guidées sur iOS.

### 6. Harmonisation visuelle
- Nouvelle couche `css/site-polish.css` chargée en dernier : titres plafonnés et fluides (`clamp()`), texte adaptatif à chaque support, éléments décoratifs réduits, ajustements mobile.
- Bandeau d'annonce du site désormais géré depuis la base (admin → Paramètres).

### 7. Administration enrichie
- Nouvelles rubriques : Logiciels, Partenariats, Formations en ligne, Paramètres du site (visibles dans le menu admin et le tableau de bord).
- Gestion des catégories de logiciels, publication/brouillon, modification, suppression sécurisée des fichiers.
- Suivi des demandes de partenariat : statuts (nouvelle, en discussion, acceptée, refusée) + note interne.

## Mise en production (InfinityFree)

**Cas 1 — base de production déjà existante :** exécutez **`MIGRATION_v2.sql`** une seule fois dans phpMyAdmin (ajoute les tables `logiciels`, `logiciel_categories`, `partenaires`, `partenariat_demandes`, `live_sessions`, `site_settings` sans toucher aux données existantes).

**Cas 2 — installation neuve (base vide) :** importez **`JP_SERVICES_BASE_COMPLETE_V2.sql`** qui contient le schéma de production complet (2026-08-12) + l'extension du 2026-08-23 en un seul fichier.

1. Envoyer les fichiers du site par FTP (remplacer les existants).
2. Exécuter le script SQL correspondant à votre cas ci-dessus.
3. Vérifier que `uploads/logiciels/` est accessible en écriture (CHMOD 755).
4. L'application installable et la visioconférence nécessitent HTTPS (SSL gratuit à activer dans le panneau InfinityFree).
5. Taille maximale de téléversement : celle du plan d'hébergement (50 Mo côté application).

La compatibilité avec le schéma de production complet (18 tables) a été vérifiée : les 6 nouvelles tables s'importent sans conflit et l'ensemble du site (public + admin) a été re-testé contre ce schéma réel.

## Sécurité maintenue
- CSP étendue uniquement pour `meet.jit.si` (script, frame, websocket) ; `Permissions-Policy` autorise caméra/micro pour la visio uniquement.
- Téléchargements servis par contrôleur PHP : le dossier `uploads/logiciels/` refuse l'accès direct.
- Toutes les écritures passent par des requêtes préparées + jetons CSRF existants.
