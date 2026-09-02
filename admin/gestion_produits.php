<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_once '../includes/connexion_db.php';

// Sécurité MSI
require_admin();

$message = '';
$status = '';


// Suppression sécurisée
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'supprimer') {
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    if ($id) {
        $stmt = $conn->prepare('SELECT image_url FROM produits WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $image = $stmt->fetchColumn();
        $delete = $conn->prepare('DELETE FROM produits WHERE id = :id');
        $delete->execute(['id' => $id]);
        jp_safe_delete_media(is_string($image) ? $image : null);
        $message = 'Produit supprimé avec succès.';
        $status = 'success';
    }
}

// Traitement de l'ajout
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'ajouter') {
    $nom = trim((string)($_POST['nom'] ?? ''));
    $description = trim((string)($_POST['description'] ?? ''));
    $prix = filter_var($_POST['prix'] ?? null, FILTER_VALIDATE_FLOAT);
    $image_path = '';

    // Validation du contenu réel de l’image
    if (isset($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        try {
            $image_path = jp_upload_image($_FILES['image'], 'images/produits', 5 * 1024 * 1024);
        } catch (RuntimeException $exception) {
            $message = $exception->getMessage();
            $status = 'danger';
        }
    }

    if (empty($message) && mb_strlen($nom, 'UTF-8') >= 2 && mb_strlen($nom, 'UTF-8') <= 180 && mb_strlen($description, 'UTF-8') <= 10000 && $prix !== false && $prix > 0 && $prix <= 1000000000) {
        try {
            $sql = "INSERT INTO produits (nom, description, prix, image_url) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$nom, $description, $prix, $image_path]);
            $message = "Produit ajouté avec succès !";
            $status = "success";
        } catch (Throwable $exception) {
            if ($image_path !== '') jp_safe_delete_media($image_path);
            error_log('Ajout produit : ' . $exception->getMessage());
            $message = 'Le produit n’a pas pu être enregistré.';
            $status = 'danger';
        }
    } elseif (empty($message)) {
        if ($image_path !== '') jp_safe_delete_media($image_path);
        $message = "Vérifiez le nom, la description et le prix du produit.";
        $status = "warning";
    }
}

// Récupération
$produits = $conn->query("SELECT * FROM produits ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);

$page_title = "Inventaire Produits";
include '../includes/header_admin.php';
?>

<style>
    :root {
        --g-blue: #1a73e8;
        --g-border: #dadce0;
        --g-gray-bg: #f8f9fa;
        --g-text: #202124;
    }

    body.dark-mode {
        --g-gray-bg: #1f1f1f;
        --g-border: #444;
        --g-text: #e0e0e0;
    }

    body { background-color: var(--g-gray-bg); color: var(--g-text); font-family: 'Roboto', sans-serif; }
    h1, h4, .g-font { font-family: 'Google Sans', sans-serif; }

    /* Layout MSI */
    .sidebar-g { background: var(--card-bg, white); border-right: 1px solid var(--g-border); min-height: 100vh; padding-top: 20px; }
    .nav-link-g { color: var(--g-text); padding: 12px 24px; display: flex; align-items: center; text-decoration: none; font-weight: 500; border-radius: 0 25px 25px 0; margin-right: 10px; transition: 0.2s; }
    .nav-link-g.active { background-color: #e8f0fe; color: var(--g-blue); }

    .g-card { background: var(--card-bg, white); border: 1px solid var(--g-border); border-radius: 8px; overflow: hidden; }
    
    /* Table Style */
    .table-img { width: 48px; height: 48px; object-fit: cover; border-radius: 4px; border: 1px solid var(--g-border); }
    .table thead th { background: rgba(0,0,0,0.02); font-size: 12px; text-transform: uppercase; color: #5f6368; border-bottom: 1px solid var(--g-border); }
    
    .btn-g-primary { background: var(--g-blue); color: white; border: none; padding: 10px 24px; border-radius: 4px; font-weight: 500; }
    .btn-action { width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--g-border); color: #5f6368; transition: 0.2s; }
    .btn-action:hover { background: #f1f3f4; color: var(--g-blue); }

    .g-input { border: 1px solid var(--g-border); border-radius: 4px; padding: 10px; background: transparent; color: inherit; }
    .g-input:focus { border-color: var(--g-blue); box-shadow: none; border-width: 2px; }
</style>

<div class="container-fluid">
    <div class="row">
        <nav class="col-md-3 col-lg-2 sidebar-g d-none d-md-block">
            <a href="index.php" class="nav-link-g"><i class="fas fa-chart-line me-3"></i>Dashboard</a>
            <a href="gestion_produits.php" class="nav-link-g active"><i class="fas fa-box me-3"></i>Produits</a>
            <a href="messages.php" class="nav-link-g"><i class="fas fa-envelope me-3"></i>Messages</a>
        </nav>

        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-5 py-4">
            <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h1 class="h3 fw-bold mb-0">Gestion de l'inventaire</h1>
                <div class="text-muted small">Total : <?= count($produits) ?> articles</div>
            </div>

            <?php if ($message): ?>
                <div class="alert alert-<?= e($status) ?> border-0 shadow-sm mb-4">
                    <i class="fas <?= $status === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle' ?> me-2"></i>
                    <?= e($message) ?>
                </div>
            <?php endif; ?>

            <div class="row g-4">
                <div class="col-lg-4">
                    <div class="g-card shadow-sm p-4">
                        <h4 class="h5 mb-4 fw-bold"><i class="fas fa-plus me-2 text-primary"></i>Nouveau produit</h4>
                        <form action="" method="POST" enctype="multipart/form-data">
                            <input type="hidden" name="action" value="ajouter">
                            
                            <div class="mb-3">
                                <label class="small fw-bold text-muted mb-1">Désignation</label>
                                <input type="text" class="form-control g-input" name="nom" minlength="2" maxlength="180" placeholder="Ex: Laptop Dell XPS" required>
                            </div>

                            <div class="mb-3">
                                <label class="small fw-bold text-muted mb-1">Description</label>
                                <textarea class="form-control g-input" name="description" rows="3" maxlength="10000" required></textarea>
                            </div>

                            <div class="row mb-3">
                                <div class="col-6">
                                    <label class="small fw-bold text-muted mb-1">Prix ($)</label>
                                    <input type="number" step="0.01" min="0.01" max="1000000000" class="form-control g-input" name="prix" required>
                                </div>
                                <div class="col-6">
                                    <label class="small fw-bold text-muted mb-1">Image</label>
                                    <input type="file" class="form-control g-input" name="image" accept="image/jpeg,image/png,image/webp,image/gif" style="font-size: 0.8rem;">
                                </div>
                            </div>

                            <button type="submit" class="btn btn-g-primary w-100 mt-2">
                                Enregistrer le produit
                            </button>
                        </form>
                    </div>
                </div>

                <div class="col-lg-8">
                    <div class="g-card shadow-sm">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th class="ps-4">Aperçu</th>
                                        <th>Produit</th>
                                        <th>Prix</th>
                                        <th class="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if ($produits): ?>
                                        <?php foreach ($produits as $p): ?>
                                            <tr>
                                                <td class="ps-4">
                                                    <?php if ($p['image_url']): ?>
                                                        <img src="../<?= htmlspecialchars($p['image_url']) ?>" class="table-img" alt="Prod">
                                                    <?php else: ?>
                                                        <div class="table-img d-flex align-items-center justify-content-center bg-light text-muted">
                                                            <i class="fas fa-image fa-xs"></i>
                                                        </div>
                                                    <?php endif; ?>
                                                </td>
                                                <td>
                                                    <div class="fw-bold"><?= htmlspecialchars($p['nom']) ?></div>
                                                    <div class="small text-muted text-truncate" style="max-width: 200px;"><?= htmlspecialchars($p['description']) ?></div>
                                                </td>
                                                <td class="fw-bold text-primary">
                                                    <?= number_format($p['prix'], 2, ',', ' ') ?> $
                                                </td>
                                                <td class="text-end pe-4">
                                                    <a href="modifier_produit.php?id=<?= (int)$p['id'] ?>" class="btn-action me-1" title="Modifier"><i class="fas fa-pen fa-xs"></i></a>
                                                    <form method="post" action="gestion_produits.php" class="d-inline" data-confirm="Supprimer définitivement ce produit ?">
                                                        <input type="hidden" name="action" value="supprimer">
                                                        <input type="hidden" name="id" value="<?= (int)$p['id'] ?>">
                                                        <button type="submit" class="btn-action text-danger border-danger-subtle" title="Supprimer"><i class="fas fa-trash fa-xs"></i></button>
                                                    </form>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    <?php else: ?>
                                        <tr>
                                            <td colspan="4" class="text-center py-5 text-muted">
                                                Aucun produit en stock.
                                            </td>
                                        </tr>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>

<?php include '../includes/footer_admin.php'; ?>
