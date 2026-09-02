<?php

declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/connexion_db.php';
require_admin();

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titre = trim((string)($_POST['titre'] ?? ''));
    $contenu = trim((string)($_POST['description'] ?? ''));
    if (mb_strlen($titre, 'UTF-8') < 5 || mb_strlen($titre, 'UTF-8') > 180 || mb_strlen($contenu, 'UTF-8') < 20 || mb_strlen($contenu, 'UTF-8') > 30000) {
        $message = 'Le titre doit contenir 5 à 180 caractères et le contenu 20 à 30 000 caractères.';
    } else {
        $media = '';
        try {
            if (isset($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $media = jp_upload_image($_FILES['image'], 'uploads/actualites', 8 * 1024 * 1024);
            }
            $column = jp_actualite_media_column($conn);
            $stmt = $conn->prepare("INSERT INTO actualites (titre, contenu, {$column}, date_publication) VALUES (:titre, :contenu, :media, NOW())");
            $stmt->execute(['titre'=>$titre,'contenu'=>$contenu,'media'=>$media]);
            redirect('/admin/actualites?success=published');
        } catch (RuntimeException $exception) {
            if ($media !== '') {
                jp_safe_delete_media($media);
            }
            $message = $exception->getMessage();
        } catch (Throwable $exception) {
            if ($media !== '') {
                jp_safe_delete_media($media);
            }
            error_log($exception->getMessage());
            $message = 'La publication a échoué.';
        }
    }
}
$page_title = 'Publier une actualité';
include dirname(__DIR__) . '/includes/header_admin.php';
?>
<div class="container py-4" style="max-width:920px">
    <div class="d-flex justify-content-between align-items-center mb-4"><div><span class="text-primary fw-bold">Communication</span><h1 class="h3 mb-0">Nouvelle actualité</h1></div><a class="btn btn-outline-primary" href="<?= e(url('/admin/actualites')) ?>">Retour</a></div>
    <?php if ($message !== ''): ?><div class="alert alert-danger"><?= e($message) ?></div><?php endif; ?>
    <div class="card p-4"><form method="post" enctype="multipart/form-data" action="<?= e(url('/admin/actualite/publier')) ?>"><label class="form-label" for="titre">Titre</label><input class="form-control mb-4" id="titre" name="titre" minlength="5" maxlength="180" required value="<?= e($_POST['titre'] ?? '') ?>"><label class="form-label" for="description">Contenu</label><textarea class="form-control mb-4" id="description" name="description" rows="10" minlength="20" maxlength="30000" required><?= e($_POST['description'] ?? '') ?></textarea><label class="form-label" for="image">Image</label><input class="form-control mb-4" id="image" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif"><div class="text-end"><button class="btn btn-primary" type="submit">Publier l’actualité</button></div></form></div>
</div>
<?php include dirname(__DIR__) . '/includes/footer_admin.php'; ?>
