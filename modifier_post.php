<?php
require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';
require_login();

$postId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$postId) {
    redirect('/forum');
}
$stmt = $conn->prepare('SELECT id, titre, contenu FROM posts WHERE id = :id AND auteur_id = :user');
$stmt->execute([':id' => $postId, ':user' => (int)$_SESSION['user_id']]);
$post = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$post) {
    redirect('/forum');
}

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titre = trim((string)($_POST['titre'] ?? ''));
    $contenu = trim((string)($_POST['contenu'] ?? ''));
    if ($titre === '' || $contenu === '') {
        $message = 'Tous les champs sont obligatoires.';
    } elseif (mb_strlen($titre, 'UTF-8') < 5 || mb_strlen($titre, 'UTF-8') > 180 || mb_strlen($contenu, 'UTF-8') < 20 || mb_strlen($contenu, 'UTF-8') > 10000) {
        $message = 'Le titre doit contenir 5 à 180 caractères et le contenu 20 à 10 000 caractères.';
    } else {
        try {
            $update = $conn->prepare('UPDATE posts SET titre = :titre, contenu = :contenu WHERE id = :id AND auteur_id = :user');
            $update->execute([':titre' => $titre, ':contenu' => $contenu, ':id' => $postId, ':user' => (int)$_SESSION['user_id']]);
            $_SESSION['message'] = 'Publication mise à jour.';
            redirect('/forum');
        } catch (Throwable $exception) {
            error_log('Modification publication: ' . $exception->getMessage());
            $message = 'La modification n’a pas pu être enregistrée.';
        }
    }
}
?>
<?php include __DIR__ . '/includes/header.php'; ?>
<main id="main-content" class="home-section jp-editor-page">
    <div class="home-shell jp-editor-shell">
        <div class="jp-editor-card reveal">
            <div class="jp-editor-head">
                <a class="jp-back-link" href="<?= e(url('/forum')) ?>"><i class="fas fa-arrow-left"></i> Retour au forum</a>
                <span class="home-eyebrow"><i class="fas fa-comments"></i> Édition</span>
            </div>
            <h2>Modifier la publication</h2>
            <p>Apportez les corrections souhaitées à votre sujet puis enregistrez les modifications.</p>

            <?php if ($message !== ''): ?>
                <div class="alert alert-danger" role="alert"><i class="fas fa-triangle-exclamation"></i> <?= e($message) ?></div>
            <?php endif; ?>

            <form method="post" action="<?= e(app_route('/publication/modifier', ['id' => $postId])) ?>" class="jp-editor-form">
                <?= csrf_field() ?>
                <div class="jp-field">
                    <label class="form-label" for="titre">Titre de la publication</label>
                    <input class="form-control" id="titre" name="titre" minlength="5" maxlength="180" value="<?= e($_POST['titre'] ?? $post['titre']) ?>" required>
                    <small class="text-muted">Entre 5 et 180 caractères</small>
                </div>
                <div class="jp-field">
                    <label class="form-label" for="contenu">Contenu du message</label>
                    <textarea class="form-control" id="contenu" name="contenu" rows="9" minlength="20" maxlength="10000" required><?= e($_POST['contenu'] ?? $post['contenu']) ?></textarea>
                    <div class="d-flex justify-content-between align-items-center mt-1">
                        <small class="text-muted">Entre 20 et 10 000 caractères</small>
                        <small id="char-counter" class="text-muted">0 / 10 000</small>
                    </div>
                </div>
                <div class="jp-editor-actions">
                    <a class="jp-btn jp-btn-secondary" href="<?= e(app_route('/forum')) ?>"><i class="fas fa-xmark"></i> Annuler</a>
                    <button class="jp-btn jp-btn-primary" type="submit">Enregistrer les modifications <i class="fas fa-check"></i></button>
                </div>
            </form>
        </div>
    </div>
</main>
<script>
document.addEventListener('DOMContentLoaded', function () {
    var textarea = document.getElementById('contenu');
    var counter = document.getElementById('char-counter');
    if (!textarea || !counter) return;
    function updateCount() {
        var count = textarea.value.length;
        counter.textContent = count + ' / 10 000';
    }
    textarea.addEventListener('input', updateCount);
    updateCount();
});
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>
