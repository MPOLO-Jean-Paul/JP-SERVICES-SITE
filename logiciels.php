<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/logiciel_helpers.php';
require_once __DIR__ . '/includes/connexion_db.php';

try {
    $categories = $conn->query('SELECT * FROM logiciel_categories ORDER BY ordre ASC, nom ASC')->fetchAll(PDO::FETCH_ASSOC);
    $stmt = $conn->query(
        'SELECT l.*, c.nom AS categorie_nom, c.slug AS categorie_slug, c.icone AS categorie_icone
         FROM logiciels l
         LEFT JOIN logiciel_categories c ON c.id = l.categorie_id
         WHERE l.statut = "publie"
         ORDER BY l.mis_a_jour DESC'
    );
    $logiciels = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Catalogue logiciels: ' . $exception->getMessage());
    $categories = [];
    $logiciels = [];
}

$usedCategoryIds = array_unique(array_filter(array_map(static fn(array $item) => $item['categorie_id'], $logiciels)));
$categories = array_values(array_filter($categories, static fn(array $cat) => in_array($cat['id'], $usedCategoryIds, true) || $logiciels === []));
$platforms = [];
$totalDownloads = 0;
foreach ($logiciels as $item) {
    $platform = trim((string)($item['plateforme'] ?? ''));
    if ($platform !== '') {
        $platforms[$platform] = true;
    }
    $totalDownloads += (int)$item['telechargements'];
}
ksort($platforms, SORT_NATURAL | SORT_FLAG_CASE);
$intro = jp_setting($conn, 'logiciels_intro', 'Téléchargez les logiciels et outils recommandés par JP-Services.');

include __DIR__ . '/includes/header.php';
?>

<main id="main-content" class="jp-soft-page">
    <section class="jp-training-hero jp-soft-hero">
        <div class="home-shell jp-training-hero-grid">
            <div class="reveal">
                <span class="home-eyebrow"><i class="fas fa-download"></i> Médiathèque JP-Services</span>
                <h2 data-testid="logiciels-title">Des logiciels utiles, prêts à télécharger.</h2>
                <p data-testid="logiciels-intro"><?= e($intro) ?></p>
                <div class="jp-training-hero-actions">
                    <a class="jp-btn jp-btn-primary" href="#catalogue-logiciels" data-testid="logiciels-browse-btn">Parcourir les logiciels <i class="fas fa-arrow-down"></i></a>
                    <a class="jp-text-link" href="<?= e(url('/contact')) ?>">Suggérer un logiciel <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
            <aside class="jp-training-overview reveal" aria-label="Aperçu de la médiathèque">
                <div><strong data-testid="logiciels-stat-count"><?= count($logiciels) ?></strong><span>logiciel<?= count($logiciels) > 1 ? 's' : '' ?> disponible<?= count($logiciels) > 1 ? 's' : '' ?></span></div>
                <div><strong><?= count($categories) ?></strong><span>catégorie<?= count($categories) > 1 ? 's' : '' ?></span></div>
                <div><strong data-testid="logiciels-stat-downloads"><?= $totalDownloads ?></strong><span>téléchargement<?= $totalDownloads > 1 ? 's' : '' ?> au total</span></div>
            </aside>
        </div>
    </section>

    <section class="jp-section jp-training-catalog" id="catalogue-logiciels" data-soft-catalog>
        <div class="home-shell">
            <div class="jp-training-finder reveal" role="search" aria-label="Filtrer les logiciels">
                <div class="jp-training-search">
                    <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
                    <label class="visually-hidden" for="softSearch">Rechercher un logiciel</label>
                    <input id="softSearch" type="search" placeholder="Rechercher par nom, description ou plateforme…" autocomplete="off" data-soft-search data-testid="logiciels-search-input">
                </div>
                <div class="jp-training-selects">
                    <label>
                        <span>Plateforme</span>
                        <select data-soft-os data-testid="logiciels-os-select">
                            <option value="all">Toutes les plateformes</option>
                            <?php foreach (array_keys($platforms) as $platform): ?><option value="<?= e(mb_strtolower($platform, 'UTF-8')) ?>"><?= e($platform) ?></option><?php endforeach; ?>
                        </select>
                    </label>
                    <label>
                        <span>Trier par</span>
                        <select data-soft-sort data-testid="logiciels-sort-select">
                            <option value="recent">Plus récents</option>
                            <option value="name">Nom (A à Z)</option>
                            <option value="downloads">Plus téléchargés</option>
                        </select>
                    </label>
                </div>
            </div>

            <?php if ($categories !== []): ?>
            <div class="jp-training-domains reveal" aria-label="Filtrer par catégorie" data-testid="logiciels-categories">
                <button class="is-active" type="button" data-soft-category="all" aria-pressed="true"><i class="fas fa-border-all"></i> Tous <span><?= count($logiciels) ?></span></button>
                <?php foreach ($categories as $category):
                    $count = count(array_filter($logiciels, static fn(array $item) => (int)$item['categorie_id'] === (int)$category['id']));
                ?>
                    <button type="button" data-soft-category="<?= e($category['slug']) ?>" aria-pressed="false"><i class="fas <?= e($category['icone']) ?>"></i> <?= e($category['nom']) ?> <span><?= $count ?></span></button>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <div class="jp-training-results-head reveal">
                <div>
                    <span class="home-eyebrow">Résultats</span>
                    <h2><strong data-soft-count><?= count($logiciels) ?></strong> <span data-soft-count-label>logiciel<?= count($logiciels) > 1 ? 's' : '' ?> à télécharger</span></h2>
                </div>
                <button type="button" class="jp-filter-reset" data-soft-reset hidden><i class="fas fa-rotate-left"></i> Réinitialiser les filtres</button>
            </div>

            <?php if ($logiciels !== []): ?>
            <div class="jp-training-grid jp-soft-grid" data-soft-grid aria-live="polite">
                <?php foreach ($logiciels as $logiciel):
                    $categorySlug = (string)($logiciel['categorie_slug'] ?? 'divers');
                    $categoryName = (string)($logiciel['categorie_nom'] ?? 'Divers');
                    $categoryIcon = (string)($logiciel['categorie_icone'] ?? 'fa-box-open');
                    $searchValue = mb_strtolower(implode(' ', [
                        (string)$logiciel['nom'],
                        (string)($logiciel['description'] ?? ''),
                        $categoryName,
                        (string)($logiciel['plateforme'] ?? ''),
                        (string)($logiciel['version'] ?? ''),
                    ]), 'UTF-8');
                    $isExternal = trim((string)$logiciel['lien_externe']) !== '' && trim((string)$logiciel['fichier']) === '';
                ?>
                <article class="jp-training-card jp-soft-card reveal"
                    data-soft-item
                    data-testid="logiciel-card-<?= (int)$logiciel['id'] ?>"
                    data-title="<?= e(mb_strtolower((string)$logiciel['nom'], 'UTF-8')) ?>"
                    data-search="<?= e($searchValue) ?>"
                    data-category="<?= e($categorySlug) ?>"
                    data-os="<?= e(mb_strtolower((string)($logiciel['plateforme'] ?? ''), 'UTF-8')) ?>"
                    data-downloads="<?= (int)$logiciel['telechargements'] ?>"
                    data-updated="<?= (int)(strtotime((string)$logiciel['mis_a_jour']) ?: 0) ?>">
                    <div class="jp-soft-card-media">
                        <?php if (!empty($logiciel['image'])): ?>
                            <img src="<?= e(url('/' . ltrim((string)$logiciel['image'], '/'))) ?>" alt="" loading="lazy" decoding="async">
                        <?php else: ?>
                            <span><i class="fas <?= e($categoryIcon) ?>"></i></span>
                        <?php endif; ?>
                        <span class="jp-soft-version"><?= $logiciel['version'] !== '' ? 'v' . e($logiciel['version']) : 'Version récente' ?></span>
                    </div>
                    <div class="jp-training-card-body">
                        <div class="jp-training-card-kicker"><span><i class="fas <?= e($categoryIcon) ?>"></i> <?= e($categoryName) ?></span><span><?= e($logiciel['licence'] ?: 'Gratuit') ?></span></div>
                        <h3 data-no-translate><?= e($logiciel['nom']) ?></h3>
                        <p data-no-translate><?= e(mb_strimwidth(trim((string)($logiciel['description'] ?? '')), 0, 200, '…')) ?></p>
                        <dl class="jp-training-card-facts">
                            <div><dt><i class="fas fa-laptop"></i> Plateforme</dt><dd><?= e($logiciel['plateforme'] !== '' ? $logiciel['plateforme'] : 'Multiplateforme') ?></dd></div>
                            <div><dt><i class="fas fa-weight-hanging"></i> Taille</dt><dd><?= e(jp_logiciel_size($logiciel['taille_octets'])) ?></dd></div>
                            <div><dt><i class="fas fa-arrow-down"></i> Téléchargements</dt><dd data-testid="logiciel-downloads-<?= (int)$logiciel['id'] ?>"><?= (int)$logiciel['telechargements'] ?></dd></div>
                        </dl>
                        <div class="jp-training-card-footer">
                            <div><span>Mis à jour</span><strong><?= e(jp_logiciel_date_label($logiciel['mis_a_jour'])) ?></strong></div>
                            <a class="jp-btn jp-btn-primary" href="<?= e(app_route('/telecharger', ['id' => (int)$logiciel['id']])) ?>" data-testid="logiciel-download-btn-<?= (int)$logiciel['id'] ?>"<?= $isExternal ? ' rel="noopener"' : '' ?>><i class="fas fa-download"></i> Télécharger</a>
                        </div>
                    </div>
                </article>
                <?php endforeach; ?>
            </div>
            <div class="jp-training-empty" data-soft-empty hidden>
                <span><i class="fas fa-magnifying-glass"></i></span>
                <h3>Aucun logiciel ne correspond</h3>
                <p>Modifiez votre recherche ou réinitialisez les filtres pour afficher toute la médiathèque.</p>
                <button class="jp-btn jp-btn-primary" type="button" data-soft-reset>Afficher tous les logiciels</button>
            </div>
            <?php else: ?>
            <div class="jp-training-empty is-static reveal" data-testid="logiciels-empty">
                <span><i class="fas fa-box-open"></i></span>
                <h3>La médiathèque est en préparation</h3>
                <p>Les premiers logiciels seront publiés prochainement. Revenez régulièrement ou contactez-nous pour une suggestion.</p>
                <a class="jp-btn jp-btn-primary" href="<?= e(url('/contact')) ?>">Contacter JP-Services</a>
            </div>
            <?php endif; ?>
        </div>
    </section>

    <section class="jp-section jp-training-guidance">
        <div class="home-shell">
            <div class="jp-section-heading reveal"><span class="home-eyebrow">Télécharger en confiance</span><h2>Des fichiers vérifiés et des informations claires.</h2><p>Chaque logiciel publié est contrôlé par l’équipe JP-Services avant sa mise en ligne.</p></div>
            <div class="jp-training-steps">
                <article class="reveal"><span>01</span><i class="fas fa-shield-halved"></i><h3>Fichiers contrôlés</h3><p>Chaque téléversement est vérifié par l’administration avant d’être accessible publiquement.</p></article>
                <article class="reveal"><span>02</span><i class="fas fa-circle-info"></i><h3>Fiches détaillées</h3><p>Version, taille, plateforme et licence sont indiquées pour choisir en toute connaissance de cause.</p></article>
                <article class="reveal"><span>03</span><i class="fas fa-rotate"></i><h3>Mises à jour suivies</h3><p>Les logiciels sont actualisés au fil des versions utilisées dans nos formations.</p></article>
            </div>
        </div>
    </section>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
