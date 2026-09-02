<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_once '../includes/connexion_db.php';

// Rediriger si l'utilisateur n'est pas un admin
require_admin();

$page_title = "Gestion des Utilisateurs";
include '../includes/header_admin.php';

// Gestion des messages flash (si vous redirigez depuis changer_statut.php)
$message = $_SESSION['flash_message'] ?? '';
unset($_SESSION['flash_message']);

// Récupération des utilisateurs
$sql = "SELECT id, nom, prenom, email, role, is_active FROM users WHERE role != 'admin' ORDER BY date_inscription DESC";
$stmt = $conn->prepare($sql);
$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Fonction pour l'avatar par défaut (Initiale)
function getInitials($firstname, $lastname) {
    return strtoupper(substr($firstname, 0, 1) . substr($lastname, 0, 1));
}
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
        box-shadow: none;
    }

    /* Table Design */
    .table thead th {
        background-color: white;
        color: #5f6368;
        font-weight: 500;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid var(--google-border);
        padding: 16px;
    }

    .table td { padding: 12px 16px; vertical-align: middle; border-bottom: 1px solid var(--google-border); }

    /* Avatar Design */
    .user-avatar {
        width: 36px;
        height: 36px;
        background-color: #e8f0fe;
        color: var(--google-blue);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: 500;
        font-size: 0.9rem;
        margin-right: 12px;
    }

    /* Status Badges */
    .status-pill {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.75rem;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
    }
    .pill-active { background-color: #e6f4ea; color: #137333; }
    .pill-inactive { background-color: #fce8e6; color: #c5221f; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; }

    /* Action Buttons */
    .btn-google {
        border: 1px solid var(--google-border);
        background: white;
        color: #5f6368;
        font-size: 0.85rem;
        border-radius: 4px;
        padding: 6px 12px;
        transition: all 0.2s;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
    }
    .btn-google:hover { background: #f1f3f4; color: var(--google-blue); border-color: var(--google-blue); }
    .btn-delete:hover { color: var(--google-red); border-color: var(--google-red); }

    .role-text { color: #5f6368; font-size: 0.9rem; font-weight: 400; }
</style>

<div class="container py-4">
    <div class="d-md-flex align-items-center justify-content-between mb-4">
        <div>
            <h4 class="fw-bold mb-0" style="font-family: 'Product Sans', sans-serif;">Annuaire des Utilisateurs</h4>
            <p class="text-muted small mb-0">Gérez les accès et les permissions de votre plateforme.</p>
        </div>
        <div class="mt-3 mt-md-0">
            <div class="btn-group shadow-sm">
                <button type="button" data-page-reload class="btn btn-white btn-sm border bg-white">
                    <i class="fas fa-sync-alt"></i>
                </button>
                <button class="btn btn-primary btn-sm px-3">
                    <i class="fas fa-user-plus me-1"></i> Inviter
                </button>
            </div>
        </div>
    </div>

    <?php if ($message): ?>
        <div class="alert alert-info border-0 shadow-sm d-flex align-items-center mb-4" role="alert">
            <i class="fas fa-info-circle me-2 text-primary"></i> 
            <span class="small"><?= htmlspecialchars($message); ?></span>
            <button type="button" class="btn-close ms-auto" data-jp-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <div class="admin-card">
        <div class="table-responsive">
            <table class="table mb-0">
                <thead>
                    <tr>
                        <th>Utilisateur</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>État du compte</th>
                        <th class="text-end">Opérations</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ($users): ?>
                        <?php foreach ($users as $user): ?>
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="user-avatar">
                                            <?= e(getInitials((string)$user['prenom'], (string)$user['nom'])) ?>
                                        </div>
                                        <div>
                                            <div class="fw-bold text-dark mb-0"><?= htmlspecialchars($user['prenom'] . ' ' . $user['nom']); ?></div>
                                            <div class="text-muted small">ID: #<?= (int)$user['id']; ?></div>
                                        </div>
                                    </div>
                                </td>
                                <td class="role-text"><?= htmlspecialchars($user['email']); ?></td>
                                <td>
                                    <span class="text-capitalize role-text">
                                        <i class="fas fa-user-circle me-1 small"></i> <?= htmlspecialchars($user['role']); ?>
                                    </span>
                                </td>
                                <td>
                                    <?php if ($user['is_active']): ?>
                                        <span class="status-pill pill-active">
                                            <span class="status-dot bg-success"></span> Actif
                                        </span>
                                    <?php else: ?>
                                        <span class="status-pill pill-inactive">
                                            <span class="status-dot bg-danger"></span> Suspendu
                                        </span>
                                    <?php endif; ?>
                                </td>
                                <td class="text-end">
                                    <div class="d-inline-flex gap-2">
                                        <form action="changer_statut_utilisateur.php" method="post" class="d-inline" data-confirm="Confirmer le changement de statut ?">
                                            <input type="hidden" name="id" value="<?= (int)$user['id'] ?>">
                                            <input type="hidden" name="action" value="<?= $user['is_active'] ? 'desactiver' : 'activer' ?>">
                                            <button type="submit" class="btn-google" title="<?= $user['is_active'] ? 'Suspendre' : 'Activer' ?>">
                                                <i class="fas <?= $user['is_active'] ? 'fa-user-slash' : 'fa-user-check' ?> me-1"></i>
                                                <?= $user['is_active'] ? 'Suspendre' : 'Activer' ?>
                                            </button>
                                        </form>
                                        <form action="supprimer_utilisateur.php" method="post" class="d-inline" data-confirm="Supprimer définitivement cet utilisateur ?">
                                            <input type="hidden" name="id" value="<?= (int)$user['id'] ?>">
                                            <button type="submit" class="btn-google btn-delete" title="Supprimer"><i class="fas fa-trash-alt"></i></button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="5" class="text-center py-5">
                                <i class="fas fa-users-slash fa-3x text-light mb-3"></i>
                                <p class="text-muted">Aucun utilisateur n'a été trouvé.</p>
                            </td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <div class="mt-3 px-2">
        <p class="small text-muted">
            <i class="fas fa-info-circle me-1"></i> 
            Affichage de <strong><?= count($users) ?></strong> utilisateurs enregistrés.
        </p>
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
