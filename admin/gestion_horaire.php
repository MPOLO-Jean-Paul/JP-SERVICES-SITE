<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_once '../includes/connexion_db.php';

// Sécurité Admin
require_admin();

// Suppression par requête POST uniquement
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'supprimer') {
    $idToDelete = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    if ($idToDelete) {
        try {
            $stmt = $conn->prepare('DELETE FROM planning_valide WHERE id = :id');
            $stmt->execute(['id' => $idToDelete]);
            redirect('/admin/horaires?msg=deleted');
        } catch (Throwable $exception) {
            error_log($exception->getMessage());
            $error = 'La suppression a échoué.';
        }
    }
}

try {
    $sql = "SELECT p.*, f.titre as formation_nom, u.nom as user_nom, u.email as user_email, u.photo_profil 
            FROM planning_valide p 
            LEFT JOIN formations f ON p.formation_id = f.id 
            LEFT JOIN users u ON p.user_id = u.id 
            ORDER BY p.id DESC";
    $plannings = $conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    // Stats
    $total = count($plannings);
    $attente = count(array_filter($plannings, fn($p) => $p['statut'] != 'valide'));
    $valides = $total - $attente;

    $groupes = [];
    foreach ($plannings as $p) {
        $key = $p['formation_id'] . '_' . md5($p['horaire_details']);
        if (!isset($groupes[$key])) {
            $groupes[$key] = ['formation' => $p['formation_nom'], 'horaire' => json_decode($p['horaire_details'], true), 'etudiants' => []];
        }
        $groupes[$key]['etudiants'][] = $p['user_nom'];
    }
} catch (Throwable $e) { error_log('Gestion horaires: ' . $e->getMessage()); $error = "Les horaires sont momentanément indisponibles."; }
?>
<?php
$page_title = 'Gestion des horaires';
include '../includes/header_admin.php';
?>
<form id="delete-planning-form" method="post" data-confirm="Voulez-vous vraiment supprimer cet horaire ?" hidden>
    <input type="hidden" name="action" value="supprimer">
    <input type="hidden" name="id" id="delete-planning-id" value="">
</form>
<style>
        :root { 
            --primary: #1a73e8; --primary-light: #e8f0fe;
            --success: #00c853; --warning: #ffab00; --danger: #ff5252;
            --surface: #ffffff; --background: #f8faff;
        }
        body { background-color: var(--background); font-family: 'Plus Jakarta Sans', sans-serif; color: #1f2937; }
        
        /* Header & Breadcrumb */
        .page-header { background: white; border-bottom: 1px solid #edf2f7; padding: 1.5rem 0; margin-bottom: 2rem; }

        /* Modern Stats */
        .stat-card { 
            background: var(--surface); border: 1px solid #f1f5f9; border-radius: 20px; 
            padding: 1.5rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .stat-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }

        /* Custom Tabs */
        .nav-pills-custom { background: #f1f5f9; padding: 5px; border-radius: 12px; }
        .nav-pills-custom .nav-link { 
            border-radius: 10px; color: #64748b; font-weight: 600; font-size: 0.85rem; 
            padding: 8px 20px; border: none; transition: 0.3s;
        }
        .nav-pills-custom .nav-link.active { background: white; color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

        /* Search Bar */
        .search-container { position: relative; width: 100%; max-width: 350px; }
        .search-container input { 
            border-radius: 12px; border: 1px solid #e2e8f0; padding-left: 45px; height: 45px;
            background: white; transition: 0.3s;
        }
        .search-container input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.1); }
        .search-container i { position: absolute; left: 18px; top: 14px; color: #94a3b8; }

        /* Table Style */
        .data-card { background: white; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); overflow: hidden; }
        .table thead th { 
            background: #f8fafc; color: #64748b; font-size: 0.7rem; 
            text-transform: uppercase; letter-spacing: 1px; padding: 1.25rem 1rem; border-bottom: 1px solid #f1f5f9;
        }
        .table tbody tr { border-bottom: 1px solid #f8fafc; }
        .table tbody tr:last-child { border-bottom: none; }

        /* Avatar */
        .user-avatar { width: 40px; height: 40px; border-radius: 12px; object-fit: cover; }
        .status-badge { 
            font-size: 0.65rem; font-weight: 800; padding: 6px 12px; border-radius: 8px; 
            display: inline-flex; align-items: center; gap: 6px; text-transform: uppercase;
        }
        .status-badge.valide { background: #dcfce7; color: #15803d; }
        .status-badge.attente { background: #fef9c3; color: #854d0e; }

        /* Group Cards */
        .group-card { 
            border: 1px solid #f1f5f9; border-radius: 20px; padding: 1.5rem; background: white;
            transition: 0.3s; border-top: 4px solid var(--primary);
        }
        .group-card:hover { transform: scale(1.02); }

        .btn-action-round { 
            width: 34px; height: 34px; border-radius: 10px; display: inline-flex; 
            align-items: center; justify-content: center; background: #f8fafc; 
            color: #64748b; border: 1px solid #e2e8f0; transition: 0.2s;
        }
        .btn-action-round:hover { background: var(--primary); color: white; border-color: var(--primary); }
    </style>
<div class="page-header shadow-sm">
    <div class="container d-flex flex-wrap justify-content-between align-items-center">
        <div>
            <h3 class="fw-bold mb-0" style="font-family:'Google Sans'">Gestion des Plannings</h3>
            <p class="text-muted small mb-0">Suivi et validation des horaires étudiants</p>
        </div>
        <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-primary rounded-pill px-4" data-print-page>
                <i class="fas fa-print me-2"></i>Imprimer
            </button>
        </div>
    </div>
</div>

<main class="container mb-5">
    <div class="row g-4 mb-5">
        <div class="col-md-3 col-sm-6">
            <div class="stat-card">
                <div class="stat-icon bg-primary bg-opacity-10 text-primary mb-3"><i class="fas fa-id-card"></i></div>
                <div class="text-muted small fw-600">Total Demandes</div>
                <div class="h3 fw-bold mb-0"><?= $total ?></div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6">
            <div class="stat-card">
                <div class="stat-icon bg-warning bg-opacity-10 text-warning mb-3"><i class="fas fa-clock-rotate-left"></i></div>
                <div class="text-muted small fw-600">En Attente</div>
                <div class="h3 fw-bold mb-0"><?= $attente ?></div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6">
            <div class="stat-card">
                <div class="stat-icon bg-success bg-opacity-10 text-success mb-3"><i class="fas fa-circle-check"></i></div>
                <div class="text-muted small fw-600">Validés</div>
                <div class="h3 fw-bold mb-0"><?= $valides ?></div>
            </div>
        </div>
        <div class="col-md-3 col-sm-6">
            <div class="stat-card">
                <div class="stat-icon bg-info bg-opacity-10 text-info mb-3"><i class="fas fa-users-viewfinder"></i></div>
                <div class="text-muted small fw-600">Cohortes</div>
                <div class="h3 fw-bold mb-0"><?= count($groupes) ?></div>
            </div>
        </div>
    </div>

    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <ul class="nav nav-pills nav-pills-custom" id="pills-tab" role="tablist">
            <li class="nav-item">
                <button class="nav-link active" data-jp-toggle="pill" data-jp-target="#list-view"><i class="fas fa-list me-2"></i>Vue Liste</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" data-jp-toggle="pill" data-jp-target="#grid-view"><i class="fas fa-th-large me-2"></i>Vue Groupes</button>
            </li>
        </ul>
        <div class="search-container">
            <i class="fas fa-search"></i>
            <input type="text" id="filterInput" class="form-control" placeholder="Étudiant, formation, module...">
        </div>
    </div>

    <div class="tab-content">
        <div class="tab-pane fade show active" id="list-view">
            <div class="data-card">
                <div class="table-responsive">
                    <table class="table align-middle mb-0" id="mainTable">
                        <thead>
                            <tr>
                                <th class="ps-4">Étudiant</th>
                                <th>Programme & Modules</th>
                                <th>Statut</th>
                                <th class="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach($plannings as $row): $v = ($row['statut'] == 'valide'); ?>
                            <tr>
                                <td class="ps-4">
                                    <div class="d-flex align-items-center gap-3">
                                        <img src="<?= e(url('/' . ltrim((string)($row['photo_profil'] ?: 'images/default-avatar.svg'), '/'))) ?>" class="user-avatar shadow-sm border" alt="Photo de profil">
                                        <div>
                                            <div class="fw-bold small text-dark"><?= htmlspecialchars($row['user_nom']) ?></div>
                                            <div class="text-muted extra-small" style="font-size: 0.7rem;"><?= e($row['user_email']) ?></div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="fw-bold small mb-1"><?= e($row['formation_nom']) ?></div>
                                    <span class="text-primary small" style="background: var(--primary-light); padding: 2px 8px; border-radius: 6px; font-size: 0.7rem;">
                                        <i class="fas fa-layer-group me-1"></i><?= e($row['modules_choisis'] ?: 'Modules standards') ?>
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge <?= $v ? 'valide' : 'attente' ?>">
                                        <i class="fas <?= $v ? 'fa-check-circle' : 'fa-circle-notch fa-spin' ?>"></i>
                                        <?= $v ? 'Validé' : 'En attente' ?>
                                    </span>
                                </td>
                                <td class="pe-4 text-end">
                                    <a href="modifier_horaire.php?id=<?= (int)$row['id'] ?>" class="btn-action-round text-primary me-1" title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <button type="button" data-delete-planning-id="<?= (int)$row['id'] ?>" class="btn-action-round text-danger border-danger-subtle" title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="tab-pane fade" id="grid-view">
            <div class="row g-4">
                <?php foreach($groupes as $g): ?>
                <div class="col-lg-4 col-md-6">
                    <div class="group-card shadow-sm h-100">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h6 class="fw-bold mb-1 text-primary"><?= e($g['formation']) ?></h6>
                                <p class="text-muted extra-small mb-0"><?= count($g['etudiants']) ?> inscrits dans ce créneau</p>
                            </div>
                            <span class="badge bg-light text-dark border">Gr. <?= substr(md5($g['formation']),0,4) ?></span>
                        </div>
                        
                        <div class="bg-light rounded-3 p-3 mb-3" style="font-size: 0.8rem;">
                            <?php foreach($g['horaire'] as $j => $t): ?>
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="text-muted fw-500"><?= e($j) ?></span>
                                    <span class="fw-bold text-dark"><?= e($t['debut']) ?> - <?= e($t['fin']) ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>

                        <div class="d-flex flex-wrap gap-1">
                            <?php foreach($g['etudiants'] as $e): ?>
                                <span class="badge bg-white text-muted border fw-normal" style="font-size: 0.65rem;"><?= e($e) ?></span>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</main>



<script>
    // Filtre de recherche intelligent
    document.getElementById('filterInput').addEventListener('keyup', function() {
        let val = this.value.toLowerCase();
        let rows = document.querySelectorAll("#mainTable tbody tr");
        rows.forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(val) ? "" : "none";
        });
    });

</script>
<?php include '../includes/footer_admin.php'; ?>
