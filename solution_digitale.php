<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';

$activeLocale = jp_locale();
$availableLocales = jp_supported_locales();
$currentRequestUri = (string)($_SERVER['REQUEST_URI'] ?? url('/ad/solution-digitale-tout-en-un.html'));
?>
<!doctype html>
<html lang="<?= e($activeLocale) ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f5f7fc">
    <meta name="color-scheme" content="light dark">
    <meta name="description" content="JP-Services réunit formations, outils, accompagnement et communauté dans un même espace numérique.">
    <link rel="canonical" href="<?= e(absolute_url('/ad/solution-digitale-tout-en-un.html')) ?>">
    <title>Solution digitale tout-en-un | JP-Services</title>
    <link rel="icon" href="<?= e(url('/images/logo2.png')) ?>" type="image/png">
    <link rel="manifest" href="<?= e(url('/manifest.webmanifest')) ?>">
    <script>(function(){try{var t=localStorage.getItem('jp-theme')||'system';var d=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.dataset.theme=d;document.documentElement.dataset.themeChoice=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=d==='dark'?'#09111e':'#f5f7fc'}catch(e){}})();</script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">
    <link href="<?= e(url('/css/app.css?v=20260908')) ?>" rel="stylesheet">
    <link href="<?= e(url('/css/solution-digitale.css?v=20260908')) ?>" rel="stylesheet">
    <link href="<?= e(url('/css/interface-v2.css?v=20260938')) ?>" rel="stylesheet">
</head>
<body class="jpo-page">
<a class="jpo-skip" href="#contenu">Aller au contenu</a>

<header class="jpo-nav jpo-drfone-nav">
    <a class="jpo-brand jpo-drfone-brand" href="<?= e(url('/')) ?>" aria-label="JP-Services, accueil">
        <span class="jpo-drfone-parent">JP</span><span class="jpo-drfone-divider" aria-hidden="true"></span><span class="jpo-brand-mark"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""></span><strong>Services</strong>
    </a>
    <div class="jpo-nav-tools">
        <div class="jp-language-control" data-language-control>
            <button class="jp-language-button jp-round-action" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="jpo-language-menu" aria-label="Changer la langue"><i class="fas fa-globe" aria-hidden="true"></i><span><?= e($availableLocales[$activeLocale]['short']) ?></span></button>
            <div class="jp-language-menu" id="jpo-language-menu" role="menu" aria-hidden="true">
                <span class="jp-popup-heading">Langue du site</span>
                <?php foreach ($availableLocales as $localeCode => $localeData): ?>
                <form action="<?= e(url('/langue')) ?>" method="post">
                    <input type="hidden" name="locale" value="<?= e($localeCode) ?>">
                    <input type="hidden" name="return_to" value="<?= e($currentRequestUri) ?>">
                    <button type="submit" role="menuitemradio" aria-checked="<?= $activeLocale === $localeCode ? 'true' : 'false' ?>" class="<?= $activeLocale === $localeCode ? 'is-active' : '' ?>"><span class="jp-language-code"><?= e($localeData['short']) ?></span><span><strong><?= e($localeData['label']) ?></strong><small><?= $localeCode === 'fr' ? 'Interface française' : 'English interface' ?></small></span><i class="fas fa-check" aria-hidden="true"></i></button>
                </form>
                <?php endforeach; ?>
            </div>
        </div>
        <div class="jp-theme-control" data-theme-control>
            <button class="jp-theme-button jp-round-action" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Changer le thème"><i class="fas fa-circle-half-stroke" aria-hidden="true"></i></button>
            <div class="jp-theme-menu" role="menu" aria-hidden="true">
                <span class="jp-popup-heading">Apparence</span>
                <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="light"><i class="fas fa-sun"></i><span>Clair<small>Fond lumineux</small></span></button>
                <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="dark"><i class="fas fa-moon"></i><span>Sombre<small>Confort visuel</small></span></button>
                <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="system"><i class="fas fa-desktop"></i><span>Système<small>Selon l’appareil</small></span></button>
            </div>
        </div>
    </div>
    <a class="jpo-nav-cta" href="<?= e(url('/logiciels')) ?>"><i class="fas fa-download"></i> Découvrir les outils</a>
</header>

<main id="contenu">
    <section class="jpo-hero" aria-labelledby="jpo-hero-title">
        <div class="jpo-orb jpo-orb-one" aria-hidden="true"></div>
        <div class="jpo-orb jpo-orb-two" aria-hidden="true"></div>
        <div class="jpo-shell jpo-hero-copy">
            <span class="jpo-eyebrow"><i class="fas fa-sparkles"></i> Apprendre, créer, progresser</span>
            <h1 id="jpo-hero-title">Votre élan numérique,<br><span>dans un même espace.</span></h1>
            <p>Construisez des compétences utiles, accédez à des ressources sélectionnées et avancez avec une communauté qui partage vos ambitions.</p>
            <div class="jpo-hero-actions">
                <a class="jpo-btn jpo-btn-primary" href="<?= e(url('/formations')) ?>">Explorer les formations <i class="fas fa-arrow-right"></i></a>
                <a class="jpo-btn jpo-btn-secondary" href="#solutions"><i class="fas fa-layer-group"></i> Voir la solution</a>
            </div>
            <ul class="jpo-reassurance" aria-label="Les atouts de JP-Services">
                <li><i class="fas fa-circle-check"></i> À votre rythme</li>
                <li><i class="fas fa-circle-check"></i> Ressources vérifiées</li>
                <li><i class="fas fa-circle-check"></i> Accompagnement humain</li>
            </ul>
        </div>

        <div class="jpo-shell jpo-showcase" aria-label="Aperçu de la plateforme JP-Services">
            <div class="jpo-showcase-glow" aria-hidden="true"></div>
            <div class="jpo-browser-window">
                <div class="jpo-window-bar" aria-hidden="true"><span></span><span></span><span></span><b>jp-services · mon espace</b></div>
                <img src="<?= e(url('/images/hero-dashboard.jpg')) ?>" alt="Tableau de bord de la plateforme JP-Services">
            </div>
            <div class="jpo-floating-card jpo-float-learning" aria-hidden="true">
                <span class="jpo-float-icon is-blue"><i class="fas fa-graduation-cap"></i></span>
                <span><strong>Parcours guidés</strong><small>Une progression claire</small></span>
            </div>
            <div class="jpo-floating-card jpo-float-live" aria-hidden="true">
                <span class="jpo-float-icon is-coral"><i class="fas fa-video"></i></span>
                <span><strong>Sessions en direct</strong><small>Échanger et pratiquer</small></span>
            </div>
            <div class="jpo-mobile-card" aria-hidden="true">
                <div class="jpo-phone-top"><span></span><i class="fas fa-bell"></i></div>
                <div class="jpo-phone-profile"><b>Bonjour !</b><small>Votre programme avance.</small></div>
                <div class="jpo-phone-progress"><span><i class="fas fa-play"></i></span><b>Prochaine étape</b><small>Découvrir le module 3</small></div>
                <div class="jpo-phone-tabs"><i class="fas fa-house"></i><i class="fas fa-book-open"></i><i class="fas fa-user"></i></div>
            </div>
        </div>
    </section>

    <section class="jpo-trust" aria-label="Les univers JP-Services">
        <div class="jpo-shell">
            <p>Une plateforme conçue pour faire le lien entre</p>
            <div class="jpo-trust-list">
                <span><i class="fas fa-graduation-cap"></i> Formations</span>
                <span><i class="fas fa-download"></i> Logiciels</span>
                <span><i class="fas fa-rocket"></i> Projets</span>
                <span><i class="fas fa-people-group"></i> Communauté</span>
            </div>
        </div>
    </section>

    <section class="jpo-solutions" id="solutions" aria-labelledby="solutions-title">
        <div class="jpo-shell">
            <div class="jpo-section-heading">
                <span class="jpo-section-kicker">Tout à portée de main</span>
                <h2 id="solutions-title">Un environnement simple pour passer de l’idée à l’action.</h2>
                <p>Chaque espace est pensé pour vous aider à choisir, apprendre, essayer et partager sans multiplier les outils.</p>
            </div>
            <div class="jpo-solution-grid">
                <a class="jpo-solution-card is-violet" href="<?= e(url('/formations')) ?>"><span class="jpo-solution-topline"><span>Apprendre</span><em>01</em></span><span class="jpo-card-icon"><i class="fas fa-graduation-cap"></i></span><h3>Formations</h3><p>Des parcours structurés, concrets et accessibles.</p><b>Commencer <i class="fas fa-arrow-right"></i></b></a>
                <a class="jpo-solution-card is-cyan" href="<?= e(url('/visio')) ?>"><span class="jpo-solution-topline"><span>Participer</span><em>02</em></span><span class="jpo-card-icon"><i class="fas fa-video"></i></span><h3>En direct</h3><p>Des rendez-vous pour poser vos questions et pratiquer.</p><b>Participer <i class="fas fa-arrow-right"></i></b></a>
                <a class="jpo-solution-card is-coral" href="<?= e(url('/logiciels')) ?>"><span class="jpo-solution-topline"><span>Télécharger</span><em>03</em></span><span class="jpo-card-icon"><i class="fas fa-download"></i></span><h3>Ressources</h3><p>Des outils numériques utiles, classés et vérifiés.</p><b>Découvrir <i class="fas fa-arrow-right"></i></b></a>
                <a class="jpo-solution-card is-amber" href="<?= e(url('/programme')) ?>"><span class="jpo-solution-topline"><span>Organiser</span><em>04</em></span><span class="jpo-card-icon"><i class="fas fa-calendar-check"></i></span><h3>Mon programme</h3><p>Un repère personnel pour organiser votre progression.</p><b>Organiser <i class="fas fa-arrow-right"></i></b></a>
                <a class="jpo-solution-card is-blue" href="<?= e(url('/projets')) ?>"><span class="jpo-solution-topline"><span>Construire</span><em>05</em></span><span class="jpo-card-icon"><i class="fas fa-rocket"></i></span><h3>Projets</h3><p>Transformez ce que vous apprenez en réalisations.</p><b>Construire <i class="fas fa-arrow-right"></i></b></a>
                <a class="jpo-solution-card is-mint" href="<?= e(url('/forum')) ?>"><span class="jpo-solution-topline"><span>Échanger</span><em>06</em></span><span class="jpo-card-icon"><i class="fas fa-comments"></i></span><h3>Communauté</h3><p>Échangez avec des personnes qui avancent avec vous.</p><b>Échanger <i class="fas fa-arrow-right"></i></b></a>
            </div>
        </div>
    </section>

    <section class="jpo-feature">
        <div class="jpo-shell jpo-feature-grid">
            <div class="jpo-feature-media">
                <img src="<?= e(url('/images/home-learn.jpg')) ?>" alt="Apprenant travaillant avec une formation JP-Services">
                <div class="jpo-feature-note"><i class="fas fa-circle-check"></i><span><b>Des repères utiles</b><small>Progressez étape par étape</small></span></div>
            </div>
            <div class="jpo-feature-copy">
                <span class="jpo-section-kicker">Pensé pour durer</span>
                <h2>Moins de dispersion. Plus de progression.</h2>
                <p>JP-Services rassemble les éléments essentiels de votre parcours dans une interface accueillante : contenus, outils, rendez-vous et échanges.</p>
                <ul>
                    <li><i class="fas fa-check"></i><span><b>Un point de départ clair</b><small>Choisissez votre voie selon votre besoin du moment.</small></span></li>
                    <li><i class="fas fa-check"></i><span><b>Des actions concrètes</b><small>Apprenez, téléchargez, participez ou lancez un projet.</small></span></li>
                    <li><i class="fas fa-check"></i><span><b>Une aide à proximité</b><small>La communauté et les échanges restent accessibles.</small></span></li>
                </ul>
                <a class="jpo-text-link" href="<?= e(url('/a-propos')) ?>">Découvrir JP-Services <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    </section>

    <section class="jpo-cta" aria-labelledby="cta-title">
        <div class="jpo-shell jpo-cta-inner">
            <div><span class="jpo-section-kicker">Votre espace vous attend</span><h2 id="cta-title">Prêt à faire avancer votre prochain projet ?</h2><p>Créez votre espace gratuit et retrouvez toutes les possibilités de JP-Services au même endroit.</p></div>
            <a class="jpo-btn jpo-btn-light" href="<?= e(url('/inscription')) ?>">Créer mon espace <i class="fas fa-arrow-right"></i></a>
        </div>
    </section>
</main>

<footer class="jpo-footer jpo-drfone-footer">
    <div class="jpo-shell">
        <nav class="jpo-footer-legal" aria-label="Informations légales">
            <a href="<?= e(url('/conditions')) ?>">Conditions d’utilisation</a>
            <a href="<?= e(url('/confidentialite')) ?>">Confidentialité</a>
            <a href="<?= e(url('/cookies')) ?>">Politique de cookies</a>
            <button type="button" data-cookies-open>Gérer les cookies</button>
            <a href="<?= e(url('/aide')) ?>">Aide</a>
            <a href="<?= e(url('/contact')) ?>">Contact</a>
        </nav>
        <nav class="jpo-footer-socials" aria-label="Réseaux sociaux JP-Services">
            <a href="https://www.facebook.com/groups/1236192878705291/permalink/1259571929700719/?app=fbl" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>
            <a href="https://www.linkedin.com/in/jp-services-b51940381?trk=contact-info" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin-in" aria-hidden="true"></i></a>
            <a href="https://www.youtube.com/@jp-services-v8d" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fab fa-youtube" aria-hidden="true"></i></a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i class="fab fa-tiktok" aria-hidden="true"></i></a>
        </nav>
        <p>© <?= date('Y') ?> JP-Services. Tous droits réservés. Les contenus, services et parcours proposés sont conçus pour accompagner votre progression numérique.</p>
    </div>
</footer>

<script src="<?= e(url('/js/site-ui.js?v=20260908')) ?>" defer></script>
<script src="<?= e(url('/js/pwa.js?v=20260908')) ?>" defer></script>
</body>
</html>
