<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
require_once '../includes/connexion_db.php';

// Erreur de connexion DB
$message = '';
$message_type = '';

// --- ACTIONS POST ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['projet_id'], $_POST['action'])) {
    $projet_id = (int)$_POST['projet_id'];
    $action = $_POST['action'];
    $new_status = ($action === 'approuver') ? 'valide' : (($action === 'rejeter') ? 'rejete' : '');

    if ($new_status) {
        try {
            $sql = "UPDATE projets SET statut = :statut WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':statut' => $new_status, ':id' => $projet_id]);
            $message = "Le statut du projet #$projet_id a été mis à jour.";
            $message_type = 'success';
        } catch (Throwable $e) {
            error_log('Statut projet: ' . $e->getMessage());
            $message = "Le statut du projet n’a pas pu être mis à jour.";
            $message_type = 'danger';
        }
    }
}

// --- RÉCUPÉRATION ---
try {
    $sql = "SELECT p.*, u.prenom, u.nom, u.email 
            FROM projets p 
            INNER JOIN users u ON p.auteur_id = u.id 
            ORDER BY CASE WHEN p.statut = 'en_attente' THEN 0 ELSE 1 END, p.date_soumission DESC";
    $projets = $conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $projets = [];
}

$page_title = "Gestion des Projets";
include '../includes/header_admin.php'; 
?>

<style>
    :root {
        --google-blue: #1a73e8;
        --google-red: #d93025;
        --google-green: #1e8e3e;
        --google-yellow: #f9ab00;
        --google-border: #dadce0;
        --google-bg: #f8f9fa;
    }

    body { background-color: var(--google-bg); color: #3c4043; }
    
    .admin-card {
        background: white;
        border: 1px solid var(--google-border);
        border-radius: 8px;
        transition: box-shadow 0.2s;
    }
    
    .admin-card:hover { box-shadow: 0 1px 3px rgba(60,64,67,0.3), 0 4px 8px rgba(60,64,67,0.15); }

    .table thead th {
        background-color: white;
        color: #5f6368;
        font-weight: 500;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid var(--google-border);
    }

    .status-pill {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .pill-en_attente { background: #fef7e0; color: #b05a00; border: 1px solid #ffe168; }
    .pill-approuve, .pill-valide { background: #e6f4ea; color: #137333; border: 1px solid #ceead6; }
    .pill-rejete { background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf; }

    .btn-google-action {
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 0.8rem;
        border: 1px solid var(--google-border);
        background: white;
        color: #5f6368;
    }

    .btn-google-action:hover { background: #f1f3f4; color: var(--google-blue); }
    
    .modal-content { border-radius: 8px; border: none; }
    .modal-header { border-bottom: 1px solid var(--google-border); background: #f8f9fa; }
</style>

<div class="container py-4">
    <div class="d-md-flex align-items-center justify-content-between mb-4">
        <div>
            <h4 class="fw-bold mb-0" style="font-family: 'Product Sans', sans-serif;">Projets Soumis</h4>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item"><a href="index.php" class="text-decoration-none">Admin</a></li>
                    <li class="breadcrumb-item active">Projets</li>
                </ol>
            </nav>
        </div>
        <div class="mt-3 mt-md-0">
            <button type="button" data-page-reload class="btn btn-white btn-sm border shadow-sm">
                <i class="fas fa-sync-alt me-1"></i> Actualiser
            </button>
        </div>
    </div>

    <?php if ($message): ?>
        <div class="alert alert-<?= e($message_type) ?> border-0 shadow-sm mb-4 d-flex align-items-center" role="alert">
            <i class="fas fa-info-circle me-2"></i> <?= e($message) ?>
            <button type="button" class="btn-close ms-auto" data-jp-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <div class="admin-card p-0 overflow-hidden">
        <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
                <thead>
                    <tr>
                        <th class="ps-4">Projet & Auteur</th>
                        <th>Soumission</th>
                        <th>Statut</th>
                        <th class="text-end pe-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($projets)): ?>
                        <tr><td colspan="4" class="text-center py-5 text-muted">Aucun projet à afficher.</td></tr>
                    <?php else: foreach ($projets as $p): ?>
                        <tr>
                            <td class="ps-4 py-3">
                                <div class="d-flex align-items-center">
                                    <div class="avatar me-3 bg-light text-primary d-flex align-items-center justify-content-center rounded-circle" style="width: 40px; height: 40px;">
                                        <i class="fas fa-file-alt"></i>
                                    </div>
                                    <div>
                                        <div class="fw-bold text-dark"><?= htmlspecialchars($p['titre']) ?></div>
                                        <div class="small text-muted"><?= htmlspecialchars($p['prenom'].' '.$p['nom']) ?> • <?= htmlspecialchars($p['email']) ?></div>
                                    </div>
                                </div>
                            </td>
                            <td class="small text-muted">
                                <?= date('d M Y', strtotime($p['date_soumission'])) ?>
                            </td>
                            <td>
                                <span class="status-pill pill-<?= e($p['statut']) ?>">
                                    <?= ucfirst(str_replace('_', ' ', $p['statut'])) ?>
                                </span>
                            </td>
                            <td class="text-end pe-4">
                                <div class="d-flex justify-content-end gap-1">
                                    <button class="btn btn-google-action" data-jp-toggle="modal" data-jp-target="#viewModal<?= (int)$p['id'] ?>" title="Détails">
                                        <i class="fas fa-eye"></i>
                                    </button>

                                    <?php if ($p['statut'] == 'en_attente'): ?>
                                        <form method="POST" class="d-inline" data-confirm="Approuver ce projet ?">
                                            <input type="hidden" name="projet_id" value="<?= (int)$p['id'] ?>">
                                            <input type="hidden" name="action" value="approuver">
                                            <button type="submit" class="btn btn-google-action text-success" title="Approuver">
                                                <i class="fas fa-check"></i>
                                            </button>
                                        </form>
                                        <form method="POST" class="d-inline" data-confirm="Rejeter ce projet ?">
                                            <input type="hidden" name="projet_id" value="<?= (int)$p['id'] ?>">
                                            <input type="hidden" name="action" value="rejeter">
                                            <button type="submit" class="btn btn-google-action text-danger" title="Rejeter">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </form>
                                    <?php endif; ?>
                                </div>
                            </td>
                        </tr>

                        <div class="modal fade" id="viewModal<?= (int)$p['id'] ?>" tabindex="-1" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-lg">
                                <div class="modal-content shadow-lg">
                                    <div class="modal-header border-0">
                                        <h5 class="modal-title fw-bold text-dark"><?= htmlspecialchars($p['titre']) ?></h5>
                                        <button type="button" class="btn-close" data-jp-dismiss="modal"></button>
                                    </div>
                                    <div class="modal-body">
                                        <div class="mb-4">
                                            <label class="small text-uppercase fw-bold text-muted mb-2 d-block">Description du projet</label>
                                            <div class="p-3 bg-light rounded" style="white-space: pre-wrap; line-height: 1.6; color: #3c4043;">
                                                <?= htmlspecialchars($p['description']) ?>
                                            </div>
                                        </div>
                                        <div class="row g-3">
                                            <div class="col-sm-6">
                                                <div class="p-3 border rounded">
                                                    <small class="text-muted d-block">Soumis par</small>
                                                    <strong><?= htmlspecialchars($p['prenom'].' '.$p['nom']) ?></strong>
                                                </div>
                                            </div>
                                            <div class="col-sm-6">
                                                <div class="p-3 border rounded">
                                                    <small class="text-muted d-block">Date de soumission</small>
                                                    <strong><?= date('d/m/Y à H:i', strtotime($p['date_soumission'])) ?></strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal-footer border-0">
                                        <button type="button" class="btn btn-light" data-jp-dismiss="modal">Fermer</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php 
if (file_exists('../includes/footer_admin.php')) {
    include '../includes/footer_admin.php'; 
} else {
    echo '</main>
</body></html>';
}
?>
