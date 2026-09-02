<?php
if (!headers_sent()) {
    header('Content-Type: text/html; charset=utf-8');
}
require_once dirname(__DIR__) . '/app/bootstrap.php';

$host = strtolower(explode(':', (string)($_SERVER['HTTP_HOST'] ?? ''))[0]);
$isLocalHost = in_array($host, ['localhost', '127.0.0.1'], true);
if (!$isLocalHost && !headers_sent() && (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off')) {
    $configuredOrigin = rtrim(trim((string)env('APP_URL', '')), '/');
    if ($configuredOrigin !== '' && str_starts_with(strtolower($configuredOrigin), 'https://')) {
        header('Location: ' . $configuredOrigin . (string)($_SERVER['REQUEST_URI'] ?? '/'), true, 301);
        exit;
    }
}

$is_logged_in = !empty($_SESSION['user_id']);
$is_admin = $is_logged_in && ($_SESSION['role'] ?? '') === 'admin';
$currentScript = (string)($_SERVER['JP_TARGET_SCRIPT'] ?? ltrim(str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? 'index.php'), '/'));
$current_page = basename($currentScript);

$pageMeta = [
    'index.php' => ['Accueil', 'fa-house'],
    'formations.php' => ['Formations', 'fa-graduation-cap'],
    'formation_detail.php' => ['Formations', 'fa-graduation-cap'],
    'programme.php' => ['Mon programme', 'fa-calendar-check'],
    'traitement_programme.php' => ['Validation du programme', 'fa-clipboard-check'],
    'actualites.php' => ['Actualités', 'fa-newspaper'],
    'article.php' => ['Actualités', 'fa-newspaper'],
    'projets.php' => ['Projets', 'fa-rocket'],
    'mes_projets.php' => ['Mes projets', 'fa-diagram-project'],
    'details_projet.php' => ['Projet', 'fa-diagram-project'],
    'forum.php' => ['Forum', 'fa-comments'],
    'apropos.php' => ['À propos', 'fa-circle-info'],
    'contact.php' => ['Contact', 'fa-envelope'],
    'profil.php' => ['Mon profil', 'fa-user'],
    'modifier_profil.php' => ['Paramètres du compte', 'fa-user-gear'],
    'mes_abonnements.php' => ['Mes formations', 'fa-book-open'],
    'mes_notifications.php' => ['Notifications', 'fa-bell'],
    'commentaires.php' => ['Discussion', 'fa-comments'],
    'ajouter_post.php' => ['Nouvelle publication', 'fa-pen-to-square'],
    'modifier_post.php' => ['Modifier la publication', 'fa-pen'],
    'recherche.php' => ['Recherche', 'fa-magnifying-glass'],
    'aide.php' => ['Centre d’aide', 'fa-life-ring'],
    'logiciels.php' => ['Logiciels', 'fa-download'],
    'partenariat.php' => ['Partenariat', 'fa-handshake'],
    'formations-en-ligne.php' => ['Formations en ligne', 'fa-video'],
    'visio.php' => ['Salle de visioconférence', 'fa-video'],
    'cookies.php' => ['Politique de cookies', 'fa-cookie-bite'],
    'conditions.php' => ['Conditions d’utilisation', 'fa-file-contract'],
    'confidentialite.php' => ['Confidentialité', 'fa-user-shield'],
];
[$page_title, $page_icon] = $pageMeta[$current_page] ?? ['JP-Services', 'fa-chevron-right'];
$currentRequestUri = (string)($_SERVER['REQUEST_URI'] ?? url('/'));
$activeLocale = jp_locale();
$availableLocales = jp_supported_locales();

$userName = trim((string)($_SESSION['user_prenom'] ?? '') . ' ' . (string)($_SESSION['user_nom'] ?? ''));
if ($userName === '') {
    $userName = 'Mon compte';
}
$userInitial = function_exists('mb_substr') ? mb_strtoupper(mb_substr($userName, 0, 1, 'UTF-8'), 'UTF-8') : strtoupper(substr($userName, 0, 1));

$notification_data = null;
if ($is_logged_in && isset($conn) && $conn instanceof PDO) {
    try {
        $stmt_notif = $conn->prepare(
            'SELECT n.titre, n.message, n.formation_id
             FROM notifications n
             JOIN abonnements a ON n.formation_id = a.formation_id
             WHERE a.user_id = ? AND a.notifications_active = 1
             ORDER BY n.date_envoi DESC LIMIT 1'
        );
        $stmt_notif->execute([(int)$_SESSION['user_id']]);
        $notification_data = $stmt_notif->fetch(PDO::FETCH_ASSOC) ?: null;
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
    }
}
?>
<!doctype html>
<html lang="<?= e($activeLocale) ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f5f7fc">
    <meta name="color-scheme" content="light dark">
    <title><?= e($page_title) ?> | JP-Services</title>
    <link rel="icon" href="<?= e(url('/images/logo2.png')) ?>" type="image/png">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">
    <script>(function(){try{var t=localStorage.getItem('jp-theme')||'system';var d=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.dataset.theme=d;document.documentElement.dataset.themeChoice=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=d==='dark'?'#09111e':'#f5f7fc';if(localStorage.getItem('jp-announcement-dismissed')==='1')document.documentElement.classList.add('jp-announcement-was-dismissed')}catch(e){}})();</script>
    <link href="<?= e(url('/css/app.css?v=20260908')) ?>" rel="stylesheet">
    <link href="<?= e(url('/css/osil-inspired.css?v=20260807')) ?>" rel="stylesheet">
    <?php if ($current_page === 'index.php'): ?><link href="<?= e(url('/css/home.css?v=20260807')) ?>" rel="stylesheet"><?php endif; ?>
    <link href="<?= e(url('/css/learning-platform.css?v=20260811')) ?>" rel="stylesheet">
    <link href="<?= e(url('/css/classroom-refinement.css?v=20260812e')) ?>" rel="stylesheet">
    <link href="<?= e(url('/css/site-polish.css?v=20260908')) ?>" rel="stylesheet">
    <link href="<?= e(url('/css/pro-polish.css?v=20260908')) ?>" rel="stylesheet">
    <link href="<?= e(url('/css/interface-v2.css?v=20260950')) ?>" rel="stylesheet">
    <link rel="manifest" href="<?= e(url('/manifest.webmanifest')) ?>">
    <link rel="apple-touch-icon" href="<?= e(url('/images/pwa-192.png')) ?>">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="JP-Services">
</head>
<body class="jp-app <?= $notification_data ? 'has-notif' : '' ?>">
<a class="jp-skip-link" href="#main-content">Aller au contenu</a>

<div id="loader-wrapper" aria-hidden="true">
    <div class="jp-loader-mark"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span></span></div>
</div>

<?php if ($notification_data): ?>
<aside id="admin-notif-bar" class="admin-notif-banner" aria-label="Notification importante">
    <div class="admin-notif-copy"><span class="badge-notif">Info</span><span><strong><?= e($notification_data['titre']) ?></strong> — <?= e($notification_data['message']) ?></span></div>
    <div class="admin-notif-actions"><button type="button" class="btn-notif-action" data-open-notification>Afficher</button><button type="button" class="btn-close-notif" data-close-notification-bar aria-label="Fermer">&times;</button></div>
</aside>
<div id="notif-modal" class="jp-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="notif-title">
    <div class="jp-modal-card" tabindex="-1">
        <div class="jp-modal-heading"><span class="jp-modal-icon"><i class="fas fa-bell"></i></span><h2 id="notif-title"><?= e($notification_data['titre']) ?></h2></div>
        <div class="jp-modal-message"><?= nl2br(e($notification_data['message'])) ?></div>
        <div class="jp-modal-actions"><button type="button" class="jp-btn jp-btn-ghost" data-close-notification>Fermer</button><a class="jp-btn jp-btn-primary" href="<?= e(app_route('/formation', ['id' => (int)$notification_data['formation_id']])) ?>">Voir la formation <i class="fas fa-arrow-right"></i></a></div>
    </div>
</div>
<?php endif; ?>

<?php
$jpAnnouncementText = '';
$jpAnnouncementUrl = url('/formations');
$jpAnnouncementLabel = 'Découvrir les formations';
if (isset($conn) && $conn instanceof PDO) {
    try {
        $jpAnnouncementText = jp_setting($conn, 'annonce_texte', '');
        $configuredUrl = trim(jp_setting($conn, 'annonce_url', ''));
        if ($configuredUrl !== '' && preg_match('~^(?:https?://|/)~i', $configuredUrl)) {
            $jpAnnouncementUrl = str_starts_with($configuredUrl, '/') ? url($configuredUrl) : $configuredUrl;
        }
        $configuredLabel = trim(jp_setting($conn, 'annonce_lien_label', ''));
        if ($configuredLabel !== '') {
            $jpAnnouncementLabel = $configuredLabel;
        }
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
    }
}
if ($jpAnnouncementText === '' && !isset($conn)) {
    $jpAnnouncementText = 'De nouvelles sessions sont ouvertes. Formez-vous à votre rythme avec un accompagnement concret.';
}
?>
<?php if ($jpAnnouncementText !== ''): ?>
<aside class="jp-announcement" data-site-announcement aria-label="Information">
    <div class="jp-announcement-inner">
        <p><?= e($jpAnnouncementText) ?></p>
        <a href="<?= e($jpAnnouncementUrl) ?>"><?= e($jpAnnouncementLabel) ?> <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        <button type="button" data-dismiss-announcement aria-label="Fermer l’annonce"><i class="fas fa-xmark"></i></button>
    </div>
</aside>
<?php endif; ?>

<header class="oc-header jp-classroom-header jp-drfone-header" id="site-header">
    <div class="oc-header-inner jp-classroom-header-inner">
        <button id="btn-left" class="oc-btn-ctrl oc-menu-toggle" type="button" aria-label="Ouvrir le menu" aria-controls="panel-left" aria-expanded="false"><i class="fas fa-bars"></i></button>

        <a href="<?= e(url('/')) ?>" class="oc-logo jp-classroom-logo jp-drfone-brand" aria-label="JP-Services — Accueil">
            <span class="jp-drfone-parent">JP</span>
            <span class="jp-drfone-divider" aria-hidden="true"></span>
            <img src="<?= e(url('/images/logo2.png')) ?>" alt="">
            <span class="jp-drfone-product">Services</span>
        </a>

        <nav class="jp-classroom-nav" aria-label="Menu principal">
            <div class="jp-header-menu" data-header-menu>
                <button type="button" class="<?= in_array($current_page, ['formations.php', 'formation_detail.php', 'programme.php', 'mes_abonnements.php'], true) ? 'is-current' : '' ?>" data-header-menu-trigger aria-expanded="false" aria-controls="menu-formations">
                    <span class="jp-nav-tab-leading jp-nav-tab-leading--formations" aria-hidden="true"><i class="fas fa-graduation-cap"></i></span><span>Formations</span><i class="fas fa-chevron-down jp-nav-tab-chevron" aria-hidden="true"></i>
                </button>
                <div class="jp-mega-menu" id="menu-formations" data-header-menu-panel aria-hidden="true">
                    <div class="jp-mega-menu-inner">
                        <div class="jp-mega-intro">
                            <span>Nos formations</span>
                            <h2>Des compétences utiles, à votre rythme.</h2>
                            <p>Choisissez une formation structurée et progressez grâce à des objectifs directement applicables.</p>
                            <a href="<?= e(url('/formations')) ?>">Comparer les formations <i class="fas fa-arrow-right"></i></a>
                        </div>
                        <div class="jp-mega-group">
                            <span class="jp-mega-label">Apprendre une compétence</span>
                            <a class="jp-mega-link" href="<?= e(url('/formations')) ?>"><i class="fas fa-graduation-cap"></i><span><strong>Catalogue des formations</strong><small>Explorez les domaines, niveaux, tarifs et prochaines sessions.</small></span></a>
                            <a class="jp-mega-link" href="<?= e(url('/formations-en-ligne')) ?>"><i class="fas fa-video"></i><span><strong>Formations en ligne</strong><small>Rejoignez une session en visioconférence depuis votre ordinateur ou téléphone.</small></span></a>
                            <?php if ($is_logged_in): ?><a class="jp-mega-link" href="<?= e(url('/abonnements')) ?>"><i class="fas fa-book-open-reader"></i><span><strong>Mes formations</strong><small>Retrouvez vos inscriptions et vos notifications.</small></span></a><?php endif; ?>
                        </div>
                        <div class="jp-mega-group">
                            <span class="jp-mega-label">Organiser sa progression</span>
                            <a class="jp-mega-link" href="<?= e(url('/programme')) ?>"><i class="fas fa-calendar-check"></i><span><strong>Créer mon programme</strong><small>Planifiez vos modules et vos jours d’apprentissage.</small></span></a>
                            <a class="jp-mega-link" href="<?= e(url('/aide')) ?>"><i class="fas fa-circle-question"></i><span><strong>Être accompagné</strong><small>Consultez les réponses et contactez l’équipe JP‑Services.</small></span></a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="jp-header-menu" data-header-menu>
                <button type="button" class="<?= in_array($current_page, ['projets.php', 'mes_projets.php', 'forum.php', 'actualites.php', 'article.php'], true) ? 'is-current' : '' ?>" data-header-menu-trigger aria-expanded="false" aria-controls="menu-services">
                    <span class="jp-nav-tab-leading jp-nav-tab-leading--services" aria-hidden="true"><i class="fas fa-compass"></i></span><span>Services et communauté</span><i class="fas fa-chevron-down jp-nav-tab-chevron" aria-hidden="true"></i>
                </button>
                <div class="jp-mega-menu" id="menu-services" data-header-menu-panel aria-hidden="true">
                    <div class="jp-mega-menu-inner jp-mega-menu-services">
                        <div class="jp-mega-intro">
                            <span>Faire avancer un projet</span>
                            <h2>De l’idée à une solution claire.</h2>
                            <p>JP‑Services réunit accompagnement digital, informations pratiques et échanges communautaires.</p>
                            <a href="<?= e(url('/contact')) ?>">Parler de votre besoin <i class="fas fa-arrow-right"></i></a>
                        </div>
                        <div class="jp-mega-group">
                            <span class="jp-mega-label">Solutions</span>
                            <a class="jp-mega-link" href="<?= e(url('/projets')) ?>"><i class="fas fa-laptop-code"></i><span><strong>Projets digitaux</strong><small>Découvrez les réalisations et proposez une initiative.</small></span></a>
                            <a class="jp-mega-link" href="<?= e(url('/actualites')) ?>"><i class="fas fa-newspaper"></i><span><strong>Actualités</strong><small>Suivez les formations, projets et opportunités.</small></span></a>
                        </div>
                        <div class="jp-mega-group">
                            <span class="jp-mega-label">Communauté</span>
                            <a class="jp-mega-link" href="<?= e(url('/forum')) ?>"><i class="fas fa-comments"></i><span><strong>Forum d’entraide</strong><small>Posez vos questions et partagez votre expérience.</small></span></a>
                            <a class="jp-mega-link" href="<?= e(url('/a-propos')) ?>"><i class="fas fa-people-group"></i><span><strong>À propos de JP‑Services</strong><small>Notre mission, notre méthode et nos engagements.</small></span></a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="jp-header-menu" data-header-menu>
                <button type="button" class="<?= $current_page === 'logiciels.php' ? 'is-current' : '' ?>" data-header-menu-trigger aria-expanded="false" aria-controls="menu-logiciels" data-testid="nav-logiciels-link">
                    <span class="jp-nav-tab-leading jp-nav-tab-leading--logiciels" aria-hidden="true"><i class="fas fa-cubes"></i></span><span>Logiciels</span><i class="fas fa-chevron-down jp-nav-tab-chevron" aria-hidden="true"></i>
                </button>
                <div class="jp-mega-menu" id="menu-logiciels" data-header-menu-panel aria-hidden="true">
                    <div class="jp-mega-menu-inner jp-mega-menu-product">
                        <div class="jp-mega-intro">
                            <span>Médiathèque JP-Services</span>
                            <h2>Les outils utiles, prêts à l’emploi.</h2>
                            <p>Une sélection claire de logiciels et ressources pour apprendre, créer et avancer avec confiance.</p>
                            <a href="<?= e(url('/logiciels')) ?>">Voir tous les logiciels <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
                        </div>
                        <div class="jp-mega-group">
                            <span class="jp-mega-label">Découvrir les outils</span>
                            <a class="jp-mega-link" href="<?= e(url('/logiciels')) ?>"><i class="fas fa-download"></i><span><strong>Catalogue logiciels</strong><small>Filtrez les outils par catégorie, plateforme et popularité.</small></span></a>
                            <a class="jp-mega-link" href="<?= e(url('/logiciels')) ?>#catalogue-logiciels"><i class="fas fa-laptop"></i><span><strong>Outils par plateforme</strong><small>Retrouvez facilement les logiciels compatibles avec votre appareil.</small></span></a>
                        </div>
                        <div class="jp-mega-group">
                            <span class="jp-mega-label">Bien démarrer</span>
                            <a class="jp-mega-link" href="<?= e(url('/formations')) ?>"><i class="fas fa-graduation-cap"></i><span><strong>Apprendre avec les bons outils</strong><small>Choisissez une formation et les ressources qui l’accompagnent.</small></span></a>
                            <a class="jp-mega-link" href="<?= e(url('/aide')) ?>"><i class="fas fa-circle-question"></i><span><strong>Besoin d’aide ?</strong><small>Consultez les conseils d’installation et contactez l’équipe.</small></span></a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="jp-header-menu" data-header-menu>
                <button type="button" class="<?= $current_page === 'partenariat.php' ? 'is-current' : '' ?>" data-header-menu-trigger aria-expanded="false" aria-controls="menu-partenariat" data-testid="nav-partenariat-link">
                    <span class="jp-nav-tab-leading jp-nav-tab-leading--partenariat" aria-hidden="true"><i class="fas fa-handshake"></i></span><span>Partenariat</span><i class="fas fa-chevron-down jp-nav-tab-chevron" aria-hidden="true"></i>
                </button>
                <div class="jp-mega-menu" id="menu-partenariat" data-header-menu-panel aria-hidden="true">
                    <div class="jp-mega-menu-inner jp-mega-menu-product">
                        <div class="jp-mega-intro">
                            <span>Construire ensemble</span>
                            <h2>Des partenariats qui font avancer les projets.</h2>
                            <p>Associations, entreprises et institutions : créons des solutions utiles autour de la formation et du numérique.</p>
                            <a href="<?= e(url('/partenariat')) ?>">Découvrir le partenariat <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
                        </div>
                        <div class="jp-mega-group">
                            <span class="jp-mega-label">Collaborer</span>
                            <a class="jp-mega-link" href="<?= e(url('/partenariat')) ?>"><i class="fas fa-handshake"></i><span><strong>Devenir partenaire</strong><small>Découvrez les formats de collaboration possibles avec JP-Services.</small></span></a>
                            <a class="jp-mega-link" href="<?= e(url('/contact')) ?>"><i class="fas fa-paper-plane"></i><span><strong>Présenter un besoin</strong><small>Échangeons sur votre organisation, votre projet ou votre public.</small></span></a>
                        </div>
                        <div class="jp-mega-group">
                            <span class="jp-mega-label">Aller plus loin</span>
                            <a class="jp-mega-link" href="<?= e(url('/projets')) ?>"><i class="fas fa-diagram-project"></i><span><strong>Projets accompagnés</strong><small>Explorez les initiatives et réalisations portées par la communauté.</small></span></a>
                            <a class="jp-mega-link" href="<?= e(url('/actualites')) ?>"><i class="fas fa-newspaper"></i><span><strong>Actualités</strong><small>Suivez les nouveautés, opportunités et temps forts de la plateforme.</small></span></a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div class="oc-actions jp-classroom-actions">
            <button id="search-btn-desk" class="oc-search-btn jp-round-action jp-header-search-trigger" type="button" aria-label="Ouvrir la recherche globale" title="Recherche globale"><i class="fas fa-magnifying-glass" aria-hidden="true"></i><span>Rechercher</span></button>
            <a class="jp-round-action jp-help-action" href="<?= e(url('/aide')) ?>" aria-label="Obtenir de l’aide" title="Centre d’aide"><i class="far fa-circle-question"></i></a>
            <button class="jp-round-action jp-install-action" type="button" data-pwa-install hidden aria-label="Installer l’application JP-Services" title="Installer l’application" data-testid="pwa-install-btn"><i class="fas fa-arrow-down-to-bracket"></i></button>

            <div class="jp-language-control" data-language-control>
                <button class="jp-language-button jp-round-action" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="jp-language-menu" aria-label="Changer la langue">
                    <i class="fas fa-globe" aria-hidden="true"></i><span><?= e($availableLocales[$activeLocale]['short']) ?></span>
                </button>
                <div class="jp-language-menu" id="jp-language-menu" role="menu" aria-hidden="true">
                    <span class="jp-popup-heading">Langue du site</span>
                    <?php foreach ($availableLocales as $localeCode => $localeData): ?>
                    <form action="<?= e(url('/langue')) ?>" method="post">
                        <input type="hidden" name="locale" value="<?= e($localeCode) ?>">
                        <input type="hidden" name="return_to" value="<?= e($currentRequestUri) ?>">
                        <button type="submit" role="menuitemradio" aria-checked="<?= $activeLocale === $localeCode ? 'true' : 'false' ?>" class="<?= $activeLocale === $localeCode ? 'is-active' : '' ?>">
                            <span class="jp-language-code"><?= e($localeData['short']) ?></span><span><strong><?= e($localeData['label']) ?></strong><small><?= $localeCode === 'fr' ? 'Interface française' : 'English interface' ?></small></span><i class="fas fa-check" aria-hidden="true"></i>
                        </button>
                    </form>
                    <?php endforeach; ?>
                </div>
            </div>

            <div class="jp-theme-control jp-header-theme" data-theme-control>
                <button class="jp-theme-button jp-round-action" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Changer le thème"><i class="fas fa-circle-half-stroke"></i></button>
                <div class="jp-theme-menu" role="menu" aria-hidden="true">
                    <span class="jp-popup-heading">Apparence</span>
                    <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="light"><i class="fas fa-sun"></i><span>Clair<small>Fond lumineux</small></span></button>
                    <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="dark"><i class="fas fa-moon"></i><span>Sombre<small>Confort visuel</small></span></button>
                    <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="system"><i class="fas fa-desktop"></i><span>Système<small>Selon l’appareil</small></span></button>
                </div>
            </div>

            <div class="jp-account-control jp-drfone-account" data-account-control>
                <button class="jp-account-button" type="button" data-account-trigger aria-haspopup="menu" aria-expanded="false" aria-controls="jp-account-menu">
                    <span class="jp-account-avatar"><?= e($is_logged_in ? $userInitial : '') ?><?php if (!$is_logged_in): ?><i class="fas fa-user"></i><?php endif; ?></span>
                    <span class="jp-account-label"><?= e($is_logged_in ? $userName : 'Accéder') ?></span>
                    <i class="fas fa-chevron-down jp-account-chevron" aria-hidden="true"></i>
                </button>
                <div class="jp-account-menu" id="jp-account-menu" role="menu" aria-hidden="true">
                    <?php if ($is_logged_in): ?>
                        <div class="jp-account-summary"><span class="jp-account-avatar"><?= e($userInitial) ?></span><span><strong><?= e($userName) ?></strong><small><?= $is_admin ? 'Administrateur' : 'Membre JP‑Services' ?></small></span></div>
                        <span class="jp-popup-heading">Mon espace</span>
                        <a role="menuitem" href="<?= e(url('/profil')) ?>"><i class="far fa-id-card"></i><span>Voir mon profil</span></a>
                        <a role="menuitem" href="<?= e(url('/profil/modifier')) ?>"><i class="fas fa-sliders"></i><span>Paramètres du compte</span></a>
                        <a role="menuitem" href="<?= e(url('/abonnements')) ?>"><i class="fas fa-book-open"></i><span>Mes formations</span></a>
                        <a role="menuitem" href="<?= e(url('/mes-projets')) ?>"><i class="fas fa-diagram-project"></i><span>Mes projets</span></a>
                        <a role="menuitem" href="<?= e(url('/notifications')) ?>"><i class="far fa-bell"></i><span>Mes notifications</span></a>
                        <?php if ($is_admin): ?><div class="jp-account-separator"></div><a role="menuitem" href="<?= e(url('/admin')) ?>"><i class="fas fa-shield-halved"></i><span>Administration</span></a><?php endif; ?>
                        <div class="jp-account-separator"></div>
                        <form action="<?= e(url('/deconnexion')) ?>" method="post"><?= csrf_field() ?><button class="jp-account-danger" type="submit" role="menuitem"><i class="fas fa-arrow-right-from-bracket"></i><span>Se déconnecter</span></button></form>
                    <?php else: ?>
                        <a class="jp-account-primary" role="menuitem" href="<?= e(url('/inscription')) ?>"><i class="fas fa-user-plus"></i><span><strong>Créer mon compte</strong><small>Rejoindre la communauté</small></span></a>
                        <a role="menuitem" href="<?= e(url('/connexion')) ?>"><i class="fas fa-arrow-right-to-bracket"></i><span><strong>Se connecter</strong><small>Accéder à mon espace</small></span></a>
                        <div class="jp-account-separator"></div>
                        <span class="jp-popup-heading">Découvrir JP‑Services</span>
                        <a role="menuitem" href="<?= e(url('/formations')) ?>"><i class="fas fa-graduation-cap"></i><span>Explorer les formations</span></a>
                        <a role="menuitem" href="<?= e(url('/contact')) ?>"><i class="far fa-message"></i><span>Présenter un projet</span></a>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <button id="btn-right" class="oc-btn-ctrl oc-right-toggle" type="button" aria-label="Ouvrir l’espace personnel" aria-controls="panel-right" aria-expanded="false"><i class="fas fa-user"></i></button>
    </div>
    <div class="jp-header-backdrop" data-header-backdrop aria-hidden="true"></div>
</header>

<?php if ($current_page !== 'index.php'): ?>
<div class="jp-page-strip">
    <div class="jp-page-strip-inner">
        <div class="jp-page-title"><span><i class="fas <?= e($page_icon) ?>"></i></span><h1><?= e($page_title) ?></h1></div>
        <nav class="jp-breadcrumb" aria-label="Fil d’Ariane"><a href="<?= e(url('/')) ?>">Accueil</a><i class="fas fa-chevron-right"></i><span><?= e($page_title) ?></span></nav>
    </div>
</div>
<?php endif; ?>

<div id="oc-overlay" class="oc-overlay" aria-hidden="true"></div>
<aside id="panel-left" class="oc-panel oc-panel-left jp-mobile-drawer" aria-hidden="true" aria-label="Menu principal">
    <div class="panel-header"><a href="<?= e(url('/')) ?>" class="panel-brand"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""> JP‑SERVICES</a><button id="close-left" class="panel-close" type="button" aria-label="Fermer le menu"><i class="fas fa-times"></i></button></div>
    <div class="panel-body">
        <section class="jp-drawer-intro" aria-labelledby="drawer-intro-title">
            <span><i class="fas fa-sparkles" aria-hidden="true"></i> Plateforme numérique</span>
            <h2 id="drawer-intro-title">Un seul espace pour progresser.</h2>
            <p>Formations, outils et accompagnement pour faire avancer vos projets.</p>
            <a href="<?= e(url('/formations')) ?>">Explorer les formations <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </section>
        <span class="panel-kicker">Apprendre</span>
        <ul class="panel-nav-list">
            <li><a href="<?= e(url('/formations')) ?>" data-testid="panel-formations"><i class="fas fa-graduation-cap"></i><span>Formations<small>Catalogue complet, tous niveaux</small></span></a></li>
            <li><a href="<?= e(url('/formations-en-ligne')) ?>" data-testid="panel-formations-live"><i class="fas fa-video"></i><span>Sessions en direct<small>Visioconférence sans installation</small></span></a></li>
            <?php if ($is_logged_in): ?><li><a href="<?= e(url('/abonnements')) ?>" data-testid="panel-abonnements"><i class="fas fa-book-open"></i><span>Mes formations<small>Inscriptions et progression</small></span></a></li><?php endif; ?>
            <li><a href="<?= e(url('/programme')) ?>" data-testid="panel-programme"><i class="fas fa-calendar-check"></i><span>Créer mon programme<small>Planifiez vos modules</small></span></a></li>
        </ul>
        <span class="panel-kicker">Ressources</span>
        <ul class="panel-nav-list">
            <li><a href="<?= e(url('/logiciels')) ?>" data-testid="panel-logiciels"><i class="fas fa-download"></i><span>Logiciels<small>Outils à télécharger gratuitement</small></span></a></li>
            <li><a href="<?= e(url('/aide')) ?>" data-testid="panel-aide"><i class="far fa-circle-question"></i><span>Centre d’aide<small>FAQ et guides pratiques</small></span></a></li>
            <li><a href="<?= e(url('/partenariat')) ?>" data-testid="panel-partenariat"><i class="fas fa-handshake"></i><span>Partenariat<small>Collaborer avec JP‑Services</small></span></a></li>
        </ul>
        <span class="panel-kicker">Explorer</span>
        <ul class="panel-nav-list">
            <li><a href="<?= e(url('/projets')) ?>" data-testid="panel-projets"><i class="fas fa-laptop-code"></i><span>Projets digitaux<small>Réalisations et initiatives</small></span></a></li>
            <li><a href="<?= e(url('/actualites')) ?>" data-testid="panel-actualites"><i class="fas fa-newspaper"></i><span>Actualités<small>Nouveautés et opportunités</small></span></a></li>
            <li><a href="<?= e(url('/forum')) ?>" data-testid="panel-forum"><i class="fas fa-comments"></i><span>Forum d’entraide<small>Échanger avec la communauté</small></span></a></li>
            <li><a href="<?= e(url('/a-propos')) ?>" data-testid="panel-apropos"><i class="fas fa-circle-info"></i><span>À propos<small>Notre mission et notre équipe</small></span></a></li>
            <li><a href="<?= e(url('/contact')) ?>" data-testid="panel-contact"><i class="fas fa-envelope"></i><span>Contact<small>Nous écrire directement</small></span></a></li>
        </ul>
    </div>
    <div class="panel-footer">Lubumbashi · République démocratique du Congo</div>
</aside>

<aside id="panel-right" class="oc-panel oc-panel-right jp-mobile-drawer" aria-hidden="true" aria-label="Espace personnel">
    <div class="panel-header"><span class="panel-title">Espace personnel</span><button id="close-right" class="panel-close" type="button" aria-label="Fermer"><i class="fas fa-times"></i></button></div>
    <div class="panel-body">
        <?php if ($is_logged_in): ?><div class="jp-mobile-account-summary"><span class="jp-account-avatar"><?= e($userInitial) ?></span><span><strong><?= e($userName) ?></strong><small><?= $is_admin ? 'Administrateur' : 'Membre JP‑Services' ?></small></span></div><?php endif; ?>
        <?php if (!$is_logged_in): ?>
        <section class="jp-drawer-account-teaser" aria-labelledby="drawer-account-title">
            <span class="jp-drawer-teaser-icon"><i class="far fa-circle-user" aria-hidden="true"></i></span>
            <div><span>Votre espace</span><h2 id="drawer-account-title">Gardez le fil de vos progrès.</h2><p>Retrouvez vos formations, projets et ressources depuis un compte unique.</p></div>
        </section>
        <?php endif; ?>
        <span class="panel-kicker">Actions rapides</span>
        <ul class="panel-nav-list">
            <li><button id="search-btn-mob" type="button" data-testid="panel-search"><i class="fas fa-magnifying-glass"></i><span>Rechercher<small>Formations, projets, actualités</small></span></button></li>
            <li class="jp-mobile-theme-control" data-theme-control>
                <button class="jp-theme-button" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="mobile-theme-menu" data-testid="panel-theme"><i class="fas fa-circle-half-stroke" aria-hidden="true"></i><span>Changer le thème<small>Choisir l’apparence</small></span><i class="fas fa-chevron-down" aria-hidden="true"></i></button>
                <div class="jp-theme-menu jp-mobile-theme-menu" id="mobile-theme-menu" role="menu" aria-hidden="true">
                    <span class="jp-popup-heading">Apparence</span>
                    <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="light"><i class="fas fa-sun" aria-hidden="true"></i><span>Clair<small>Fond lumineux</small></span></button>
                    <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="dark"><i class="fas fa-moon" aria-hidden="true"></i><span>Sombre<small>Confort visuel</small></span></button>
                    <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="system"><i class="fas fa-desktop" aria-hidden="true"></i><span>Système<small>Selon l’appareil</small></span></button>
                </div>
            </li>
            <li><a href="<?= e(url('/aide')) ?>" data-testid="panel-help"><i class="far fa-circle-question"></i><span>Centre d’aide<small>Assistance et documentation</small></span></a></li>
        </ul>
        <?php if ($is_logged_in): ?>
        <span class="panel-kicker">Mon compte</span>
        <ul class="panel-nav-list">
            <li><a href="<?= e(url('/profil')) ?>" data-testid="panel-profil"><i class="far fa-id-card"></i><span>Mon profil<small>Photo et informations publiques</small></span></a></li>
            <li><a href="<?= e(url('/profil/modifier')) ?>" data-testid="panel-settings"><i class="fas fa-sliders"></i><span>Paramètres du compte<small>Sécurité et préférences</small></span></a></li>
            <li><a href="<?= e(url('/notifications')) ?>" data-testid="panel-notifications"><i class="far fa-bell"></i><span>Notifications<small>Alertes formations et projets</small></span></a></li>
            <?php if ($is_admin): ?><li><a href="<?= e(url('/admin')) ?>" data-testid="panel-admin"><i class="fas fa-shield-halved"></i><span>Administration<small>Panneau d’administration</small></span></a></li><?php endif; ?>
            <li><form action="<?= e(url('/deconnexion')) ?>" method="post"><?= csrf_field() ?><button class="panel-danger" type="submit" data-testid="panel-logout"><i class="fas fa-power-off"></i><span>Déconnexion<small>Fermer votre session</small></span></button></form></li>
        </ul>
        <?php else: ?>
        <span class="panel-kicker">Se connecter</span>
        <ul class="panel-nav-list">
            <li><a href="<?= e(url('/connexion')) ?>" data-testid="panel-login"><i class="fas fa-arrow-right-to-bracket"></i><span>Se connecter<small>Accéder à votre espace</small></span></a></li>
            <li><a class="panel-primary" href="<?= e(url('/inscription')) ?>" data-testid="panel-register"><i class="fas fa-user-plus"></i><span>Créer un compte<small>Rejoindre la communauté gratuitement</small></span></a></li>
        </ul>
        <?php endif; ?>
        <section class="jp-mobile-language" aria-labelledby="mobile-language-title">
            <span id="mobile-language-title" class="panel-kicker">Langue du site</span>
            <div>
                <?php foreach ($availableLocales as $localeCode => $localeData): ?>
                <form action="<?= e(url('/langue')) ?>" method="post">
                    <input type="hidden" name="locale" value="<?= e($localeCode) ?>">
                    <input type="hidden" name="return_to" value="<?= e($currentRequestUri) ?>">
                    <button type="submit" class="<?= $activeLocale === $localeCode ? 'is-active' : '' ?>" aria-pressed="<?= $activeLocale === $localeCode ? 'true' : 'false' ?>"><span><?= e($localeData['short']) ?></span><?= e($localeData['label']) ?><i class="fas fa-check" aria-hidden="true"></i></button>
                </form>
                <?php endforeach; ?>
            </div>
        </section>
    </div>
    <div class="panel-footer">Votre espace JP‑Services, simple et sécurisé.</div>
</aside>

<div id="search-modal" class="jp-modal jp-search-modal jp-classroom-search" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="search-title">
    <div class="jp-search-card" tabindex="-1">
        <div class="jp-search-modal-head">
            <div><span class="jp-search-modal-kicker"><i class="fas fa-sparkles" aria-hidden="true"></i> Recherche globale</span><div class="jp-search-label"><span id="search-title">Tout JP‑Services, au même endroit</span></div></div>
            <button id="close-search-btn" type="button" aria-label="Fermer"><i class="fas fa-times"></i></button>
        </div>
        <p class="jp-search-modal-intro">Retrouvez une formation, un logiciel, une actualité, un projet ou une discussion.</p>
        <form action="<?= e(url('/recherche')) ?>" method="get" class="jp-search-form">
            <i class="fas fa-magnifying-glass"></i>
            <input type="search" name="query" id="q-input" placeholder="Formation, projet, actualité ou mot-clé…" autocomplete="off" minlength="2" maxlength="120" required>
            <button type="submit"><span>Rechercher</span><i class="fas fa-arrow-right"></i></button>
        </form>
        <div class="jp-search-shortcuts" aria-label="Raccourcis de recherche">
            <span>Explorer par thème</span>
            <div><a href="<?= e(url('/formations')) ?>"><i class="fas fa-graduation-cap"></i> Formations</a><a href="<?= e(url('/projets')) ?>"><i class="fas fa-laptop-code"></i> Projets</a><a href="<?= e(url('/actualites')) ?>"><i class="fas fa-newspaper"></i> Actualités</a><a href="<?= e(url('/forum')) ?>"><i class="fas fa-comments"></i> Forum</a></div>
        </div>
        <div class="jp-search-hints"><span>Les résultats rassemblent l’ensemble des contenus du site.</span><span><kbd>Échap</kbd> pour fermer</span></div>
    </div>
</div>
<aside id="jp-cookie-banner" class="jp-cookie-banner" data-cookie-banner hidden role="dialog" aria-live="polite" aria-label="Consentement aux cookies" data-testid="cookie-banner">
    <div class="jp-cookie-copy">
        <span class="jp-cookie-icon"><i class="fas fa-cookie-bite"></i></span>
        <div>
            <strong>Nous respectons votre vie privée.</strong>
            <p>Nous utilisons des cookies essentiels au fonctionnement du site et, avec votre accord, une mesure d’audience anonyme pour améliorer nos contenus.</p>
            <a href="<?= e(url('/cookies')) ?>">En savoir plus sur les cookies</a>
        </div>
    </div>
    <div class="jp-cookie-actions">
        <button type="button" class="jp-btn jp-btn-ghost" data-cookie-customize data-testid="cookie-customize-btn">Personnaliser</button>
        <button type="button" class="jp-btn jp-btn-secondary" data-cookie-refuse data-testid="cookie-refuse-btn">Tout refuser</button>
        <button type="button" class="jp-btn jp-btn-primary" data-cookie-accept data-testid="cookie-accept-btn">Tout accepter</button>
    </div>
</aside>

<div id="jp-cookie-modal" class="jp-modal" data-cookie-modal aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title" data-testid="cookie-modal">
    <div class="jp-modal-card" tabindex="-1">
        <div class="jp-modal-heading"><span class="jp-modal-icon"><i class="fas fa-cookie-bite"></i></span><h2 id="cookie-modal-title">Préférences de cookies</h2></div>
        <div class="jp-modal-message">
            <div class="jp-cookie-choice">
                <div><strong>Cookies essentiels</strong><small>Connexion, sécurité, langue et thème. Indispensables au fonctionnement du site.</small></div>
                <label class="jp-cookie-switch"><input type="checkbox" checked disabled><span></span></label>
            </div>
            <div class="jp-cookie-choice">
                <div><strong>Mesure d’audience</strong><small>Statistiques anonymes de fréquentation pour améliorer les contenus. Aucune publicité.</small></div>
                <label class="jp-cookie-switch"><input type="checkbox" data-cookie-analytics><span></span></label>
            </div>
        </div>
        <div class="jp-modal-actions">
            <button type="button" class="jp-btn jp-btn-ghost" data-cookie-close>Fermer</button>
            <button type="button" class="jp-btn jp-btn-secondary" data-cookie-save data-testid="cookie-save-btn">Enregistrer mes choix</button>
        </div>
    </div>
</div>

<div class="jp-modal" data-pwa-ios-modal aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="pwa-ios-title" data-testid="pwa-ios-modal">
    <div class="jp-modal-card" tabindex="-1">
        <div class="jp-modal-heading"><span class="jp-modal-icon"><i class="fas fa-arrow-down-to-bracket"></i></span><h2 id="pwa-ios-title">Installer l’application</h2></div>
        <div class="jp-modal-message">
            <ol class="jp-pwa-ios-steps">
                <li>Ouvrez le menu de partage <i class="fas fa-arrow-up-from-bracket"></i> de Safari.</li>
                <li>Choisissez « Sur l’écran d’accueil » <i class="far fa-square-plus"></i>.</li>
                <li>Confirmez avec « Ajouter » : JP-Services s’ouvrira comme une application.</li>
            </ol>
        </div>
        <div class="jp-modal-actions"><button type="button" class="jp-btn jp-btn-primary" data-pwa-ios-close>Compris</button></div>
    </div>
</div>

<script src="<?= e(url('/js/site-ui.js?v=20260918')) ?>" defer></script>
<script src="<?= e(url('/js/site-extra.js?v=20260825')) ?>" defer></script>
<script src="<?= e(url('/js/cookies.js?v=20260813')) ?>" defer></script>
<script src="<?= e(url('/js/pwa.js?v=20260908')) ?>" defer></script>
