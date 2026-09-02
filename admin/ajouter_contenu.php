<?php

declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/connexion_db.php';
require_admin();

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titre = trim((string)($_POST['titre'] ?? ''));
    $contenu = trim((string)($_POST['contenu'] ?? ''));
    if (mb_strlen($titre, 'UTF-8') < 5 || mb_strlen($titre, 'UTF-8') > 180 || mb_strlen($contenu, 'UTF-8') < 20 || mb_strlen($contenu, 'UTF-8') > 10000) {
        $message = 'Le titre doit contenir 5 à 180 caractères et le contenu 20 à 10 000 caractères.';
    } else {
        $stmt = $conn->prepare('INSERT INTO posts (titre, contenu, auteur_id) VALUES (:titre, :contenu, :auteur_id)');
        $stmt->execute(['titre'=>$titre,'contenu'=>$contenu,'auteur_id'=>(int)$_SESSION['user_id']]);
        redirect('/admin/contenus');
    }
}

$page_title = 'Ajouter une publication';
include dirname(__DIR__) . '/includes/header_admin.php';
?>
<div class="container py-4" style="max-width:900px">
    <div class="d-flex justify-content-between align-items-center mb-4"><div><span class="text-primary fw-bold">Communauté</span><h1 class="h3 mb-0">Nouvelle publication</h1></div><a class="btn btn-outline-primary" href="<?= e(url('/admin/contenus')) ?>">Retour</a></div>
    <?php if ($message !== ''): ?><div class="alert alert-danger"><?= e($message) ?></div><?php endif; ?>
    <div class="card p-4"><form method="post" action="<?= e(url('/admin/contenu/ajouter')) ?>"><label class="form-label" for="titre">Titre</label><input class="form-control mb-4" id="titre" name="titre" minlength="5" maxlength="180" required value="<?= e($_POST['titre'] ?? '') ?>"><label class="form-label" for="contenu">Contenu</label><textarea class="form-control mb-4" id="contenu" name="contenu" rows="10" minlength="20" maxlength="10000" required><?= e($_POST['contenu'] ?? '') ?></textarea><div class="text-end"><button class="btn btn-primary" type="submit">Publier</button></div></form></div>
</div>
<?php include dirname(__DIR__) . '/includes/footer_admin.php'; ?>
