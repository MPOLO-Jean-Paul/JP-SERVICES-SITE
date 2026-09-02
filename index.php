<?php
require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/formation_helpers.php';
require_once __DIR__ . '/includes/connexion_db.php';

try {
    $mediaColumn = jp_actualite_media_column($conn);
    $stmt_recent = $conn->prepare("SELECT id, titre, contenu, {$mediaColumn} AS media, date_publication FROM actualites ORDER BY date_publication DESC LIMIT 4");
    $stmt_recent->execute();
    $articles = $stmt_recent->fetchAll(PDO::FETCH_ASSOC);

    $stmt_formations = $conn->prepare('SELECT id, titre, date_debut, prix, image FROM formations WHERE date_debut >= CURDATE() ORDER BY date_debut ASC LIMIT 3');
    $stmt_formations->execute();
    $formations = $stmt_formations->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    $articles = [];
    $formations = [];
    error_log($exception->getMessage());
}

$homeStats = ['formations' => 0, 'logiciels' => 0, 'telechargements' => 0, 'membres' => 0, 'sessions' => 0];
try {
    $homeStats['formations'] = (int)$conn->query('SELECT COUNT(*) FROM formations')->fetchColumn();
    $homeStats['membres'] = (int)$conn->query('SELECT COUNT(*) FROM users WHERE is_active = 1')->fetchColumn();
    $homeStats['logiciels'] = (int)$conn->query("SELECT COUNT(*) FROM logiciels WHERE statut = 'publie'")->fetchColumn();
    $homeStats['telechargements'] = (int)$conn->query("SELECT COALESCE(SUM(telechargements), 0) FROM logiciels WHERE statut = 'publie'")->fetchColumn();
    $homeStats['sessions'] = (int)$conn->query("SELECT COUNT(*) FROM live_sessions WHERE statut IN ('planifiee', 'en_cours')")->fetchColumn();
} catch (Throwable $exception) {
    error_log('Statistiques accueil: ' . $exception->getMessage());
}

function jp_excerpt($content, $length = 145)
{
    $text = trim((string)preg_replace('/\s+/u', ' ', strip_tags((string)$content)));
    if (function_exists('mb_strlen') && mb_strlen($text, 'UTF-8') > $length) {
        return rtrim(mb_substr($text, 0, $length, 'UTF-8')) . '…';
    }
    return strlen($text) > $length ? rtrim(substr($text, 0, $length)) . '…' : $text;
}

function jp_media_is_image($path)
{
    $extension = strtolower(pathinfo(parse_url((string)$path, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));
    return in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'], true);
}

function jp_home_media_url($path)
{
    $path = trim((string)$path);
    if (preg_match('~^https?://~i', $path)) {
        return $path;
    }
    return url('/' . ltrim(str_replace('\\', '/', $path), '/'));
}

function jp_home_date_label($value)
{
    $timestamp = strtotime((string)$value);
    if ($timestamp === false) {
        return 'JP‑Services';
    }
    $months = jp_is_english()
        ? [1 => 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        : [1 => 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return (int)date('j', $timestamp) . ' ' . $months[(int)date('n', $timestamp)] . ' ' . date('Y', $timestamp);
}

include __DIR__ . '/includes/header.php';
?>

<main class="jp-home jp-classroom-home jp-df-home" id="main-content">
    <section class="jp-df-hero">
        <div class="home-shell jp-df-hero-inner">
            <span class="jp-df-pill reveal" data-testid="home-hero-badge"><i class="fas fa-bolt"></i> JP‑Services · Formations et services digitaux</span>
            <h1 class="reveal jp-df-hero-title" data-testid="home-hero-title">Tout apprendre. <span class="jp-typewriter-wrap" aria-hidden="true"><em data-jp-typewriter="Construire utile.|Créer en confiance.|Passer à l’action.">Construire utile.</em></span><span class="visually-hidden"> Développez vos compétences et vos projets.</span> Une seule plateforme.</h1>
            <p class="reveal">Formations pratiques, logiciels vérifiés, sessions en visioconférence et communauté : JP‑Services prend en main votre parcours numérique, du premier clic au projet abouti.</p>
            <div class="jp-df-hero-actions reveal">
                <a class="jp-df-btn-dark" href="<?= e(url('/formations')) ?>" data-testid="home-hero-primary-btn">Explorer les formations <i class="fas fa-arrow-right"></i></a>
                <a class="jp-df-btn-outline" href="<?= e(url('/ad/solution-digitale-tout-en-un.html')) ?>" data-testid="home-hero-secondary-btn"><i class="fas fa-grid-2"></i> Découvrir la plateforme</a>
            </div>
            <ul class="jp-hero-reassurance reveal" aria-label="Points forts">
                <li><i class="fas fa-check" aria-hidden="true"></i><span><strong>Apprentissage flexible</strong><small>À votre rythme</small></span></li>
                <li><i class="fas fa-shield-halved" aria-hidden="true"></i><span><strong>Logiciels vérifiés</strong><small>Contrôlés avant diffusion</small></span></li>
                <li><i class="fas fa-headset" aria-hidden="true"></i><span><strong>Accompagnement humain</strong><small>Une équipe à vos côtés</small></span></li>
            </ul>

            <div class="jp-df-hero-visual reveal" aria-label="Aperçu de la plateforme JP-Services">
                <div class="jp-df-frame">
                    <span class="jp-df-frame-bar"><i></i><i></i><i></i></span>
                    <img src="<?= e(url('/images/hero-dashboard.jpg')) ?>" alt="Aperçu de la plateforme JP-Services : formations, visioconférence et statistiques">
                </div>
                <div class="jp-df-float jp-df-float-left" aria-hidden="true"><span class="jp-df-float-icon is-purple"><i class="fas fa-graduation-cap"></i></span><span><strong data-countup="<?= (int)$homeStats['formations'] ?>">0</strong> formations structurées</span></div>
                <div class="jp-df-float jp-df-float-right" aria-hidden="true"><span class="jp-df-float-icon is-red"><i class="fas fa-video"></i></span><span>Sessions en <strong>visioconférence</strong> en direct</span></div>
                <div class="jp-df-float jp-df-float-bottom" aria-hidden="true"><span class="jp-df-float-icon is-blue"><i class="fas fa-download"></i></span><span><strong data-countup="<?= (int)$homeStats['telechargements'] ?>">0</strong> téléchargements</span></div>
            </div>
        </div>

        <?php
        $serviceRibbon = [
            ['label' => 'Formations', 'caption' => 'Apprendre', 'icon' => 'fa-graduation-cap', 'image' => 'home-learn.jpg', 'url' => '/formations', 'tone' => 'violet', 'description' => 'Des parcours structurés, progressifs et accessibles pour développer des compétences utiles à votre rythme.', 'action' => 'Explorer les formations'],
            ['label' => 'En direct', 'caption' => 'Participer', 'icon' => 'fa-video', 'image' => 'home-live.jpg', 'url' => '/formations-en-ligne', 'tone' => 'coral', 'description' => 'Retrouvez des sessions en visioconférence pour apprendre, poser vos questions et avancer avec des intervenants.', 'action' => 'Voir les sessions en direct'],
            ['label' => 'Ressources', 'caption' => 'Télécharger', 'icon' => 'fa-download', 'image' => 'home-download.jpg', 'url' => '/logiciels', 'tone' => 'blue', 'description' => 'Accédez à des logiciels et ressources vérifiés, accompagnés d’informations simples pour bien démarrer.', 'action' => 'Découvrir les ressources'],
            ['label' => 'Projets', 'caption' => 'Construire', 'icon' => 'fa-rocket', 'image' => 'hero-projets.jpg', 'url' => '/projets', 'tone' => 'amber', 'description' => 'Transformez vos idées en réalisations concrètes grâce à un espace dédié au partage et à la progression.', 'action' => 'Explorer les projets'],
            ['label' => 'Communauté', 'caption' => 'Échanger', 'icon' => 'fa-comments', 'image' => 'hero-forum.jpg', 'url' => '/forum', 'tone' => 'mint', 'description' => 'Partagez vos expériences, trouvez des réponses et progressez avec des personnes qui apprennent comme vous.', 'action' => 'Rejoindre la communauté'],
            ['label' => 'Partenariats', 'caption' => 'Collaborer', 'icon' => 'fa-handshake', 'image' => 'hero-contact.jpg', 'url' => '/partenariat', 'tone' => 'indigo', 'description' => 'Construisons des actions utiles avec les associations, entreprises et institutions engagées dans le numérique.', 'action' => 'Découvrir les partenariats'],
        ];
        ?>
        <section class="jp-service-ribbon" aria-label="Les services JP-Services" data-service-showcase>
            <div class="jp-service-ribbon-heading"><span><i class="fas fa-sparkles" aria-hidden="true"></i> Explorer JP-Services</span><p>Des services reliés pour apprendre, créer et avancer.</p></div>
            <div class="jp-service-showcase">
                <div class="jp-service-showcase-stage">
                    <div class="jp-service-showcase-media" aria-live="off">
                        <?php foreach ($serviceRibbon as $serviceIndex => $service): ?>
                        <a class="jp-service-poster is-<?= e($service['tone']) ?><?= $serviceIndex === 0 ? ' is-active' : '' ?>" href="<?= e(url($service['url'])) ?>" data-service-slide data-service-index="<?= (int)$serviceIndex ?>"<?= $serviceIndex === 0 ? ' aria-current="true"' : ' aria-hidden="true" tabindex="-1"' ?>>
                            <img src="<?= e(url('/images/' . $service['image'])) ?>" alt="" loading="lazy" decoding="async">
                            <span class="jp-service-poster-shade" aria-hidden="true"></span>
                            <span class="jp-service-poster-copy"><i class="fas <?= e($service['icon']) ?>" aria-hidden="true"></i><span><strong><?= e($service['label']) ?></strong><small><?= e($service['caption']) ?></small></span><b aria-hidden="true"><i class="fas fa-arrow-up-right-from-square"></i></b></span>
                        </a>
                        <?php endforeach; ?>
                    </div>
                    <div class="jp-service-showcase-nav" aria-label="Navigation des services">
                        <button type="button" data-service-previous aria-label="Service précédent"><i class="fas fa-arrow-left" aria-hidden="true"></i></button>
                        <span aria-live="polite"><b data-service-current>01</b><small>/ <?= count($serviceRibbon) ?></small></span>
                        <button type="button" data-service-next aria-label="Service suivant"><i class="fas fa-arrow-right" aria-hidden="true"></i></button>
                    </div>
                    <div class="jp-service-showcase-dots" role="tablist" aria-label="Choisir un service">
                        <?php foreach ($serviceRibbon as $serviceIndex => $service): ?>
                        <button type="button" data-service-go="<?= (int)$serviceIndex ?>" role="tab" aria-label="Afficher <?= e($service['label']) ?>" aria-selected="<?= $serviceIndex === 0 ? 'true' : 'false' ?>"></button>
                        <?php endforeach; ?>
                    </div>
                </div>
                <div class="jp-service-showcase-detail" aria-live="polite">
                    <?php foreach ($serviceRibbon as $serviceIndex => $service): ?>
                    <article class="jp-service-showcase-copy<?= $serviceIndex === 0 ? ' is-active' : '' ?>" data-service-detail data-service-index="<?= (int)$serviceIndex ?>"<?= $serviceIndex === 0 ? '' : ' aria-hidden="true"' ?>>
                        <span class="jp-service-showcase-kicker"><i class="fas <?= e($service['icon']) ?>" aria-hidden="true"></i> <?= e($service['caption']) ?></span>
                        <h2><?= e($service['label']) ?></h2>
                        <p><?= e($service['description']) ?></p>
                        <a href="<?= e(url($service['url'])) ?>"><?= e($service['action']) ?> <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
                    </article>
                    <?php endforeach; ?>
                </div>
            </div>
            <p class="jp-service-ribbon-hint"><i class="fas fa-arrows-rotate" aria-hidden="true"></i> Les services se présentent un à un. Survolez ou sélectionnez une étape pour garder le contrôle.</p>
        </section>
    </section>

    <section class="jp-df-trust">
        <div class="home-shell">
            <div class="jp-df-trust-card reveal" data-testid="home-trust-card">
                <span class="jp-df-trust-badge"><i class="fas fa-award"></i></span>
                <h2>La plateforme qui grandit avec sa communauté.</h2>
                <div class="jp-df-trust-points">
                    <span><i class="fas fa-shield-halved"></i> Données protégées</span>
                    <span><i class="fas fa-handshake-angle"></i> Accompagnement humain</span>
                    <span><i class="fas fa-laptop-code"></i> La pratique avant tout</span>
                    <span><i class="fas fa-infinity"></i> Progression à votre rythme</span>
                </div>
            </div>
        </div>
    </section>

    <section class="jp-df-stats" aria-label="JP-Services en chiffres">
        <div class="home-shell jp-df-stats-grid">
            <div class="jp-df-stat reveal"><span class="jp-df-stat-icon"><i class="fas fa-graduation-cap"></i></span><strong><span data-countup="<?= (int)$homeStats['formations'] ?>">0</span>+</strong><span>Formations au catalogue</span></div>
            <div class="jp-df-stat reveal"><span class="jp-df-stat-icon"><i class="fas fa-users"></i></span><strong><span data-countup="<?= (int)$homeStats['membres'] ?>">0</span>+</strong><span>Membres inscrits</span></div>
            <div class="jp-df-stat reveal"><span class="jp-df-stat-icon"><i class="fas fa-box-open"></i></span><strong><span data-countup="<?= (int)$homeStats['logiciels'] ?>">0</span>+</strong><span>Logiciels en ligne</span></div>
            <div class="jp-df-stat reveal"><span class="jp-df-stat-icon"><i class="fas fa-arrow-down"></i></span><strong><span data-countup="<?= (int)$homeStats['telechargements'] ?>">0</span>+</strong><span>Téléchargements</span></div>
        </div>
    </section>

    <section class="jp-section jp-df-toolkit">
        <div class="home-shell">
            <header class="jp-centered-heading reveal">
                <span class="jp-section-kicker">Tout-en-un</span>
                <h2>Toutes les solutions dans une seule boîte à outils.</h2>
                <p>Apprendre, pratiquer, échanger, télécharger : chaque module répond à un besoin concret de votre parcours.</p>
            </header>
            <div class="jp-df-toolkit-grid">
                <article class="jp-df-tool jp-df-tool-purple reveal" data-testid="home-tool-formations">
                    <span class="jp-df-tool-icon"><i class="fas fa-graduation-cap"></i></span>
                    <h3>Formations</h3>
                    <p>Des parcours structurés par domaine et par niveau, avec programme, tarifs et prochaines sessions.</p>
                    <a href="<?= e(url('/formations')) ?>">Voir le catalogue <i class="fas fa-arrow-right"></i></a>
                </article>
                <article class="jp-df-tool jp-df-tool-red reveal" data-testid="home-tool-live">
                    <span class="jp-df-tool-icon"><i class="fas fa-video"></i></span>
                    <h3>Formations en ligne</h3>
                    <p>Rejoignez une salle de visioconférence depuis votre ordinateur ou votre téléphone, sans rien installer.</p>
                    <a href="<?= e(url('/formations-en-ligne')) ?>">Rejoindre une session <i class="fas fa-arrow-right"></i></a>
                </article>
                <article class="jp-df-tool jp-df-tool-blue reveal" data-testid="home-tool-logiciels">
                    <span class="jp-df-tool-icon"><i class="fas fa-download"></i></span>
                    <h3>Logiciels</h3>
                    <p>Une médiathèque d’outils vérifiés avec version, plateforme et licence, prêts à télécharger.</p>
                    <a href="<?= e(url('/logiciels')) ?>">Parcourir la médiathèque <i class="fas fa-arrow-right"></i></a>
                </article>
                <article class="jp-df-tool jp-df-tool-amber reveal" data-testid="home-tool-projets">
                    <span class="jp-df-tool-icon"><i class="fas fa-laptop-code"></i></span>
                    <h3>Projets digitaux</h3>
                    <p>Découvrez les réalisations de la communauté et proposez votre propre initiative.</p>
                    <a href="<?= e(url('/projets')) ?>">Voir les projets <i class="fas fa-arrow-right"></i></a>
                </article>
                <article class="jp-df-tool jp-df-tool-green reveal" data-testid="home-tool-forum">
                    <span class="jp-df-tool-icon"><i class="fas fa-comments"></i></span>
                    <h3>Forum d’entraide</h3>
                    <p>Posez vos questions, partagez votre expérience et aidez les autres membres à progresser.</p>
                    <a href="<?= e(url('/forum')) ?>">Rejoindre les échanges <i class="fas fa-arrow-right"></i></a>
                </article>
                <article class="jp-df-tool jp-df-tool-cyan reveal" data-testid="home-tool-partenariat">
                    <span class="jp-df-tool-icon"><i class="fas fa-handshake"></i></span>
                    <h3>Partenariat</h3>
                    <p>Organisations et entreprises : construisons ensemble des opportunités de formation.</p>
                    <a href="<?= e(url('/partenariat')) ?>">Devenir partenaire <i class="fas fa-arrow-right"></i></a>
                </article>
            </div>
        </div>
    </section>

    <section class="jp-section jp-df-rows">
        <div class="home-shell">
            <div class="jp-df-row reveal">
                <div class="jp-df-row-media"><img src="<?= e(url('/images/home-learn.jpg')) ?>" alt="Apprenants en formation pratique chez JP-Services" loading="lazy" decoding="async"></div>
                <div class="jp-df-row-copy">
                    <span class="jp-df-row-kicker is-purple"><i class="fas fa-graduation-cap"></i> Apprendre</span>
                    <h2>Des formations claires, pensées pour aboutir.</h2>
                    <p>Chaque formation affiche son programme, son niveau, sa durée et sa prochaine session. Vous savez exactement où vous allez avant de vous inscrire.</p>
                    <ul>
                        <li><i class="fas fa-check"></i> Modules structurés et objectifs mesurables</li>
                        <li><i class="fas fa-check"></i> Programme personnalisé après inscription</li>
                        <li><i class="fas fa-check"></i> Alertes sur les nouvelles sessions</li>
                    </ul>
                    <a class="jp-df-btn-dark" href="<?= e(url('/formations')) ?>">Choisir ma formation <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>

            <div class="jp-df-row jp-df-row-reverse reveal">
                <div class="jp-df-row-media"><img src="<?= e(url('/images/home-download.jpg')) ?>" alt="Téléchargement de logiciels vérifiés" loading="lazy" decoding="async"></div>
                <div class="jp-df-row-copy">
                    <span class="jp-df-row-kicker is-blue"><i class="fas fa-download"></i> Télécharger</span>
                    <h2>Les bons outils, vérifiés et prêts à l’emploi.</h2>
                    <p>La médiathèque Logiciels rassemble les applications utilisées pendant les formations : chaque fiche indique la version, la taille, la plateforme et la licence.</p>
                    <ul>
                        <li><i class="fas fa-check"></i> Fichiers contrôlés par l’équipe</li>
                        <li><i class="fas fa-check"></i> Tri par catégorie, plateforme et popularité</li>
                        <li><i class="fas fa-check"></i> Compteur de téléchargements en direct</li>
                    </ul>
                    <a class="jp-df-btn-dark" href="<?= e(url('/logiciels')) ?>">Accéder aux logiciels <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>

            <div class="jp-df-row reveal">
                <div class="jp-df-row-media"><img src="<?= e(url('/images/home-live.jpg')) ?>" alt="Formation en visioconférence JP-Services" loading="lazy" decoding="async"></div>
                <div class="jp-df-row-copy">
                    <span class="jp-df-row-kicker is-red"><i class="fas fa-video"></i> En direct</span>
                    <h2>La classe vous suit, où que vous soyez.</h2>
                    <p>Les formations en ligne se déroulent en visioconférence intégrée au site : un lien unique à partager par WhatsApp ou Telegram, et c’est parti.</p>
                    <ul>
                        <li><i class="fas fa-check"></i> Sans installation, depuis le navigateur</li>
                        <li><i class="fas fa-check"></i> Micro coupé par défaut, nom pré-rempli</li>
                        <li><i class="fas fa-check"></i> Invitation simple pour vos proches</li>
                    </ul>
                    <a class="jp-df-btn-dark" href="<?= e(url('/formations-en-ligne')) ?>">Voir les sessions en ligne <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </div>
    </section>

    <section class="jp-featured-learning jp-df-sessions">
        <div class="home-shell">
            <header class="jp-section-heading-row reveal">
                <div><span class="jp-section-kicker">Prochaines sessions</span><h2>Choisissez la formation qui correspond à votre objectif.</h2></div>
                <a class="jp-text-link" href="<?= e(url('/formations')) ?>">Voir tout le catalogue <i class="fas fa-arrow-right"></i></a>
            </header>

            <?php if ($formations): ?>
                <div class="jp-home-training-grid">
                    <?php foreach ($formations as $formation): ?>
                        <article class="jp-home-training-card reveal">
                            <a class="jp-home-training-media" href="<?= e(app_route('/formation', ['id' => (int)$formation['id']])) ?>">
                                <?php if (!empty($formation['image'])): ?><img src="<?= e(jp_formation_image($formation['image'])) ?>" alt=""><?php else: ?><span><i class="fas fa-graduation-cap"></i></span><?php endif; ?>
                                <span class="jp-training-format">Formation</span>
                            </a>
                            <div class="jp-home-training-body">
                                <div class="jp-training-meta"><span><i class="far fa-calendar"></i> <?= e(date('d/m/Y', strtotime((string)$formation['date_debut']))) ?></span><span><?= number_format((float)$formation['prix'], 0, ',', ' ') ?> $</span></div>
                                <h3 data-no-translate><a href="<?= e(app_route('/formation', ['id' => (int)$formation['id']])) ?>"><?= e($formation['titre']) ?></a></h3>
                                <p>Consultez le contenu, les prérequis et les modalités avant de préparer votre programme.</p>
                                <a class="jp-card-link" href="<?= e(app_route('/formation', ['id' => (int)$formation['id']])) ?>">Voir la formation <i class="fas fa-arrow-right"></i></a>
                            </div>
                        </article>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="jp-home-empty reveal">
                    <span><i class="far fa-calendar-plus"></i></span>
                    <div><h3>Les prochaines sessions seront bientôt publiées.</h3><p>Parcourez le catalogue et créez votre compte pour recevoir les nouvelles disponibilités.</p></div>
                    <a class="jp-btn jp-btn-primary" href="<?= e(url('/formations')) ?>">Voir le catalogue</a>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <section class="jp-section jp-df-values">
        <div class="home-shell">
            <header class="jp-centered-heading reveal">
                <span class="jp-section-kicker">Nos valeurs</span>
                <h2>Une communauté, une discipline, une mission.</h2>
            </header>
            <div class="jp-df-values-grid">
                <article class="reveal"><img src="<?= e(url('/images/value-mission.jpg')) ?>" alt="Mission JP-Services" loading="lazy" decoding="async"><div><h3>Mission</h3><p>Rendre les compétences numériques accessibles à tous, avec des parcours concrets et mesurables.</p></div></article>
                <article class="reveal"><img src="<?= e(url('/images/value-discipline.jpg')) ?>" alt="Discipline JP-Services" loading="lazy" decoding="async"><div><h3>Discipline</h3><p>Des programmes structurés et un suivi régulier pour transformer la motivation en progression.</p></div></article>
                <article class="reveal"><img src="<?= e(url('/images/value-community.jpg')) ?>" alt="Valeurs de la communauté JP-Services" loading="lazy" decoding="async"><div><h3>Valeurs</h3><p>Entraide, transparence et respect : la communauté avance ensemble, sans laisser personne de côté.</p></div></article>
            </div>
        </div>
    </section>

    <section class="jp-community-section">
        <div class="home-shell">
            <header class="jp-section-heading-row reveal">
                <div><span class="jp-section-kicker">Vie de la communauté</span><h2>Les actualités et idées qui nous font avancer.</h2></div>
                <a class="jp-text-link" href="<?= e(url('/actualites')) ?>">Toutes les actualités <i class="fas fa-arrow-right"></i></a>
            </header>
            <div class="jp-home-news-grid">
                <?php if ($articles): ?>
                    <?php foreach (array_slice($articles, 0, 3) as $article): ?>
                        <article class="jp-home-news-card reveal">
                            <a class="jp-home-news-media" href="<?= e(app_route('/actualite', ['id' => (int)$article['id']])) ?>">
                                <?php if (!empty($article['media']) && jp_media_is_image($article['media'])): ?><img src="<?= e(jp_home_media_url($article['media'])) ?>" alt=""><?php else: ?><span><i class="far fa-newspaper"></i></span><?php endif; ?>
                            </a>
                            <div>
                                <span class="jp-news-date"><?= e(jp_home_date_label($article['date_publication'] ?? '')) ?></span>
                                <h3 data-no-translate><a href="<?= e(app_route('/actualite', ['id' => (int)$article['id']])) ?>"><?= e($article['titre']) ?></a></h3>
                                <p data-no-translate><?= e(jp_excerpt($article['contenu'], 125)) ?></p>
                                <a class="jp-card-link" href="<?= e(app_route('/actualite', ['id' => (int)$article['id']])) ?>">Lire l’article <i class="fas fa-arrow-right"></i></a>
                            </div>
                        </article>
                    <?php endforeach; ?>
                <?php else: ?>
                    <article class="jp-home-news-card jp-home-news-placeholder reveal">
                        <div class="jp-home-news-media"><span><i class="fas fa-people-group"></i></span></div>
                        <div><span class="jp-news-date">JP‑Services</span><h3>Une communauté tournée vers le progrès.</h3><p>Retrouvez bientôt les nouvelles initiatives, formations et opportunités partagées par l’équipe.</p><a class="jp-card-link" href="<?= e(url('/forum')) ?>">Rejoindre les échanges <i class="fas fa-arrow-right"></i></a></div>
                    </article>
                <?php endif; ?>
            </div>
        </div>
    </section>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
