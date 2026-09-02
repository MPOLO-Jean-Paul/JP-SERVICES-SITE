<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();

require_once '../includes/connexion_db.php';
$page_title = "Notifications & Abonnements";
include '../includes/header_admin.php';

$alerts = [];

// CSRF token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrf = $_SESSION['csrf_token'];

// -------------------- LOGIQUE DE TRAITEMENT --------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'create_notification') {
    if (hash_equals($csrf, $_POST['csrf'] ?? '')) {
        $fid = filter_input(INPUT_POST, 'formation_id', FILTER_VALIDATE_INT);
        $titre = trim((string)($_POST['titre'] ?? ''));
        $message = trim((string)($_POST['message'] ?? ''));
        if ($fid && mb_strlen($titre, 'UTF-8') >= 3 && mb_strlen($titre, 'UTF-8') <= 180 && mb_strlen($message, 'UTF-8') >= 5 && mb_strlen($message, 'UTF-8') <= 8000) {
            $formationExists = $conn->prepare('SELECT 1 FROM formations WHERE id = ? LIMIT 1');
            $formationExists->execute([$fid]);
            if ($formationExists->fetchColumn()) {
                $stmt = $conn->prepare("INSERT INTO notifications (formation_id, titre, message) VALUES (?, ?, ?)");
                $stmt->execute([$fid, $titre, $message]);
                $alerts[] = ['type'=>'success', 'msg'=>"L'annonce a été diffusée avec succès."];
            } else {
                $alerts[] = ['type'=>'danger', 'msg'=>'La formation sélectionnée est introuvable.'];
            }
        } else {
            $alerts[] = ['type'=>'danger', 'msg'=>'Vérifiez la formation, le titre et le contenu de la notification.'];
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete_notification') {
    if (hash_equals($csrf, $_POST['csrf'] ?? '')) {
        $notificationId = filter_input(INPUT_POST, 'notification_id', FILTER_VALIDATE_INT);
        if ($notificationId) {
            $stmt = $conn->prepare("DELETE FROM notifications WHERE id = ?");
            $stmt->execute([$notificationId]);
            $alerts[] = ['type'=>'info', 'msg'=>"La notification a été retirée de l'historique."];
        }
    }
}

// -------------------- RÉCUPÉRATION DATA --------------------
$formations = $conn->query("SELECT id, titre FROM formations ORDER BY titre ASC")->fetchAll(PDO::FETCH_ASSOC);
$notifications = $conn->query("SELECT n.*, f.titre AS formation FROM notifications n LEFT JOIN formations f ON f.id = n.formation_id ORDER BY n.date_envoi DESC")->fetchAll(PDO::FETCH_ASSOC);

$filtreFormationId = isset($_GET['filtre_formation']) ? (int)$_GET['filtre_formation'] : 0;
$sqlAb = "SELECT a.*, u.nom, u.prenom, u.email FROM abonnements a LEFT JOIN users u ON u.id = a.user_id";
if ($filtreFormationId > 0) {
    $stmtAb = $conn->prepare($sqlAb . " WHERE a.formation_id = ? ORDER BY a.date_abonnement DESC");
    $stmtAb->execute([$filtreFormationId]);
    $abonnements = $stmtAb->fetchAll(PDO::FETCH_ASSOC);
} else {
    $abonnements = $conn->query($sqlAb . " ORDER BY a.date_abonnement DESC")->fetchAll(PDO::FETCH_ASSOC);
}
?>

<style>
    :root {
        --g-blue: #1a73e8;
        --g-blue-hover: #1765cc;
        --g-gray-bg: #f8f9fa;
        --g-border: #dadce0;
        --g-text-main: #202124;
        --g-text-sec: #5f6368;
        --surface: #ffffff;
    }

    body { 
        background-color: var(--g-gray-bg); 
        color: var(--g-text-main); 
        font-family: 'Roboto', sans-serif;
        -webkit-font-smoothing: antialiased;
    }

    h4, .nav-link, .fw-bold { font-family: 'Google Sans', sans-serif; }

    /* Container refinement */
    .container-google { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }

    /* Card & Elevation */
    .g-card { 
        background: var(--surface); 
        border: 1px solid var(--g-border); 
        border-radius: 12px; 
        transition: box-shadow 0.2s ease-in-out;
    }
    .g-card:hover { box-shadow: 0 1px 3px 0 rgba(60,64,67,.30), 0 4px 8px 3px rgba(60,64,67,.15); }

    /* Material Tabs */
    .nav-tabs { border-bottom: 1px solid var(--g-border); gap: 8px; }
    .nav-link { 
        border: none !important; 
        color: var(--g-text-sec); 
        padding: 12px 24px; 
        border-radius: 8px 8px 0 0;
        font-size: 14px;
        position: relative;
    }
    .nav-link:hover { background-color: rgba(26,115,232,0.04); color: var(--g-blue); }
    .nav-link.active { 
        color: var(--g-blue) !important; 
        background: transparent !important;
    }
    .nav-link.active::after {
        content: ""; position: absolute; bottom: 0; left: 15%; width: 70%;
        height: 3px; background: var(--g-blue); border-radius: 3px 3px 0 0;
    }

    /* Input Styling */
    .g-input {
        border: 1px solid var(--g-border);
        border-radius: 6px;
        padding: 12px 16px;
        font-size: 14px;
        color: var(--g-text-main);
    }
    .g-input:focus {
        border-color: var(--g-blue);
        box-shadow: inset 0 0 0 1px var(--g-blue);
        outline: none;
    }

    /* Google Button */
    .btn-g-primary {
        background-color: var(--g-blue);
        color: white;
        border: none;
        border-radius: 24px;
        padding: 10px 24px;
        font-weight: 500;
        font-family: 'Google Sans', sans-serif;
        transition: background 0.2s, box-shadow 0.2s;
    }
    .btn-g-primary:hover { 
        background-color: var(--g-blue-hover); 
        box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
    }

    /* Table refinement */
    .table thead th {
        background: #fdfdfd;
        color: var(--g-text-sec);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        padding: 16px;
        border-top: none;
    }
    .table td { padding: 16px; vertical-align: middle; border-bottom: 1px solid var(--g-border); }

    /* Pill Badges */
    .g-pill {
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
    }
    .pill-active { background: #e6f4ea; color: #1e8e3e; }
    .pill-muted { background: #f1f3f4; color: #5f6368; }

    .alert { border-radius: 8px; border: none; font-size: 14px; }
</style>

<div class="container-google">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
            <h4 class="mb-1">Espace Communication</h4>
            <p class="text-muted small">Gérez les interactions avec les utilisateurs abonnées.</p>
        </div>
        <div class="text-end">
             <span class="badge rounded-pill bg-white text-dark border p-2 px-3">
                <i class="fas fa-user-graduate me-2 text-primary"></i> <?= count($abonnements) ?> Abonnés
             </span>
        </div>
    </div>

    <?php foreach ($alerts as $a): ?>
        <div class="alert alert-<?= e($a['type']) ?> alert-dismissible fade show shadow-sm" role="alert">
            <i class="fas <?= $a['type'] === 'success' ? 'fa-check-circle' : 'fa-info-circle' ?> me-2"></i>
            <?= e($a['msg']) ?>
            <button type="button" class="btn-close" data-jp-dismiss="alert"></button>
        </div>
    <?php endforeach; ?>

    <ul class="nav nav-tabs mb-4 border-0" id="googleTab" role="tablist">
        <li class="nav-item">
            <a class="nav-link active" data-jp-toggle="tab" href="#notify"><i class="fas fa-paper-plane me-2"></i>Diffuser</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-jp-toggle="tab" href="#list"><i class="fas fa-list-ul me-2"></i>Historique</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-jp-toggle="tab" href="#subscribers"><i class="fas fa-users me-2"></i>Annuaire abonnés</a>
        </li>
    </ul>

    <div class="tab-content pt-2">
        <div class="tab-pane fade show active" id="notify">
            <div class="g-card p-4">
                <form method="POST">
                    <input type="hidden" name="action" value="create_notification">
                    <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
                    <div class="row g-4">
                        <div class="col-md-5">
                            <label class="small fw-bold text-muted mb-2 d-block">Formation destinataire</label>
                            <select name="formation_id" class="form-select g-input" required>
                                <option value="">Séléctionnez un programme</option>
                                <?php foreach ($formations as $f): ?>
                                    <option value="<?= (int)$f['id'] ?>"><?= htmlspecialchars($f['titre']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-7">
                            <label class="small fw-bold text-muted mb-2 d-block">Objet de la notification</label>
                            <input type="text" name="titre" class="form-control g-input" minlength="3" maxlength="180" placeholder="Ex: Report du cours de Cyber-sécurité" required>
                        </div>
                        <div class="col-12">
                            <label class="small fw-bold text-muted mb-2 d-block">Message (Contenu détaillé)</label>
                            <textarea name="message" class="form-control g-input" rows="6" minlength="5" maxlength="8000" placeholder="Bonjour chers étudiants..." required></textarea>
                        </div>
                        <div class="col-12 text-end">
                            <button type="reset" class="btn btn-link text-decoration-none text-secondary me-3">Annuler</button>
                            <button type="submit" class="btn-g-primary">Publier l'annonce</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="tab-pane fade" id="list">
            <div class="g-card overflow-hidden">
                <div class="table-responsive">
                    <table class="table mb-0">
                        <thead>
                            <tr>
                                <th>Date d'envoi</th>
                                <th>Formation</th>
                                <th>Aperçu</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($notifications as $n): ?>
                                <tr>
                                    <td class="small text-muted"><?= date('d M Y, H:i', strtotime($n['date_envoi'])) ?></td>
                                    <td><span class="fw-medium"><?= htmlspecialchars($n['formation'] ?? 'Général') ?></span></td>
                                    <td>
                                        <div class="fw-bold small text-dark"><?= htmlspecialchars($n['titre']) ?></div>
                                        <div class="text-muted small text-truncate" style="max-width: 300px;"><?= htmlspecialchars($n['message']) ?></div>
                                    </td>
                                    <td class="text-end">
                                        <form method="POST" class="d-inline" data-confirm="Confirmer la suppression ?">
                                            <input type="hidden" name="action" value="delete_notification">
                                            <input type="hidden" name="notification_id" value="<?= (int)$n['id'] ?>">
                                            <input type="hidden" name="csrf" value="<?= e($csrf) ?>">
                                            <button type="submit" class="btn btn-sm btn-outline-danger border-0 rounded-circle"><i class="fas fa-trash-alt"></i></button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="tab-pane fade" id="subscribers">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <form method="GET" class="d-flex align-items-center bg-white border rounded-pill px-3 py-1">
                    <i class="fas fa-filter small text-muted me-2"></i>
                    <select name="filtre_formation" class="form-select form-select-sm border-0 shadow-none" data-auto-submit style="cursor:pointer">
                        <option value="">Tous les étudiants</option>
                        <?php foreach ($formations as $f): ?>
                            <option value="<?= (int)$f['id'] ?>" <?= ($filtreFormationId === (int)$f['id']) ? 'selected' : '' ?>><?= htmlspecialchars($f['titre']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </form>
            </div>

            <div class="g-card overflow-hidden">
                <div class="table-responsive">
                    <table class="table mb-0">
                        <thead>
                            <tr>
                                <th>Profil Étudiant</th>
                                <th>Parcours</th>
                                <th>Abonnement</th>
                                <th>Inscrit le</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (!empty($abonnements)): ?>
                                <?php foreach ($abonnements as $a): ?>
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <div class="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px; font-weight: bold; color: var(--g-blue);">
                                                    <?= e(strtoupper(substr((string)$a['prenom'], 0, 1))) ?>
                                                </div>
                                                <div>
                                                    <div class="fw-bold"><?= htmlspecialchars($a['prenom'] . ' ' . $a['nom']) ?></div>
                                                    <div class="small text-muted"><?= htmlspecialchars($a['email']) ?></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="small fw-medium text-dark"><?= htmlspecialchars($a['formation_titre'] ?? 'N/A') ?></div>
                                            <div class="text-muted" style="font-size: 11px;"><?= htmlspecialchars($a['formation_niveau'] ?? 'LMD') ?></div>
                                        </td>
                                        <td>
                                            <span class="g-pill <?= $a['notifications_active'] ? 'pill-active' : 'pill-muted' ?>">
                                                <i class="fas <?= $a['notifications_active'] ? 'fa-bell' : 'fa-bell-slash' ?> me-1"></i>
                                                <?= $a['notifications_active'] ? 'Actif' : 'Silencieux' ?>
                                            </span>
                                        </td>
                                        <td class="small text-muted"><?= date('d/m/Y', strtotime($a['date_abonnement'])) ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr><td colspan="4" class="text-center p-5 text-muted">Aucune donnée disponible pour cette sélection.</td></tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
<?php include '../includes/footer_admin.php'; ?>
