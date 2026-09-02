<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';
require_once dirname(__DIR__) . '/app/logiciel_helpers.php';
require_admin();
require_once '../includes/connexion_db.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT) ?: filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    redirect('/admin/logiciels');
}

$stmt = $conn->prepare('SELECT * FROM logiciels WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $id]);
$logiciel = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$logiciel) {
    redirect('/admin/logiciels');
}

$message = '';
$status = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nom = trim((string)($_POST['nom'] ?? ''));
    $description = trim((string)($_POST['description'] ?? ''));
    $version = trim((string)($_POST['version'] ?? ''));
    $plateforme = trim((string)($_POST['plateforme'] ?? ''));
    $licence = trim((string)($_POST['licence'] ?? '')) ?: 'Gratuit';
    $lienExterne = trim((string)($_POST['lien_externe'] ?? ''));
    $categorieId = filter_input(INPUT_POST, 'categorie_id', FILTER_VALIDATE_INT) ?: null;
    $fichierPath = (string)$logiciel['fichier'];
    $imagePath = (string)$logiciel['image'];
    $taille = (int)$logiciel['taille_octets'];
    $newFile = '';
    $newImage = '';

    if (isset($_FILES['fichier']) && ($_FILES['fichier']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        try {
            $newFile = jp_upload_software($_FILES['fichier']);
            $fichierPath = $newFile;
            $taille = (int)$_FILES['fichier']['size'];
        } catch (RuntimeException $exception) {
            $message = $exception->getMessage();
            $status = 'danger';
        }
    }
    if ($message === '' && isset($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        try {
            $newImage = jp_upload_image($_FILES['image'], 'images/logiciels', 4 * 1024 * 1024);
            $imagePath = $newImage;
        } catch (RuntimeException $exception) {
            $message = $exception->getMessage();
            $status = 'danger';
        }
    }
    if ($message === '' && $lienExterne !== '' && (!filter_var($lienExterne, FILTER_VALIDATE_URL) || !preg_match('~^https?://~i', $lienExterne))) {
        $message = 'Le lien externe doit être une URL valide.';
        $status = 'warning';
    }
    if ($message === '' && $fichierPath === '' && $lienExterne === '') {
        $message = 'Un fichier ou un lien externe est nécessaire.';
        $status = 'warning';
    }
    if ($message === '' && (mb_strlen($nom, 'UTF-8') < 2 || mb_strlen($nom, 'UTF-8') > 180 || mb_strlen($description, 'UTF-8') > 10000)) {
        $message = 'Vérifiez le nom et la description.';
        $status = 'warning';
    }
    if ($message === '') {
        try {
            $stmt = $conn->prepare('UPDATE logiciels SET categorie_id = :cat, nom = :nom, description = :description, version = :version, taille_octets = :taille, plateforme = :plateforme, licence = :licence, fichier = :fichier, lien_externe = :lien, image = :image WHERE id = :id');
            $stmt->execute([
                ':cat' => $categorieId,
                ':nom' => $nom,
                ':description' => $description,
                ':version' => $version,
                ':taille' => $taille,
                ':plateforme' => $plateforme,
                ':licence' => $licence,
                ':fichier' => $fichierPath,
                ':lien' => $lienExterne,
                ':image' => $imagePath,
                ':id' => $id,
            ]);
            if ($newFile !== '' && $newFile !== (string)$logiciel['fichier']) {
                jp_delete_software_file((string)$logiciel['fichier']);
            }
            if ($newImage !== '' && $newImage !== (string)$logiciel['image']) {
                jp_safe_delete_media((string)$logiciel['image'], ['images/logiciels']);
            }
            redirect('/admin/logiciels?success=1');
        } catch (Throwable $exception) {
            jp_delete_software_file($newFile);
            jp_safe_delete_media($newImage !== '' ? $newImage : null, ['images/logiciels']);
            error_log('Modification logiciel: ' . $exception->getMessage());
            $message = 'La modification n’a pas pu être enregistrée.';
            $status = 'danger';
        }
    } else {
        jp_delete_software_file($newFile);
        jp_safe_delete_media($newImage !== '' ? $newImage : null, ['images/logiciels']);
    }
}

$categories = $conn->query('SELECT * FROM logiciel_categories ORDER BY ordre ASC, nom ASC')->fetchAll(PDO::FETCH_ASSOC);

$page_title = 'Modifier un logiciel';
include '../includes/header_admin.php';
?>
<style>
    .jp-admin-card { background: var(--jp-panel, #fff); border: 1px solid var(--jp-classroom-line, #e5e0ef); border-radius: 12px; padding: 22px; max-width: 760px; }
    .jp-admin-form label { display: block; margin-bottom: 12px; font-size: .8rem; font-weight: 700; color: var(--jp-classroom-copy, #5f5868); }
    .jp-admin-form input, .jp-admin-form select, .jp-admin-form textarea { width: 100%; margin-top: 5px; }
    .jp-admin-form .jp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 640px) { .jp-admin-form .jp-row { grid-template-columns: 1fr; } }
</style>

<div class="jp-admin-page">
    <div class="jp-admin-page-head">
        <div><h1>Modifier « <?= e($logiciel['nom']) ?> »</h1><p class="text-muted">Actuellement : <?= $logiciel['fichier'] !== '' ? 'fichier hébergé (' . e(jp_logiciel_size($logiciel['taille_octets'])) . ')' : 'lien externe' ?> · <?= (int)$logiciel['telechargements'] ?> téléchargement(s).</p></div>
        <a class="jp-btn jp-btn-ghost" href="<?= e(url('/admin/logiciels')) ?>"><i class="fas fa-arrow-left"></i> Retour</a>
    </div>

    <?php if ($message !== ''): ?><div class="alert alert-<?= e($status) ?>"><?= e($message) ?></div><?php endif; ?>

    <form class="jp-admin-card jp-admin-form" method="post" enctype="multipart/form-data" data-testid="admin-logiciel-edit-form">
        <input type="hidden" name="id" value="<?= (int)$logiciel['id'] ?>">
        <label>Nom du logiciel
            <input type="text" name="nom" minlength="2" maxlength="180" value="<?= e($logiciel['nom']) ?>" required>
        </label>
        <label>Description
            <textarea name="description" rows="4" maxlength="10000"><?= e((string)$logiciel['description']) ?></textarea>
        </label>
        <div class="jp-row">
            <label>Version
                <input type="text" name="version" maxlength="40" value="<?= e($logiciel['version']) ?>">
            </label>
            <label>Licence
                <input type="text" name="licence" maxlength="60" value="<?= e($logiciel['licence']) ?>">
            </label>
        </div>
        <div class="jp-row">
            <label>Catégorie
                <select name="categorie_id">
                    <option value="">Sans catégorie</option>
                    <?php foreach ($categories as $category): ?><option value="<?= (int)$category['id'] ?>" <?= (int)$logiciel['categorie_id'] === (int)$category['id'] ? 'selected' : '' ?>><?= e($category['nom']) ?></option><?php endforeach; ?>
                </select>
            </label>
            <label>Plateforme
                <input type="text" name="plateforme" maxlength="120" value="<?= e($logiciel['plateforme']) ?>">
            </label>
        </div>
        <label>Remplacer le fichier (laissez vide pour conserver l’actuel)
            <input type="file" name="fichier" accept=".zip,.apk,.exe,.msi,.dmg,.pkg,.deb,.rar,.7z,.pdf">
        </label>
        <label>Lien externe (utilisé si aucun fichier n’est hébergé)
            <input type="url" name="lien_externe" maxlength="500" value="<?= e($logiciel['lien_externe']) ?>">
        </label>
        <label>Remplacer l’image d’illustration
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif">
        </label>
        <button class="jp-btn jp-btn-primary" type="submit" data-testid="admin-logiciel-edit-submit"><i class="fas fa-floppy-disk"></i> Enregistrer les modifications</button>
    </form>
</div>

<?php include '../includes/footer_admin.php'; ?>
