<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';
require_login();

$postId = filter_input(INPUT_GET, 'post_id', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if (!$postId) {
    redirect('/forum');
}

$postStatement = $conn->prepare(
    'SELECT p.id, p.titre, p.contenu, p.date_publication, p.auteur_id, u.nom, u.prenom, u.photo_profil
     FROM posts p
     JOIN users u ON u.id = p.auteur_id
     WHERE p.id = :id
     LIMIT 1'
);
$postStatement->execute(['id' => $postId]);
$post = $postStatement->fetch(PDO::FETCH_ASSOC);

if (!$post) {
    jp_abort(404, 'Cette publication est introuvable ou n’est plus disponible.');
}

$message = '';
$messageType = '';
$content = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $content = trim((string)($_POST['contenu'] ?? ''));
    $length = mb_strlen($content, 'UTF-8');
    $rateKey = 'comment:' . (int)$_SESSION['user_id'] . ':' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');

    if ($length < 2) {
        $message = 'Votre commentaire est trop court.';
        $messageType = 'danger';
    } elseif ($length > 3000) {
        $message = 'Votre commentaire ne peut pas dépasser 3 000 caractères.';
        $messageType = 'danger';
    } elseif (!jp_rate_limit($rateKey, 12, 600)) {
        $message = 'Vous publiez trop rapidement. Patientez quelques minutes avant de recommencer.';
        $messageType = 'danger';
    } else {
        try {
            $insert = $conn->prepare('INSERT INTO comments (post_id, user_id, contenu) VALUES (:post_id, :user_id, :contenu)');
            $insert->execute([
                'post_id' => $postId,
                'user_id' => (int)$_SESSION['user_id'],
                'contenu' => $content,
            ]);
            $_SESSION['comment_flash'] = 'Votre réponse a été publiée.';
            redirect('/commentaires?post_id=' . $postId . '#reponses');
        } catch (Throwable $exception) {
            error_log('Publication commentaire : ' . $exception->getMessage());
            $message = 'La réponse n’a pas pu être publiée. Veuillez réessayer.';
            $messageType = 'danger';
        }
    }
}

if (!empty($_SESSION['comment_flash'])) {
    $message = (string)$_SESSION['comment_flash'];
    $messageType = 'success';
    unset($_SESSION['comment_flash']);
}

$commentsStatement = $conn->prepare(
    'SELECT c.id, c.contenu, c.date_commentaire, c.user_id, u.nom, u.prenom, u.photo_profil
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.post_id = :post_id
     ORDER BY c.date_commentaire ASC, c.id ASC'
);
$commentsStatement->execute(['post_id' => $postId]);
$comments = $commentsStatement->fetchAll(PDO::FETCH_ASSOC);

$currentUserId = (int)($_SESSION['user_id'] ?? 0);
$postAvatar = trim((string)($post['photo_profil'] ?? '')) ?: 'images/default-avatar.svg';

include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-community-page">
    <section class="jp-community-hero">
        <div class="home-shell jp-community-hero-inner">
            <div class="jp-community-hero-head">
                <a class="jp-back-link" href="<?= e(url('/forum')) ?>"><i class="fas fa-arrow-left"></i> Retour au forum</a>
                <span class="home-eyebrow"><i class="fas fa-comments"></i> Discussion d’entraide</span>
            </div>
            <h2><?= e($post['titre']) ?></h2>
            <div class="jp-community-meta-bar">
                <span class="jp-meta-item"><i class="fas fa-user-circle"></i> <?= e($post['prenom'] . ' ' . $post['nom']) ?></span>
                <span class="jp-meta-item"><i class="fas fa-calendar-day"></i> <?= e(date('d/m/Y à H:i', strtotime((string)$post['date_publication']))) ?></span>
                <span class="jp-meta-item"><i class="fas fa-comment-dots"></i> <?= count($comments) ?> réponse<?= count($comments) > 1 ? 's' : '' ?></span>
            </div>
        </div>
    </section>

    <section class="home-section jp-community-content">
        <div class="home-shell jp-community-layout">
            <div class="jp-discussion-column">
                <article class="jp-thread-origin">
                    <header class="jp-thread-origin-head">
                        <div class="jp-thread-origin-author">
                            <img src="<?= e(url('/' . ltrim($postAvatar, '/'))) ?>" data-fallback-src="<?= e(url('/images/default-avatar.svg')) ?>" alt="" class="jp-comment-avatar">
                            <div>
                                <strong><?= e($post['prenom'] . ' ' . $post['nom']) ?></strong>
                                <span class="jp-thread-badge"><i class="fas fa-feather-pointed"></i> Auteur du sujet</span>
                            </div>
                        </div>
                        <?php if ((int)$post['auteur_id'] === $currentUserId): ?>
                            <div class="jp-forum-owner-actions">
                                <a class="jp-icon-button" href="<?= e(app_route('/publication/modifier', ['id' => (int)$post['id']])) ?>" aria-label="Modifier la publication" title="Modifier"><i class="fas fa-pen"></i></a>
                                <form action="<?= e(url('/publication/supprimer')) ?>" method="post" data-confirm="Supprimer définitivement cette publication ?">
                                    <?= csrf_field() ?>
                                    <input type="hidden" name="id" value="<?= (int)$post['id'] ?>">
                                    <button class="jp-icon-button jp-icon-danger" type="submit" aria-label="Supprimer la publication" title="Supprimer"><i class="fas fa-trash"></i></button>
                                </form>
                            </div>
                        <?php endif; ?>
                    </header>
                    <div class="jp-thread-origin-body">
                        <p><?= nl2br(e($post['contenu'])) ?></p>
                    </div>
                </article>

                <div class="jp-section-heading" id="reponses">
                    <div>
                        <span class="jp-kicker-label">Échanges communautaires</span>
                        <h3><?= count($comments) ?> réponse<?= count($comments) > 1 ? 's' : '' ?></h3>
                    </div>
                    <a href="#composer" class="jp-btn jp-btn-secondary jp-btn-sm d-none d-md-inline-flex"><i class="fas fa-reply"></i> Répondre</a>
                </div>

                <?php if ($comments): ?>
                    <div class="jp-comment-list">
                        <?php foreach ($comments as $index => $comment):
                            $avatar = trim((string)($comment['photo_profil'] ?? '')) ?: 'images/default-avatar.svg';
                            $isAuthor = (int)$comment['user_id'] === (int)$post['auteur_id'];
                        ?>
                            <article class="jp-comment-card reveal <?= $isAuthor ? 'is-author' : '' ?>" id="comment-<?= (int)$comment['id'] ?>">
                                <img src="<?= e(url('/' . ltrim($avatar, '/'))) ?>" data-fallback-src="<?= e(url('/images/default-avatar.svg')) ?>" alt="" class="jp-comment-avatar">
                                <div class="jp-comment-body">
                                    <header>
                                        <div>
                                            <strong><?= e($comment['prenom'] . ' ' . $comment['nom']) ?></strong>
                                            <?php if ($isAuthor): ?><span class="jp-author-badge">Auteur</span><?php endif; ?>
                                        </div>
                                        <span>#<?= $index + 1 ?> · <?= e(date('d/m/Y à H:i', strtotime((string)$comment['date_commentaire']))) ?></span>
                                    </header>
                                    <div class="jp-comment-text">
                                        <p><?= nl2br(e($comment['contenu'])) ?></p>
                                    </div>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <div class="jp-empty-state">
                        <i class="far fa-message"></i>
                        <h3>Soyez le premier à répondre</h3>
                        <p>Partagez un conseil, une réponse ou un retour d'expérience pour aider la communauté.</p>
                    </div>
                <?php endif; ?>
            </div>

            <aside class="jp-reply-card" id="composer">
                <span class="jp-thread-label"><i class="fas fa-pen"></i> Votre réponse</span>
                <h3>Contribuer à l’échange</h3>
                <p>Restez précis, bienveillant et utile aux autres membres.</p>
                <?php if ($message !== ''): ?><div class="alert alert-<?= e($messageType) ?>" role="status"><?= e($message) ?></div><?php endif; ?>
                <form method="post" action="<?= e(url('/commentaires')) ?>?post_id=<?= (int)$postId ?>">
                    <?= csrf_field() ?>
                    <div class="jp-field">
                        <label class="form-label" for="contenu">Votre message</label>
                        <textarea class="form-control" id="contenu" name="contenu" rows="6" minlength="2" maxlength="3000" placeholder="Écrivez votre réponse ici…" required><?= e($content) ?></textarea>
                    </div>
                    <div class="jp-form-foot">
                        <small id="char-count">3 000 caractères max</small>
                        <button class="jp-btn jp-btn-primary" type="submit">Publier ma réponse <i class="fas fa-paper-plane"></i></button>
                    </div>
                </form>
            </aside>
        </div>
    </section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
