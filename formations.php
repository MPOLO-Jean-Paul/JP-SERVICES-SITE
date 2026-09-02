<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/formation_helpers.php';
require_once __DIR__ . '/includes/connexion_db.php';

function jp_training_level_label(string $value): string
{
    if (!jp_is_english()) {
        return $value;
    }
    $key = mb_strtolower(trim($value), 'UTF-8');
    return [
        'débutant' => 'Beginner',
        'intermédiaire' => 'Intermediate',
        'avance' => 'Advanced',
        'avancé' => 'Advanced',
        'tous niveaux' => 'All levels',
        'niveau ouvert' => 'Open level',
    ][$key] ?? $value;
}

function jp_training_duration_label(mixed $value): string
{
    $label = trim((string)$value);
    if (!jp_is_english() || $label === '') {
        return $label;
    }
    return str_ireplace(
        [' semaines', ' semaine', ' mois', ' jours', ' jour', ' heures', ' heure'],
        [' weeks', ' week', ' months', ' days', ' day', ' hours', ' hour'],
        $label
    );
}

try {
    $stmt = $conn->query('SELECT * FROM formations ORDER BY titre ASC');
    $formations = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Catalogue formations: ' . $exception->getMessage());
    $formations = [];
}

$domains = [];
$levels = [];
$upcomingCount = 0;
$today = new DateTimeImmutable('today');

foreach ($formations as &$formation) {
    $formation['_domain'] = jp_formation_domain($formation);
    $formation['_modules'] = jp_formation_modules($formation['modules_liste'] ?? '');
    $formation['_excerpt'] = jp_formation_excerpt($formation['description'] ?? '');
    $domainSlug = (string)$formation['_domain']['slug'];
    if (!isset($domains[$domainSlug])) {
        $domains[$domainSlug] = [
            'label' => (string)$formation['_domain']['label'],
            'icon' => (string)$formation['_domain']['icon'],
            'count' => 0,
        ];
    }
    $domains[$domainSlug]['count']++;
    $level = trim((string)($formation['niveau'] ?? ''));
    if ($level !== '') {
        $levels[mb_strtolower($level, 'UTF-8')] = jp_training_level_label($level);
    }
    $start = DateTimeImmutable::createFromFormat('!Y-m-d', substr((string)($formation['date_debut'] ?? ''), 0, 10));
    if ($start && $start >= $today) {
        $upcomingCount++;
    }
}
unset($formation);
ksort($domains, SORT_NATURAL | SORT_FLAG_CASE);
asort($levels, SORT_NATURAL | SORT_FLAG_CASE);

include __DIR__ . '/includes/header.php';
?>

<main id="main-content" class="jp-training-page">
    <section class="jp-training-hero">
        <div class="home-shell jp-training-hero-grid">
            <div class="reveal">
                <span class="home-eyebrow"><i class="fas fa-compass"></i> Catalogue JP-Services</span>
                <h2>Choisissez une compétence qui fait avancer votre projet.</h2>
                <p>Explorez des formations structurées, comparez les niveaux et organisez un programme adapté à vos disponibilités.</p>
                <div class="jp-training-hero-actions">
                    <a class="jp-btn jp-btn-primary" href="#catalogue-formations">Explorer le catalogue <i class="fas fa-arrow-down"></i></a>
                    <a class="jp-btn jp-btn-secondary" href="<?= e(url('/formations-en-ligne')) ?>"><i class="fas fa-video"></i> Formations en ligne</a>
                    <a class="jp-text-link" href="<?= e(url('/aide')) ?>">Besoin d’aide pour choisir ? <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
            <aside class="jp-training-overview reveal" aria-label="Aperçu du catalogue">
                <div class="jp-hero-illustration" aria-hidden="true"><img src="<?= e(url('/images/home-learn.jpg')) ?>" alt=""></div>
                <div><strong><?= count($formations) ?></strong><span>formation<?= count($formations) > 1 ? 's' : '' ?> disponible<?= count($formations) > 1 ? 's' : '' ?></span></div>
                <div><strong><?= count($domains) ?></strong><span>domaine<?= count($domains) > 1 ? 's' : '' ?> professionnel<?= count($domains) > 1 ? 's' : '' ?></span></div>
                <div><strong><?= $upcomingCount ?></strong><span>session<?= $upcomingCount > 1 ? 's' : '' ?> planifiée<?= $upcomingCount > 1 ? 's' : '' ?></span></div>
            </aside>
        </div>
    </section>

    <section class="jp-section jp-training-catalog" id="catalogue-formations" data-training-catalog>
        <div class="home-shell">
            <div class="jp-training-finder reveal" role="search" aria-label="Filtrer les formations">
                <div class="jp-training-search">
                    <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
                    <label class="visually-hidden" for="trainingSearch">Rechercher une formation</label>
                    <input id="trainingSearch" type="search" placeholder="Rechercher par titre, compétence ou domaine…" autocomplete="off" data-training-search>
                    <kbd>/</kbd>
                </div>
                <div class="jp-training-selects">
                    <label>
                        <span>Niveau</span>
                        <select data-training-level>
                            <option value="all">Tous les niveaux</option>
                            <?php foreach ($levels as $value => $label): ?><option value="<?= e($value) ?>"><?= e($label) ?></option><?php endforeach; ?>
                        </select>
                    </label>
                    <label>
                        <span>Accès</span>
                        <select data-training-price>
                            <option value="all">Tous les tarifs</option>
                            <option value="free">Gratuit</option>
                            <option value="paid">Payant</option>
                        </select>
                    </label>
                    <label>
                        <span>Trier par</span>
                        <select data-training-sort>
                            <option value="title">Pertinence</option>
                            <option value="price-asc">Prix croissant</option>
                            <option value="price-desc">Prix décroissant</option>
                            <option value="date">Prochaine session</option>
                        </select>
                    </label>
                </div>
            </div>

            <?php if ($domains !== []): ?>
            <div class="jp-training-domains reveal" aria-label="Filtrer par domaine">
                <button class="is-active" type="button" data-training-category="all" aria-pressed="true"><i class="fas fa-border-all"></i> Tous <span><?= count($formations) ?></span></button>
                <?php foreach ($domains as $slug => $domain): ?>
                    <button type="button" data-training-category="<?= e($slug) ?>" aria-pressed="false"><i class="fas <?= e($domain['icon']) ?>"></i> <?= e($domain['label']) ?> <span><?= (int)$domain['count'] ?></span></button>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <div class="jp-training-results-head reveal">
                <div>
                    <span class="home-eyebrow">Résultats</span>
                    <h2><strong data-training-count><?= count($formations) ?></strong> <span data-training-count-label>formation<?= count($formations) > 1 ? 's' : '' ?> à découvrir</span></h2>
                </div>
                <button type="button" class="jp-filter-reset" data-training-reset hidden><i class="fas fa-rotate-left"></i> Réinitialiser les filtres</button>
            </div>

            <?php if ($formations !== []): ?>
            <div class="jp-training-grid" data-training-grid aria-live="polite">
                <?php foreach ($formations as $formation):
                    $price = max(0, (float)($formation['prix'] ?? 0));
                    $level = trim((string)($formation['niveau'] ?? 'Niveau ouvert')) ?: 'Niveau ouvert';
                    $levelDisplay = jp_training_level_label($level);
                    $dateValue = substr((string)($formation['date_debut'] ?? ''), 0, 10);
                    $dateTimestamp = strtotime($dateValue) ?: PHP_INT_MAX;
                    $searchValue = mb_strtolower(implode(' ', [
                        (string)($formation['titre'] ?? ''),
                        (string)($formation['description'] ?? ''),
                        (string)$formation['_domain']['label'],
                        $level . ' ' . $levelDisplay,
                    ]), 'UTF-8');
                ?>
                <article class="jp-training-card reveal"
                    data-training-item
                    data-title="<?= e(mb_strtolower((string)$formation['titre'], 'UTF-8')) ?>"
                    data-search="<?= e($searchValue) ?>"
                    data-category="<?= e($formation['_domain']['slug']) ?>"
                    data-level="<?= e(mb_strtolower($level, 'UTF-8')) ?>"
                    data-price-type="<?= $price > 0 ? 'paid' : 'free' ?>"
                    data-price="<?= e((string)$price) ?>"
                    data-date="<?= e((string)$dateTimestamp) ?>">
                    <a class="jp-training-card-media" href="<?= e(app_route('/formation', ['id' => (int)$formation['id']])) ?>" tabindex="-1" aria-hidden="true">
                        <img src="<?= e(jp_formation_image($formation['image'] ?? '')) ?>" alt="" loading="lazy" decoding="async" data-fallback-src="<?= e(url('/images/formations/default.jpg')) ?>">
                        <span><i class="fas <?= e($formation['_domain']['icon']) ?>"></i> <?= e($formation['_domain']['label']) ?></span>
                    </a>
                    <div class="jp-training-card-body">
                        <div class="jp-training-card-kicker"><span>Formation</span><span><?= e($levelDisplay) ?></span></div>
                        <h3 data-no-translate><a href="<?= e(app_route('/formation', ['id' => (int)$formation['id']])) ?>"><?= e($formation['titre']) ?></a></h3>
                        <p data-no-translate><?= e($formation['_excerpt']) ?></p>
                        <dl class="jp-training-card-facts">
                            <div><dt><i class="far fa-clock"></i> Durée</dt><dd><?= e(jp_training_duration_label($formation['duree'] ?? jp_tr('À confirmer', 'To be confirmed'))) ?></dd></div>
                            <div><dt><i class="far fa-calendar"></i> Prochaine session</dt><dd><?= e(jp_formation_date_label($formation['date_debut'] ?? '')) ?></dd></div>
                            <div><dt><i class="fas fa-list-check"></i> Programme</dt><dd><?= count($formation['_modules']) > 0 ? count($formation['_modules']) . ' module' . (count($formation['_modules']) > 1 ? 's' : '') : 'Parcours guidé' ?></dd></div>
                        </dl>
                        <div class="jp-training-card-footer">
                            <div><span>Tarif</span><strong class="<?= $price <= 0 ? 'is-free' : '' ?>"><?= e(jp_formation_price_label($price)) ?></strong></div>
                            <a class="jp-btn jp-btn-secondary" href="<?= e(app_route('/formation', ['id' => (int)$formation['id']])) ?>">Voir la formation <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                </article>
                <?php endforeach; ?>
            </div>
            <div class="jp-training-empty" data-training-empty hidden>
                <span><i class="fas fa-magnifying-glass"></i></span>
                <h3>Aucune formation ne correspond</h3>
                <p>Modifiez votre recherche ou réinitialisez les filtres pour afficher tout le catalogue.</p>
                <button class="jp-btn jp-btn-primary" type="button" data-training-reset>Afficher toutes les formations</button>
            </div>
            <?php else: ?>
            <div class="jp-training-empty is-static reveal">
                <span><i class="fas fa-book-open"></i></span>
                <h3>Le prochain catalogue est en préparation</h3>
                <p>Contactez notre équipe pour être informé de l’ouverture des nouvelles sessions.</p>
                <a class="jp-btn jp-btn-primary" href="<?= e(url('/contact')) ?>">Contacter JP-Services</a>
            </div>
            <?php endif; ?>
        </div>
    </section>

    <section class="jp-section jp-training-guidance">
        <div class="home-shell">
            <div class="jp-section-heading reveal"><span class="home-eyebrow">Bien choisir</span><h2>Un parcours clair, de la découverte à la pratique.</h2><p>Chaque fiche vous donne les informations utiles avant de vous engager.</p></div>
            <div class="jp-training-steps">
                <article class="reveal"><span>01</span><i class="fas fa-magnifying-glass-chart"></i><h3>Comparez</h3><p>Filtrez par domaine, niveau, durée et tarif pour identifier la formation adaptée.</p></article>
                <article class="reveal"><span>02</span><i class="fas fa-rectangle-list"></i><h3>Consultez le programme</h3><p>Découvrez les modules, le déroulement et les prochaines dates avant l’inscription.</p></article>
                <article class="reveal"><span>03</span><i class="fas fa-calendar-check"></i><h3>Planifiez</h3><p>Après inscription, proposez vos disponibilités et suivez la validation de votre planning.</p></article>
            </div>
        </div>
    </section>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
