<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_once '../includes/connexion_db.php';

// Sécurité
require_admin();

$message = '';

// Les suppressions sont traitées par une route POST dédiée.

// Récupération
$stmt = $conn->query("SELECT * FROM formations ORDER BY date_debut ASC, id DESC");
$formations = $stmt->fetchAll(PDO::FETCH_ASSOC);

$page_title = "Gérer les formations";
include '../includes/header_admin.php';
?>

<style>
    :root {
        --g-blue: #1a73e8;
        --g-red: #d93025;
        --g-gray-bg: #f8f9fa;
        --g-border: #dadce0;
        --g-text-dark: #202124;
        --g-success: #1e8e3e;
    }

    body { background-color: var(--g-gray-bg); font-family: 'Roboto', sans-serif; color: var(--g-text-dark); }
    h1, .g-font { font-family: 'Google Sans', sans-serif; }

    .sidebar-g { background: white; border-right: 1px solid var(--g-border); min-height: 100vh; padding-top: 20px; }
    .nav-link-g { color: #5f6368; padding: 12px 24px; display: flex; align-items: center; text-decoration: none; font-weight: 500; transition: 0.2s; border-radius: 0 25px 25px 0; margin-right: 10px; }
    .nav-link-g:hover { background-color: #f1f3f4; color: var(--g-text-dark); }
    .nav-link-g.active { background-color: #e8f0fe; color: var(--g-blue); }

    @media (max-width: 767.98px) {
        .sidebar-g { min-height: auto; border-right: none; border-bottom: 1px solid var(--g-border); padding: 0; overflow-x: auto; }
        .nav-container-mobile { display: flex; flex-direction: row; white-space: nowrap; }
        .nav-link-g { border-radius: 0; margin-right: 0; border-bottom: 3px solid transparent; }
        .nav-link-g.active { border-bottom-color: var(--g-blue); background: transparent; }
    }

    .g-table-card { background: white; border: 1px solid var(--g-border); border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15); }
    .table thead th { 
        background-color: #ffffff; 
        color: #5f6368; 
        font-size: 11px; 
        text-transform: uppercase; 
        letter-spacing: 0.8px;
        font-weight: 700;
        border-bottom: 1px solid var(--g-border);
        padding: 20px 15px;
    }
    .table tbody td { padding: 18px 15px; vertical-align: middle; border-bottom: 1px solid #f1f3f4; }
    
    .img-preview { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 1px solid var(--g-border); background: #eee; }
    
    .btn-action { 
        width: 36px; height: 36px;
        border-radius: 50%; 
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: 0.2s;
        border: none;
        text-decoration: none;
    }
    .btn-edit { color: #5f6368; background: transparent; }
    .btn-edit:hover { background: #f1f3f4; color: var(--g-blue); }
    .btn-delete { color: #5f6368; background: transparent; }
    .btn-delete:hover { background: #feeef0; color: var(--g-red); }

    .badge-niveau {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        background: #f1f3f4;
        color: #5f6368;
    }

    .price-tag { color: var(--g-success); font-weight: 700; font-size: 15px; }
</style>

<div class="container-fluid">
    <div class="row">
        <nav class="col-md-3 col-lg-2 sidebar-g">
            <div class="nav-container-mobile">
                <a href="index.php" class="nav-link-g">
                    <i class="fas fa-chart-line me-3"></i> <span>Dashboard</span>
                </a>
                <a href="publier_formation.php" class="nav-link-g">
                    <i class="fas fa-plus-circle me-3"></i> <span>Nouvelle formation</span>
                </a>
                <a href="gerer_formation.php" class="nav-link-g active">
                    <i class="fas fa-layer-group me-3"></i> <span>Catalogue</span>
                </a>
            </div>
        </nav>

        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-5 py-4">
            <div class="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4">
                <div>
                    <h1 class="h3 fw-bold mb-1">Catalogue des Formations</h1>
                    <p class="text-muted small">Gérez les programmes d'études et les tarifs</p>
                </div>
                <a href="publier_formation.php" class="btn btn-primary d-flex align-items-center shadow-sm" style="border-radius: 24px; padding: 10px 24px; font-weight: 500;">
                    <i class="fas fa-plus me-2"></i> Ajouter une formation
                </a>
            </div>

            <?= e($message) ?>

            <div class="g-table-card">
                <?php if (count($formations) > 0): ?>
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Aperçu</th>
                                    <th>Détails de la Formation</th>
                                    <th>Planning</th>
                                    <th>Investissement</th>
                                    <th class="text-end">Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($formations as $f): ?>
                                    <tr>
                                        <td style="width: 80px;">
                                            <img src="../<?= htmlspecialchars($f['image']) ?>" class="img-preview" alt="Thumbnail">
                                        </td>
                                        <td>
                                            <div class="fw-bold text-dark mb-1"><?= htmlspecialchars($f['titre']) ?></div>
                                            <span class="badge-niveau"><?= htmlspecialchars($f['niveau']) ?></span>
                                        </td>
                                        <td>
                                            <div class="small mb-1"><i class="far fa-clock me-2 text-muted"></i><?= htmlspecialchars($f['duree']) ?></div>
                                            <div class="small text-muted"><i class="far fa-calendar-alt me-2"></i>Dès le <?= date('d/m/Y', strtotime($f['date_debut'])) ?></div>
                                        </td>
                                        <td>
                                            <div class="price-tag"><?= number_format($f['prix'], 2, ',', ' ') ?> $</div>
                                        </td>
                                        <td class="text-end">
                                            <div class="d-flex justify-content-end gap-1">
                                                <a href="modifier_formation.php?id=<?= (int)$f['id'] ?>" class="btn-action btn-edit" title="Modifier">
                                                    <i class="fas fa-pencil-alt"></i>
                                                </a>
                                                <form action="supprimer_formation.php" method="post" class="d-inline" data-confirm="Supprimer définitivement cette formation ?">
                                                    <input type="hidden" name="id" value="<?= (int)$f['id'] ?>">
                                                    <button type="submit" class="btn-action btn-delete" title="Supprimer"><i class="fas fa-trash"></i></button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="p-5 text-center">
                        <h5 class="text-muted">Le catalogue est vide</h5>
                    </div>
                <?php endif; ?>
            </div>
        </main>
    </div>
</div>

<?php include '../includes/footer_admin.php'; ?>
