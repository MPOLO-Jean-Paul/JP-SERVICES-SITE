<?php

declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/connexion_db.php';
require_admin();

$mediaColumn = jp_actualite_media_column($conn);
$stmt = $conn->query("SELECT id, titre, contenu, {$mediaColumn} AS media, date_publication FROM actualites ORDER BY date_publication DESC");
$actualites = $stmt->fetchAll();
$page_title = 'Gestion des actualités';
include dirname(__DIR__) . '/includes/header_admin.php';
?>
<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div><span class="text-primary fw-bold">Communication</span><h1 class="h3 mb-0">Actualités</h1><p class="text-muted mb-0"><?= count($actualites) ?> publication(s)</p></div>
        <a class="btn btn-primary" href="<?= e(url('/admin/actualite/publier')) ?>"><i class="fas fa-plus"></i> Publier une actualité</a>
    </div>
    <?php if (isset($_GET['message'])): ?><div class="alert alert-success">L’actualité a été supprimée.</div><?php endif; ?>
    <?php if (isset($_GET['success'])): ?><div class="alert alert-success">L’actualité a été enregistrée.</div><?php endif; ?>
    <div class="card overflow-hidden"><div class="table-responsive">
        <table class="table mb-0"><thead><tr><th>Visuel</th><th>Actualité</th><th>Date</th><th class="text-end">Actions</th></tr></thead><tbody>
        <?php if (!$actualites): ?><tr><td colspan="4" class="text-center py-5 text-muted">Aucune actualité publiée.</td></tr><?php endif; ?>
        <?php foreach ($actualites as $actualite): ?>
            <tr>
                <td style="width:90px"><?php if (!empty($actualite['media'])): ?><img src="<?= e(url('/' . ltrim((string)$actualite['media'], '/'))) ?>" alt="" style="width:62px;height:62px;object-fit:cover;border-radius:14px"><?php else: ?><span class="d-inline-grid place-items-center bg-light rounded" style="width:62px;height:62px"><i class="fas fa-image text-muted"></i></span><?php endif; ?></td>
                <td><strong><?= e($actualite['titre']) ?></strong><div class="small text-muted text-truncate" style="max-width:560px"><?= e(strip_tags((string)$actualite['contenu'])) ?></div></td>
                <td><?= e(date('d/m/Y H:i', strtotime((string)$actualite['date_publication']))) ?></td>
                <td class="text-end"><div class="d-inline-flex gap-2">
                    <a class="btn btn-outline-primary btn-sm" href="<?= e(url('/admin/actualite/modifier')) ?>?id=<?= (int)$actualite['id'] ?>"><i class="fas fa-pen"></i></a>
                    <form method="post" action="<?= e(url('/admin/actualite/supprimer')) ?>" data-confirm="Supprimer définitivement cette actualité ?"><input type="hidden" name="id" value="<?= (int)$actualite['id'] ?>"><button class="btn btn-outline-danger btn-sm" type="submit"><i class="fas fa-trash"></i></button></form>
                </div></td>
            </tr>
        <?php endforeach; ?>
        </tbody></table>
    </div></div>
</div>
<?php include dirname(__DIR__) . '/includes/footer_admin.php'; ?>
