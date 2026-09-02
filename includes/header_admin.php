<?php
if (defined('HEADER_ADMIN_LOADED')) { return; }
define('HEADER_ADMIN_LOADED', true);
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
header('Cache-Control: no-store, private');
$currentScript = (string)($_SERVER['JP_TARGET_SCRIPT'] ?? ltrim(str_replace('\\','/',$_SERVER['SCRIPT_NAME'] ?? ''),'/'));
$page_title = $page_title ?? 'Administration';
$adminName = trim((string)($_SESSION['user_nom'] ?? $_SESSION['nom'] ?? 'Administrateur'));
$items = [
    ['/admin','fa-chart-line','Tableau de bord',['admin/index.php']],
    ['/admin/utilisateurs','fa-users','Utilisateurs',['admin/gestion_utilisateurs.php']],
    ['/admin/formations','fa-graduation-cap','Formations',['admin/gerer_formation.php','admin/publier_formation.php','admin/modifier_formation.php']],
    ['/admin/live','fa-video','Formations en ligne',['admin/gestion_live.php']],
    ['/admin/logiciels','fa-download','Logiciels',['admin/gestion_logiciels.php','admin/modifier_logiciel.php']],
    ['/admin/partenariats','fa-handshake','Partenariats',['admin/gestion_partenariats.php']],
    ['/admin/actualites','fa-newspaper','Actualités',['admin/gestion_actualites.php','admin/publier_actualite.php','admin/modifier_actualite.php']],
    ['/admin/projets','fa-diagram-project','Projets',['admin/admin_projets.php']],
    ['/admin/produits','fa-box-open','Produits',['admin/gestion_produits.php']],
    ['/admin/messages','fa-envelope','Messages',['admin/messages.php']],
    ['/admin/support','fa-life-ring','Support',['admin/support.php']],
];
$searchItems = array_merge($items, [
    ['/admin/abonnements','fa-bell','Abonnements et notifications',['admin/admin_abonnements.php']],
    ['/admin/horaires','fa-calendar-days','Horaires et plannings',['admin/gestion_horaire.php','admin/modifier_horaire.php']],
    ['/admin/contenus','fa-comments','Publications du forum',['admin/gerer_contenu.php','admin/ajouter_contenu.php']],
    ['/admin/membres','fa-address-card','Équipe JP-Services',['admin/membre.php']],
    ['/admin/parametres','fa-gear','Paramètres du site',['admin/parametres.php']],
    ['/admin/sante','fa-heart-pulse','Santé du système',['admin/sante.php']],
    ['/admin/smtp-test','fa-envelope-circle-check','Test SMTP',['admin/test_smtp.php']],
    ['/admin/aide','fa-circle-question','Aide administration',['admin/aide.php']],
]);
?>
<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#147ce1"><meta name="color-scheme" content="light dark"><title><?= e($page_title) ?> | Administration JP-Services</title><link rel="icon" href="<?= e(url('/images/logo2.png')) ?>"><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet"><script>(function(){try{var t=localStorage.getItem('jp-theme')||'system';var d=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.dataset.theme=d;document.documentElement.dataset.themeChoice=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=d==='dark'?'#091728':'#f4f8fc'}catch(e){}})();</script><link href="<?= e(url('/css/app.css?v=20260811')) ?>" rel="stylesheet"><link href="<?= e(url('/css/interface-v2.css?v=20260940')) ?>" rel="stylesheet"></head>
<body class="jp-app jp-admin"><a class="jp-skip-link" href="#admin-content">Aller au contenu</a>
<header class="jp-admin-header">
    <nav class="jp-admin-nav" aria-label="Navigation d’administration">
        <a class="jp-admin-brand" href="<?= e(url('/admin')) ?>">
            <img src="<?= e(url('/images/logo2.png')) ?>" alt="JP-Services">
            <span>JP-SERVICES <small>Admin</small></span>
        </a>

        <div class="jp-admin-links" id="jp-admin-links" data-admin-nav>
            <?php foreach($items as [$route,$icon,$label,$scripts]):
                $adminActive = in_array($currentScript,$scripts,true); ?>
                <a href="<?= e(url($route)) ?>" data-admin-item="<?= e(mb_strtolower($label)) ?>" class="<?= $adminActive ? 'active' : '' ?>"<?= $adminActive ? ' aria-current="page"' : '' ?>>
                    <i class="fas <?= e($icon) ?>"></i><span><?= e($label) ?></span>
                </a>
            <?php endforeach; ?>
        </div>

        <div class="jp-admin-actions">
            <button class="jp-admin-search jp-admin-search-btn" type="button" data-admin-search-toggle aria-label="Rechercher dans l’administration" title="Rechercher">
                <i class="fas fa-magnifying-glass"></i>
                <span class="jp-admin-search-kbd">Rechercher</span>
            </button>

            <div class="jp-theme-control jp-admin-theme-control" data-theme-control>
                <button class="jp-theme-button" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Changer le thème" title="Apparence">
                    <i class="fas fa-circle-half-stroke"></i>
                </button>
                <div class="jp-theme-menu" role="menu" aria-hidden="true">
                    <span class="jp-popup-heading">Apparence</span>
                    <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="light"><i class="fas fa-sun"></i><span>Clair<small>Mode lumineux</small></span></button>
                    <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="dark"><i class="fas fa-moon"></i><span>Sombre<small>Confort visuel</small></span></button>
                    <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="system"><i class="fas fa-desktop"></i><span>Système<small>Selon l’appareil</small></span></button>
                </div>
            </div>

            <div class="jp-admin-user">
                <span class="jp-admin-avatar" title="<?= e($adminName) ?>"><?= e(function_exists('mb_substr') ? mb_strtoupper(mb_substr($adminName, 0, 1, 'UTF-8'), 'UTF-8') : strtoupper(substr($adminName, 0, 1))) ?></span>
                <strong class="jp-admin-name"><?= e($adminName) ?></strong>
                <form action="<?= e(url('/deconnexion')) ?>" method="post">
                    <?= csrf_field() ?>
                    <button class="jp-icon-btn jp-danger jp-admin-logout" type="submit" title="Déconnexion" aria-label="Se déconnecter">
                        <i class="fas fa-power-off"></i>
                    </button>
                </form>
            </div>

            <button class="jp-admin-toggle" type="button" aria-label="Ouvrir le menu de navigation" aria-controls="jp-admin-links" aria-expanded="false">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </nav>
    <div class="jp-admin-searchbar" data-admin-searchbar hidden>
        <div class="jp-admin-search-box">
            <i class="fas fa-magnifying-glass"></i>
            <input type="search" placeholder="Rechercher une rubrique (formations, logiciels, projets, utilisateurs…)…" data-admin-search-input autocomplete="off">
            <button type="button" data-admin-search-close aria-label="Fermer la recherche"><i class="fas fa-times"></i></button>
        </div>
        <nav class="jp-admin-search-results" aria-label="Résultats de recherche">
            <?php foreach ($searchItems as [$route,$icon,$label]): ?>
                <a href="<?= e(url($route)) ?>" data-admin-search-item="<?= e(mb_strtolower($label)) ?>">
                    <i class="fas <?= e($icon) ?>"></i>
                    <span><?= e($label) ?></span>
                    <i class="fas fa-arrow-right"></i>
                </a>
            <?php endforeach; ?>
        </nav>
    </div>
</header>
<main class="admin-main" id="admin-content">
