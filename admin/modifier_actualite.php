<?php

declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/connexion_db.php';
require_admin();

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT) ?: filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$id) { redirect('/admin/actualites'); }
$column = jp_actualite_media_column($conn);
$stmt = $conn->prepare("SELECT id, titre, contenu, {$column} AS media FROM actualites WHERE id = :id LIMIT 1");
$stmt->execute(['id'=>$id]);
$actualite = $stmt->fetch();
if (!$actualite) { redirect('/admin/actualites?error=introuvable'); }

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titre = trim((string)($_POST['titre'] ?? ''));
    $contenu = trim((string)($_POST['description'] ?? ''));
    if (mb_strlen($titre, 'UTF-8') < 5 || mb_strlen($titre, 'UTF-8') > 180 || mb_strlen($contenu, 'UTF-8') < 20 || mb_strlen($contenu, 'UTF-8') > 30000) {
        $message = 'Le titre doit contenir 5 à 180 caractères et le contenu 20 à 30 000 caractères.';
    } else {
        try {
            $media = (string)($actualite['media'] ?? '');
            $oldMedia = $media;
            $newMedia = null;
            if (isset($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $newMedia = jp_upload_image($_FILES['image'], 'uploads/actualites', 8 * 1024 * 1024);
                $media = $newMedia;
            }
            $update = $conn->prepare("UPDATE actualites SET titre = :titre, contenu = :contenu, {$column} = :media WHERE id = :id");
            $update->execute(['titre'=>$titre,'contenu'=>$contenu,'media'=>$media,'id'=>$id]);
            if ($newMedia !== null) {
                jp_safe_delete_media($oldMedia);
            }
            redirect('/admin/actualites?success=updated');
        } catch (RuntimeException $exception) {
            if (isset($newMedia) && is_string($newMedia)) {
                jp_safe_delete_media($newMedia);
            }
            $message = $exception->getMessage();
        } catch (Throwable $exception) {
            if (isset($newMedia) && is_string($newMedia)) {
                jp_safe_delete_media($newMedia);
            }
            error_log($exception->getMessage());
            $message = 'La modification a échoué.';
        }
    }
}
$page_title = 'Modifier une actualité';
include dirname(__DIR__) . '/includes/header_admin.php';
?>
<div class="container py-4" style="max-width:920px">
    <div class="d-flex justify-content-between align-items-center mb-4"><div><span class="text-primary fw-bold">Communication</span><h1 class="h3 mb-0">Modifier l’actualité</h1></div><a class="btn btn-outline-primary" href="<?= e(url('/admin/actualites')) ?>">Retour</a></div>
    <?php if ($message !== ''): ?><div class="alert alert-danger"><?= e($message) ?></div><?php endif; ?>
    <div class="card p-4"><form method="post" enctype="multipart/form-data" action="<?= e(url('/admin/actualite/modifier')) ?>"><input type="hidden" name="id" value="<?= (int)$id ?>"><label class="form-label" for="titre">Titre</label><input class="form-control mb-4" id="titre" name="titre" minlength="5" maxlength="180" required value="<?= e($actualite['titre']) ?>"><label class="form-label" for="description">Contenu</label><textarea class="form-control mb-4" id="description" name="description" rows="10" minlength="20" maxlength="30000" required><?= e($actualite['contenu']) ?></textarea><label class="form-label" for="image">Remplacer l’image</label><input class="form-control mb-4" id="image" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif"><div class="text-end"><button class="btn btn-primary" type="submit">Enregistrer</button></div></form></div>
</div>
<?php include dirname(__DIR__) . '/includes/footer_admin.php'; ?>
