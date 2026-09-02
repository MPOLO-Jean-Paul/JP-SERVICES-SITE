<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
require_once '../includes/connexion_db.php';

// Action : marquer comme lu (POST uniquement)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mark_read'])) {
    $ticketId = filter_input(INPUT_POST, 'ticket_id', FILTER_VALIDATE_INT);
    if ($ticketId) {
        try {
            $stmt = $conn->prepare("UPDATE support_tickets SET statut = 'lu' WHERE id = :id");
            $stmt->execute([':id' => $ticketId]);
        } catch (Throwable $exception) {
            error_log('Support lecture: ' . $exception->getMessage());
        }
    }
    redirect('/admin/support');
}

// Récupération des messages
try {
    $sql = "SELECT * FROM support_tickets ORDER BY date_envoi DESC";
    $stmt = $conn->query($sql);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $erreur = "Erreur lors de la récupération des messages.";
}

$page_title = "Support Clients";
include '../includes/header_admin.php';
?>

<style>
    :root {
        --g-blue: #1a73e8;
        --g-gray-bg: #f8f9fa;
        --g-border: #dadce0;
        --g-text-dark: #202124;
    }

    body { background-color: var(--g-gray-bg); font-family: 'Roboto', sans-serif; }
    h2, .g-font { font-family: 'Google Sans', sans-serif; font-weight: 500; }

    /* Navigation Adaptable */
    .sidebar-g { background: white; border-right: 1px solid var(--g-border); min-height: 100vh; padding-top: 20px; }
    .nav-link-g { color: var(--g-text-dark); padding: 12px 24px; display: flex; align-items: center; text-decoration: none; font-weight: 500; transition: 0.2s; }
    
    @media (min-width: 768px) {
        .nav-link-g { border-radius: 0 25px 25px 0; margin-right: 10px; }
        .nav-link-g.active { background-color: #e8f0fe; color: var(--g-blue); }
    }

    @media (max-width: 767.98px) {
        .sidebar-g { min-height: auto; border-right: none; border-bottom: 1px solid var(--g-border); padding: 0; overflow-x: auto; }
        .nav-container-mobile { display: flex; flex-direction: row; white-space: nowrap; }
        .nav-link-g { padding: 15px 20px; border-bottom: 3px solid transparent; }
        .nav-link-g.active { color: var(--g-blue); border-bottom-color: var(--g-blue); }
    }

    /* Table & Ticket Style */
    .g-table-card { background: white; border: 1px solid var(--g-border); border-radius: 8px; overflow: hidden; }
    .table thead th { background-color: #f1f3f4; color: #5f6368; font-size: 12px; text-transform: uppercase; padding: 15px; border: none; }
    .table tbody td { padding: 15px; vertical-align: middle; border-bottom: 1px solid #f1f3f4; }
    
    .unread { background-color: #fff9e6; font-weight: 500; }
    .status-dot { height: 8px; width: 8px; border-radius: 50%; display: inline-block; margin-right: 8px; }
    
    .msg-preview { max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #5f6368; font-size: 0.9rem; }
    
    .btn-circle { width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s; border: 1px solid var(--g-border); color: #5f6368; background: white; }
    .btn-circle:hover { background: #f1f3f4; color: var(--g-blue); }
</style>

<div class="container-fluid">
    <div class="row">
        <nav class="col-md-3 col-lg-2 sidebar-g">
            <div class="nav-container-mobile">
                <a href="index.php" class="nav-link-g"><i class="fas fa-th-large me-3"></i><span>Dashboard</span></a>
                <a href="publier_formation.php" class="nav-link-g"><i class="fas fa-plus-circle me-3"></i><span>Publier</span></a>
                <a href="gerer_formation.php" class="nav-link-g"><i class="fas fa-tasks me-3"></i><span>Catalogue</span></a>
                <a href="support.php" class="nav-link-g active"><i class="fas fa-headset me-3"></i><span>Support</span></a>
            </div>
        </nav>

        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-5 py-4">
            <div class="d-flex justify-content-between align-items-center mb-4 pt-3">
                <h2 class="h3 mb-0">Centre de Support</h2>
                <div class="text-muted small">Dernière mise à jour : <?= date('H:i') ?></div>
            </div>

            <div class="g-table-card shadow-sm">
                <?php if (empty($tickets)): ?>
                    <div class="p-5 text-center">
                        <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                        <p class="text-muted">Félicitations ! Votre boîte de réception est vide.</p>
                    </div>
                <?php else: ?>
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Expéditeur</th>
                                    <th>Sujet & Message</th>
                                    <th>Date</th>
                                    <th class="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($tickets as $t): 
                                    $is_unread = (!isset($t['statut']) || $t['statut'] !== 'lu');
                                ?>
                                <tr class="<?= $is_unread ? 'unread' : '' ?>">
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <?php if($is_unread): ?>
                                                <span class="status-dot bg-warning"></span>
                                            <?php endif; ?>
                                            <div>
                                                <div class="fw-bold"><?= htmlspecialchars($t['nom']) ?></div>
                                                <div class="small text-muted"><?= htmlspecialchars($t['email']) ?></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge bg-light text-dark border mb-1"><?= htmlspecialchars($t['sujet']) ?></span>
                                        <div class="msg-preview"><?= htmlspecialchars($t['message']) ?></div>
                                    </td>
                                    <td class="small text-muted">
                                        <?= date('d M, H:i', strtotime($t['date_envoi'])) ?>
                                    </td>
                                    <td class="text-end">
                                        <button class="btn-circle me-1" title="Voir le message" data-jp-toggle="modal" data-jp-target="#viewMsg<?= (int)$t['id'] ?>">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <a href="mailto:<?= e($t['email']) ?>?subject=RE: <?= urlencode($t['sujet']) ?>" class="btn-circle me-1" title="Répondre">
                                            <i class="fas fa-reply"></i>
                                        </a>
                                        <?php if($is_unread): ?>
                                            <form method="post" action="<?= e(app_route('/admin/support')) ?>" class="d-inline">
                                                <input type="hidden" name="ticket_id" value="<?= (int)$t['id'] ?>">
                                                <button type="submit" name="mark_read" value="1" class="btn-circle" title="Marquer comme lu"><i class="fas fa-check"></i></button>
                                            </form>
                                        <?php endif; ?>
                                    </td>
                                </tr>

                                <div class="modal fade" id="viewMsg<?= (int)$t['id'] ?>" tabindex="-1" aria-hidden="true">
                                    <div class="modal-dialog modal-dialog-centered">
                                        <div class="modal-content border-0 shadow-lg">
                                            <div class="modal-header bg-light">
                                                <h5 class="modal-title g-font">Message de <?= htmlspecialchars($t['nom']) ?></h5>
                                                <button type="button" class="btn-close" data-jp-dismiss="modal"></button>
                                            </div>
                                            <div class="modal-body p-4">
                                                <div class="d-flex justify-content-between mb-3 small text-muted border-bottom pb-2">
                                                    <span>Sujet : <strong><?= htmlspecialchars($t['sujet']) ?></strong></span>
                                                    <span><?= date('d/m/Y à H:i', strtotime($t['date_envoi'])) ?></span>
                                                </div>
                                                <p style="white-space: pre-wrap; line-height: 1.6; color: #3c4043;">
                                                    <?= htmlspecialchars($t['message']) ?>
                                                </p>
                                            </div>
                                            <div class="modal-footer border-0">
                                                <button type="button" class="btn btn-light" data-jp-dismiss="modal">Fermer</button>
                                                <a href="mailto:<?= e($t['email']) ?>" class="btn btn-primary" style="background-color: var(--g-blue);">
                                                    <i class="fas fa-paper-plane me-2"></i>Répondre au client
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </main>
    </div>
</div>

<?php include '../includes/footer_admin.php'; ?>
