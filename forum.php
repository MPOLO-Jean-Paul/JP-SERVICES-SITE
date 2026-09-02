<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';

$userId = (int)($_SESSION['user_id'] ?? 0);
$posts = [];
$error = '';
try {
    $statement = $conn->prepare(
        'SELECT p.id, p.titre, p.contenu, p.date_publication, p.auteur_id,
                u.nom AS auteur_nom, u.prenom AS auteur_prenom, u.photo_profil,
                (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS total_likes,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS total_comments,
                EXISTS(SELECT 1 FROM likes ml WHERE ml.post_id = p.id AND ml.user_id = :user_id) AS liked_by_user
         FROM posts p
         JOIN users u ON u.id = p.auteur_id
         ORDER BY p.date_publication DESC, p.id DESC'
    );
    $statement->execute(['user_id' => $userId]);
    $posts = $statement->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Forum : ' . $exception->getMessage());
    $error = 'Les discussions sont momentanément indisponibles.';
}
$flash = (string)($_SESSION['message'] ?? '');
unset($_SESSION['message']);

include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-forum-page">
    <section class="jp-member-hero">
        <div class="home-shell jp-member-hero-inner">
            <div class="jp-member-hero-text">
                <span class="home-eyebrow"><i class="fas fa-comments"></i> Communauté d’entraide</span>
                <h2>Un espace pour demander, partager et progresser ensemble.</h2>
                <p><?= count($posts) ?> publication<?= count($posts) > 1 ? 's' : '' ?> disponible<?= count($posts) > 1 ? 's' : '' ?> pour échanger conseils, projets et questions numériques.</p>
                <div class="jp-forum-hero-actions">
                    <?php if ($userId): ?>
                        <a class="jp-btn jp-btn-primary" href="<?= e(url('/publication/ajouter')) ?>"><i class="fas fa-plus"></i> Nouvelle publication</a>
                    <?php else: ?>
                        <a class="jp-btn jp-btn-primary" href="<?= e(url('/connexion?redirect_to=/forum')) ?>"><i class="fas fa-arrow-right-to-bracket"></i> Se connecter pour participer</a>
                    <?php endif; ?>
                </div>
            </div>
            <div class="jp-hero-illustration" aria-hidden="true">
                <img src="<?= e(url('/images/hero-forum.jpg')) ?>" alt="">
            </div>
        </div>
    </section>

    <section class="home-section">
        <div class="home-shell jp-forum-shell">
            <?php if ($flash !== ''): ?>
                <div class="alert alert-success" role="status"><i class="fas fa-circle-check"></i> <?= e($flash) ?></div>
            <?php endif; ?>
            <?php if (isset($_GET['deleted'])): ?>
                <div class="alert alert-success" role="status"><i class="fas fa-circle-check"></i> La publication a été supprimée avec succès.</div>
            <?php endif; ?>
            <?php if ($error !== ''): ?>
                <div class="alert alert-danger" role="alert"><i class="fas fa-triangle-exclamation"></i> <?= e($error) ?></div>
            <?php elseif (!$posts): ?>
                <div class="jp-empty-state">
                    <i class="far fa-comments"></i>
                    <h3>La première discussion peut commencer</h3>
                    <p>Posez une question technique, présentez votre projet ou partagez une ressource utile.</p>
                    <?php if ($userId): ?>
                        <a class="jp-btn jp-btn-primary mt-3" href="<?= e(url('/publication/ajouter')) ?>"><i class="fas fa-plus"></i> Créer la première publication</a>
                    <?php endif; ?>
                </div>
            <?php else: ?>
                <div class="jp-forum-toolbar">
                    <div class="jp-forum-search-wrap">
                        <div class="jp-forum-search-box">
                            <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
                            <input type="search" id="forum-search-input" placeholder="Rechercher par mot-clé, titre, sujet ou auteur…" aria-label="Rechercher une discussion" autocomplete="off">
                            <button type="button" class="jp-search-clear-btn" id="forum-search-clear" aria-label="Effacer la recherche" hidden><i class="fas fa-xmark"></i></button>
                        </div>
                        <div class="jp-forum-filters" role="tablist" aria-label="Filtrer les publications">
                            <button type="button" class="jp-filter-chip is-active" data-filter="all" role="tab" aria-selected="true"><i class="fas fa-layer-group"></i> Tous</button>
                            <button type="button" class="jp-filter-chip" data-filter="popular" role="tab" aria-selected="false"><i class="fas fa-fire"></i> Populaires</button>
                            <button type="button" class="jp-filter-chip" data-filter="discussed" role="tab" aria-selected="false"><i class="fas fa-comments"></i> Plus commentés</button>
                        </div>
                    </div>
                    <div class="jp-forum-toolbar-side">
                        <span class="jp-forum-count" id="forum-count-badge">
                            <i class="fas fa-sparkles"></i>
                            <span id="forum-count-text"><strong><?= count($posts) ?></strong> sujet<?= count($posts) > 1 ? 's' : '' ?></span>
                        </span>
                        <?php if ($userId): ?>
                            <a class="jp-btn jp-btn-primary jp-btn-sm jp-forum-quick-add" href="<?= e(url('/publication/ajouter')) ?>"><i class="fas fa-plus"></i> Nouveau sujet</a>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="jp-forum-list" id="forum-post-list">
                    <?php foreach ($posts as $post):
                        $avatar = trim((string)($post['photo_profil'] ?? '')) ?: 'images/default-avatar.svg';
                        $authorFullName = $post['auteur_prenom'] . ' ' . $post['auteur_nom'];
                        $postDate = date('d/m/Y à H:i', strtotime((string)$post['date_publication']));
                        $totalLikes = (int)$post['total_likes'];
                        $totalComments = (int)$post['total_comments'];
                        $likedByUser = !empty($post['liked_by_user']);
                    ?>
                        <article class="jp-forum-post reveal" 
                            data-forum-item="<?= e(mb_strtolower($post['titre'] . ' ' . $post['contenu'] . ' ' . $authorFullName)) ?>"
                            data-likes="<?= $totalLikes ?>"
                            data-comments="<?= $totalComments ?>"
                            data-id="<?= (int)$post['id'] ?>">
                            <header class="jp-forum-author">
                                <div class="jp-forum-avatar-wrap">
                                    <img src="<?= e(url('/' . ltrim($avatar, '/'))) ?>" data-fallback-src="<?= e(url('/images/default-avatar.svg')) ?>" alt="<?= e($authorFullName) ?>">
                                </div>
                                <div class="jp-forum-author-info">
                                    <div class="jp-forum-author-top">
                                        <strong class="jp-forum-author-name"><?= e($authorFullName) ?></strong>
                                        <span class="jp-forum-tag"><i class="fas fa-hashtag"></i> Discussion</span>
                                    </div>
                                    <time datetime="<?= e(date(DATE_ATOM, strtotime((string)$post['date_publication']))) ?>">
                                        <i class="far fa-clock"></i> <?= e($postDate) ?>
                                    </time>
                                </div>
                                <?php if ((int)$post['auteur_id'] === $userId): ?>
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

                            <a class="jp-forum-content" href="<?= e(url('/commentaires')) ?>?post_id=<?= (int)$post['id'] ?>">
                                <h3><?= e($post['titre']) ?></h3>
                                <p><?= nl2br(e(mb_strimwidth((string)$post['contenu'], 0, 480, '…', 'UTF-8'))) ?></p>
                                <span class="jp-forum-read-more">Lire la suite <i class="fas fa-arrow-right"></i></span>
                            </a>

                            <footer class="jp-forum-metrics">
                                <?php if ($userId): ?>
                                    <form method="post" action="<?= e(url('/publication/aimer')) ?>" class="jp-forum-like-form" data-ajax-like="true">
                                        <?= csrf_field() ?>
                                        <input type="hidden" name="post_id" value="<?= (int)$post['id'] ?>">
                                        <button type="submit" class="jp-metric-btn jp-metric-like <?= $likedByUser ? 'is-active' : '' ?>" aria-pressed="<?= $likedByUser ? 'true' : 'false' ?>" data-like-btn>
                                            <i class="<?= $likedByUser ? 'fas' : 'far' ?> fa-heart"></i>
                                            <span data-like-label><?= $totalLikes ?> appréciation<?= $totalLikes > 1 ? 's' : '' ?></span>
                                        </button>
                                    </form>
                                <?php else: ?>
                                    <a href="<?= e(url('/connexion?redirect_to=/forum')) ?>" class="jp-metric-btn jp-metric-like">
                                        <i class="far fa-heart"></i>
                                        <span><?= $totalLikes ?> appréciation<?= $totalLikes > 1 ? 's' : '' ?></span>
                                    </a>
                                <?php endif; ?>

                                <a href="<?= e(url('/commentaires')) ?>?post_id=<?= (int)$post['id'] ?>#reponses" class="jp-metric-btn jp-metric-reply">
                                    <i class="far fa-comment-dots"></i>
                                    <span><?= $totalComments ?> réponse<?= $totalComments > 1 ? 's' : '' ?></span>
                                    <i class="fas fa-arrow-right jp-metric-arrow" aria-hidden="true"></i>
                                </a>
                            </footer>
                        </article>
                    <?php endforeach; ?>
                </div>

                <div id="forum-no-results" class="jp-empty-state" hidden>
                    <i class="fas fa-magnifying-glass"></i>
                    <h3>Aucune publication trouvée</h3>
                    <p>Aucun sujet ne correspond à votre recherche ou filtre. Essayez d’autres termes.</p>
                </div>
            <?php endif; ?>
        </div>
    </section>
</main>
<script>
document.addEventListener('DOMContentLoaded', function () {
    var searchInput = document.getElementById('forum-search-input');
    var clearBtn = document.getElementById('forum-search-clear');
    var postList = document.getElementById('forum-post-list');
    var noResults = document.getElementById('forum-no-results');
    var countText = document.getElementById('forum-count-text');
    var filterChips = document.querySelectorAll('.jp-filter-chip');

    if (postList) {
        var items = Array.from(postList.querySelectorAll('.jp-forum-post'));
        var currentFilter = 'all';

        function updateList() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            if (clearBtn) {
                clearBtn.hidden = query === '';
            }

            var visibleItems = [];

            items.forEach(function (item) {
                var text = item.getAttribute('data-forum-item') || '';
                var likes = parseInt(item.getAttribute('data-likes') || '0', 10);
                var comments = parseInt(item.getAttribute('data-comments') || '0', 10);

                var matchQuery = query === '' || text.indexOf(query) !== -1;
                var matchFilter = true;

                if (currentFilter === 'popular') {
                    matchFilter = likes > 0;
                } else if (currentFilter === 'discussed') {
                    matchFilter = comments > 0;
                }

                var isVisible = matchQuery && matchFilter;
                item.hidden = !isVisible;
                if (isVisible) {
                    visibleItems.push(item);
                }
            });

            // Re-order if filtered by popular or discussed
            if (currentFilter === 'popular') {
                visibleItems.sort(function (a, b) {
                    return parseInt(b.getAttribute('data-likes') || '0', 10) - parseInt(a.getAttribute('data-likes') || '0', 10);
                }).forEach(function (el) { postList.appendChild(el); });
            } else if (currentFilter === 'discussed') {
                visibleItems.sort(function (a, b) {
                    return parseInt(b.getAttribute('data-comments') || '0', 10) - parseInt(a.getAttribute('data-comments') || '0', 10);
                }).forEach(function (el) { postList.appendChild(el); });
            }

            var count = visibleItems.length;
            if (noResults) noResults.hidden = count > 0;
            if (countText) {
                countText.innerHTML = '<strong>' + count + '</strong> sujet' + (count > 1 ? 's' : '');
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', updateList);
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                searchInput.value = '';
                searchInput.focus();
                updateList();
            });
        }

        filterChips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                filterChips.forEach(function (c) {
                    c.classList.remove('is-active');
                    c.setAttribute('aria-selected', 'false');
                });
                chip.classList.add('is-active');
                chip.setAttribute('aria-selected', 'true');
                currentFilter = chip.getAttribute('data-filter') || 'all';
                updateList();
            });
        });

        // AJAX Like Support
        document.querySelectorAll('.jp-forum-like-form[data-ajax-like="true"]').forEach(function (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var btn = form.querySelector('[data-like-btn]');
                var label = form.querySelector('[data-like-label]');
                var icon = btn ? btn.querySelector('i') : null;
                var article = form.closest('.jp-forum-post');
                var formData = new FormData(form);

                if (btn) btn.disabled = true;

                fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    }
                })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data && data.success) {
                        if (btn) {
                            btn.classList.toggle('is-active', data.liked);
                            btn.setAttribute('aria-pressed', data.liked ? 'true' : 'false');
                        }
                        if (icon) {
                            icon.className = (data.liked ? 'fas' : 'far') + ' fa-heart';
                        }
                        if (label && data.label) {
                            label.textContent = data.label;
                        }
                        if (article && typeof data.total_likes !== 'undefined') {
                            article.setAttribute('data-likes', data.total_likes);
                        }
                    }
                })
                .catch(function (err) {
                    // Fallback to normal submit on network error
                    form.submit();
                })
                .finally(function () {
                    if (btn) btn.disabled = false;
                });
            });
        });
    }
});
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>

