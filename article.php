<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';

$articleId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$articleId) {
    redirect('/actualites');
}

try {
    $mediaColumn = jp_actualite_media_column($conn);
    $stmt = $conn->prepare("SELECT titre, contenu, date_publication, {$mediaColumn} AS media FROM actualites WHERE id = :id LIMIT 1");
    $stmt->execute(['id' => $articleId]);
    $article = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Lecture actualite: ' . $exception->getMessage());
    $article = false;
}

if (!$article) {
    redirect('/actualites');
}

$plainContent = trim(preg_replace('/\s+/u', ' ', strip_tags((string)$article['contenu'])) ?? '');
$words = preg_split('/\s+/u', $plainContent, -1, PREG_SPLIT_NO_EMPTY) ?: [];
$readTime = max(1, (int)ceil(count($words) / 210));
$media = trim((string)($article['media'] ?? ''));
$mediaUrl = $media === '' ? '' : (preg_match('~^https?://~i', $media) ? $media : url('/' . ltrim($media, '/')));
try {
    $publishedAt = new DateTimeImmutable((string)($article['date_publication'] ?? 'now'));
} catch (Throwable $exception) {
    $publishedAt = new DateTimeImmutable('now');
}

include __DIR__ . '/includes/header.php';
?>

<div class="jp-reading-progress" data-reading-progress aria-hidden="true"></div>

<main class="jp-article-page" id="main-content">
    <article class="jp-article-shell">
        <header class="jp-article-header reveal">
            <a class="jp-article-back" href="<?= e(url('/actualites')) ?>"><i class="fas fa-arrow-left"></i> Toutes les actualités</a>
            <span class="jp-eyebrow">Actualité JP-Services</span>
            <h1><?= e($article['titre']) ?></h1>
            <div class="jp-article-meta">
                <img src="<?= e(url('/images/logo2.png')) ?>" alt="JP-Services" width="48" height="48">
                <div><strong>Équipe éditoriale JP-Services</strong><span><?= e($publishedAt->format('d/m/Y')) ?> · <?= $readTime ?> min de lecture</span></div>
                <button class="jp-icon-btn" type="button" data-share-url="<?= e(app_route('/actualite', ['id' => $articleId])) ?>" data-share-title="<?= e($article['titre']) ?>" aria-label="Partager l’article"><i class="fas fa-share-nodes"></i></button>
                <button class="jp-icon-btn" type="button" data-print-page aria-label="Imprimer l’article"><i class="fas fa-print"></i></button>
            </div>
        </header>

        <?php if ($mediaUrl !== ''): ?>
            <figure class="jp-article-media reveal"><img src="<?= e($mediaUrl) ?>" alt="<?= e($article['titre']) ?>" loading="eager" decoding="async"></figure>
        <?php endif; ?>

        <div class="jp-article-content reveal"><?= nl2br(e($article['contenu'])) ?></div>

        <aside class="jp-article-note reveal">
            <i class="fas fa-circle-check" aria-hidden="true"></i>
            <div><strong>Une information publiée par JP-Services</strong><p>Nos contenus sont préparés pour vous informer clairement sur nos activités, formations et opportunités.</p></div>
        </aside>

        <footer class="jp-article-footer reveal">
            <a class="jp-btn jp-btn-primary" href="<?= e(url('/actualites')) ?>">Découvrir les autres actualités <i class="fas fa-arrow-right"></i></a>
        </footer>
    </article>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
