<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';

$articles = [];
$newsUnavailable = false;
try {
    $mediaColumn = jp_actualite_media_column($conn);
    $stmt = $conn->query("SELECT id, titre, contenu, {$mediaColumn} AS media, date_publication FROM actualites ORDER BY date_publication DESC, id DESC");
    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Actualites publiques: ' . $exception->getMessage());
    $newsUnavailable = true;
}

function jp_news_excerpt(mixed $content, int $length = 190): string
{
    $plain = trim(preg_replace('/\s+/u', ' ', strip_tags((string)$content)) ?? '');
    if (mb_strlen($plain, 'UTF-8') <= $length) {
        return $plain;
    }
    return rtrim(mb_substr($plain, 0, $length - 1, 'UTF-8'), " \t\n\r\0\x0B,.;:") . '…';
}

function jp_news_media_url(mixed $media): string
{
    $media = trim((string)$media);
    if ($media === '') {
        return '';
    }
    if (preg_match('~^https://~i', $media)) {
        return $media;
    }
    if (preg_match('~^[a-z][a-z0-9+.-]*:~i', $media)) {
        return '';
    }
    return url('/' . ltrim(str_replace('\\', '/', $media), '/'));
}

function jp_news_date_label(mixed $value): string
{
    $timestamp = strtotime((string)$value);
    return $timestamp ? date('d/m/Y', $timestamp) : jp_tr('Date à confirmer', 'Date to be confirmed');
}

include __DIR__ . '/includes/header.php';
?>

<main id="main-content" class="jp-news-page">
    <section class="jp-news-hero">
        <div class="home-shell jp-news-hero-grid">
            <div class="reveal">
                <span class="home-eyebrow"><i class="far fa-newspaper"></i> Actualités et ressources</span>
                <h2>Des nouvelles utiles pour apprendre, créer et progresser.</h2>
                <p>Retrouvez les annonces, conseils et initiatives publiés par l’équipe JP‑Services.</p>
            </div>
            <div class="jp-news-hero-actions reveal">
                <div class="jp-hero-illustration" aria-hidden="true"><img src="<?= e(url('/images/hero-actualites.jpg')) ?>" alt=""></div>
                <a class="jp-btn jp-btn-primary" href="<?= e(url('/formations')) ?>">Découvrir les formations <i class="fas fa-arrow-right"></i></a>
                <a class="jp-text-link" href="<?= e(url('/projets')) ?>">Découvrir les projets <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    </section>

    <section class="jp-section jp-news-catalogue" aria-labelledby="news-list-title">
        <div class="home-shell">
            <div class="jp-news-heading reveal">
                <div><span class="home-eyebrow">Journal JP‑Services</span><h2 id="news-list-title"><?= count($articles) ?> <?= e(jp_tr(count($articles) === 1 ? 'actualité à découvrir' : 'actualités à découvrir', count($articles) === 1 ? 'news item to discover' : 'news items to discover')) ?></h2></div>
                <a class="jp-news-contact" href="<?= e(url('/contact')) ?>"><i class="far fa-message"></i><span><strong>Une question ?</strong><small>Échangez avec notre équipe</small></span><i class="fas fa-arrow-right"></i></a>
            </div>

            <?php if ($newsUnavailable): ?>
                <div class="jp-news-notice reveal" role="status"><i class="fas fa-circle-info"></i><span><strong>Les actualités sont momentanément indisponibles.</strong> Le reste du site reste accessible pendant la remise en service.</span></div>
            <?php endif; ?>

            <?php if ($articles !== []): ?>
            <div class="jp-news-grid">
                <?php foreach ($articles as $index => $article):
                    $articleId = (int)($article['id'] ?? 0);
                    $articleUrl = app_route('/actualite', ['id' => $articleId]);
                    $mediaUrl = jp_news_media_url($article['media'] ?? '');
                ?>
                <article class="jp-news-card <?= $index === 0 ? 'jp-news-card-featured' : '' ?> reveal">
                    <a class="jp-news-card-media" href="<?= e($articleUrl) ?>" tabindex="-1" aria-hidden="true">
                        <?php if ($mediaUrl !== ''): ?>
                            <img src="<?= e($mediaUrl) ?>" alt="" loading="<?= $index === 0 ? 'eager' : 'lazy' ?>" decoding="async" data-fallback-src="<?= e(url('/images/default-news.jpg')) ?>">
                        <?php else: ?>
                            <span><i class="far fa-newspaper"></i></span>
                        <?php endif; ?>
                    </a>
                    <div class="jp-news-card-body">
                        <div class="jp-news-card-meta"><span>Actualité</span><time datetime="<?= e(substr((string)($article['date_publication'] ?? ''), 0, 10)) ?>"><i class="far fa-calendar"></i> <?= e(jp_news_date_label($article['date_publication'] ?? '')) ?></time></div>
                        <h3 data-no-translate><a href="<?= e($articleUrl) ?>"><?= e($article['titre'] ?? '') ?></a></h3>
                        <p data-no-translate><?= e(jp_news_excerpt($article['contenu'] ?? '', $index === 0 ? 260 : 175)) ?></p>
                        <div class="jp-news-card-footer">
                            <a class="jp-card-link" href="<?= e($articleUrl) ?>">Lire la suite <i class="fas fa-arrow-right"></i></a>
                            <button type="button" data-share-url="<?= e($articleUrl) ?>" data-share-title="<?= e($article['titre'] ?? '') ?>" aria-label="Partager"><i class="fas fa-share-nodes"></i></button>
                        </div>
                    </div>
                </article>
                <?php endforeach; ?>
            </div>
            <?php elseif (!$newsUnavailable): ?>
            <div class="jp-news-empty reveal">
                <span><i class="far fa-newspaper"></i></span>
                <h3>Aucune actualité n’a été publiée pour le moment.</h3>
                <p>Revenez bientôt ou consultez les formations et les projets déjà disponibles.</p>
                <div><a class="jp-btn jp-btn-primary" href="<?= e(url('/formations')) ?>">Explorer les formations</a><a class="jp-btn jp-btn-outline" href="<?= e(url('/projets')) ?>">Découvrir les projets</a></div>
            </div>
            <?php endif; ?>
        </div>
    </section>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
