<?php

declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/connexion_db.php';
require_admin();

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT) ?: filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$id) { redirect('/admin/produits'); }

$stmt = $conn->prepare('SELECT * FROM produits WHERE id = :id LIMIT 1');
$stmt->execute(['id' => $id]);
$produit = $stmt->fetch();
if (!$produit) { redirect('/admin/produits?error=introuvable'); }

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nom = trim((string)($_POST['nom'] ?? ''));
    $description = trim((string)($_POST['description'] ?? ''));
    $prix = filter_var($_POST['prix'] ?? null, FILTER_VALIDATE_FLOAT);
    if (mb_strlen($nom, 'UTF-8') < 2 || mb_strlen($nom, 'UTF-8') > 180 || mb_strlen($description, 'UTF-8') > 10000 || $prix === false || $prix < 0 || $prix > 1000000000) {
        $message = 'Vérifiez le nom et le prix du produit.';
    } else {
        try {
            $image = (string)($produit['image_url'] ?? '');
            $oldImage = $image;
            $newImage = null;
            if (isset($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $newImage = jp_upload_image($_FILES['image'], 'images/produits', 5 * 1024 * 1024);
                $image = $newImage;
            }
            $update = $conn->prepare('UPDATE produits SET nom = :nom, description = :description, prix = :prix, image_url = :image WHERE id = :id');
            $update->execute(['nom'=>$nom,'description'=>$description,'prix'=>$prix,'image'=>$image,'id'=>$id]);
            if ($newImage !== null) jp_safe_delete_media($oldImage);
            redirect('/admin/produits?success=produit_modifie');
        } catch (RuntimeException $exception) {
            if (isset($newImage) && is_string($newImage)) jp_safe_delete_media($newImage);
            $message = $exception->getMessage();
        } catch (Throwable $exception) {
            if (isset($newImage) && is_string($newImage)) jp_safe_delete_media($newImage);
            error_log($exception->getMessage());
            $message = 'La modification a échoué.';
        }
    }
}

$page_title = 'Modifier un produit';
include dirname(__DIR__) . '/includes/header_admin.php';
?>
<div class="container py-4" style="max-width:900px">
    <div class="d-flex justify-content-between align-items-center mb-4"><div><span class="text-primary fw-bold">Catalogue</span><h1 class="h3 mb-0">Modifier le produit</h1></div><a class="btn btn-outline-primary" href="<?= e(url('/admin/produits')) ?>">Retour</a></div>
    <?php if ($message !== ''): ?><div class="alert alert-danger"><?= e($message) ?></div><?php endif; ?>
    <div class="card p-4">
        <form method="post" enctype="multipart/form-data" action="<?= e(url('/admin/produit/modifier')) ?>">
            <input type="hidden" name="id" value="<?= (int)$id ?>">
            <div class="row g-4">
                <div class="col-md-8"><label class="form-label" for="nom">Nom</label><input class="form-control" id="nom" name="nom" minlength="2" maxlength="180" required value="<?= e($produit['nom']) ?>"></div>
                <div class="col-md-4"><label class="form-label" for="prix">Prix</label><input class="form-control" id="prix" type="number" step="0.01" min="0" max="1000000000" name="prix" required value="<?= e($produit['prix']) ?>"></div>
                <div class="col-12"><label class="form-label" for="description">Description</label><textarea class="form-control" id="description" name="description" rows="6" maxlength="10000"><?= e($produit['description']) ?></textarea></div>
                <div class="col-12"><label class="form-label" for="image">Nouvelle image</label><input class="form-control" id="image" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif"></div>
            </div>
            <div class="text-end mt-4"><button class="btn btn-primary" type="submit">Enregistrer les modifications</button></div>
        </form>
    </div>
</div>
<?php include dirname(__DIR__) . '/includes/footer_admin.php'; ?>
