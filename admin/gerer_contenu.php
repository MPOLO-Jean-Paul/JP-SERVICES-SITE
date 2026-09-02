<?php

declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/connexion_db.php';
require_admin();

$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['supprimer_id'])) {
    $id = filter_input(INPUT_POST, 'supprimer_id', FILTER_VALIDATE_INT);
    if ($id) {
        $stmt = $conn->prepare('DELETE FROM posts WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $message = 'Publication supprimée avec succès.';
    }
}

$stmt = $conn->query('SELECT p.id, p.titre, p.contenu, p.date_publication, u.nom AS auteur_nom FROM posts p JOIN users u ON p.auteur_id = u.id ORDER BY p.date_publication DESC');
$posts = $stmt->fetchAll();
$page_title = 'Gestion des publications';
include dirname(__DIR__) . '/includes/header_admin.php';
?>
<div class="container py-4">
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div><span class="text-primary fw-bold">Communauté</span><h1 class="h3 mb-0">Publications du forum</h1></div>
        <a href="<?= e(url('/admin/contenu/ajouter')) ?>" class="btn btn-primary"><i class="fas fa-plus"></i> Nouvelle publication</a>
    </div>
    <?php if ($message !== ''): ?><div class="alert alert-success"><?= e($message) ?></div><?php endif; ?>
    <div class="card overflow-hidden">
        <div class="table-responsive">
            <table class="table mb-0">
                <thead><tr><th>Titre</th><th>Auteur</th><th>Date</th><th class="text-end">Action</th></tr></thead>
                <tbody>
                <?php if (!$posts): ?><tr><td colspan="4" class="text-center py-5 text-muted">Aucune publication.</td></tr><?php endif; ?>
                <?php foreach ($posts as $post): ?>
                    <tr>
                        <td><strong><?= e($post['titre']) ?></strong><div class="small text-muted text-truncate" style="max-width:520px"><?= e(strip_tags((string)$post['contenu'])) ?></div></td>
                        <td><?= e($post['auteur_nom']) ?></td>
                        <td><?= e(date('d/m/Y H:i', strtotime((string)$post['date_publication']))) ?></td>
                        <td class="text-end"><form method="post" action="<?= e(url('/admin/contenus')) ?>" data-confirm="Supprimer cette publication ?"><input type="hidden" name="supprimer_id" value="<?= (int)$post['id'] ?>"><button class="btn btn-outline-danger btn-sm" type="submit"><i class="fas fa-trash"></i></button></form></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
<?php include dirname(__DIR__) . '/includes/footer_admin.php'; ?>
