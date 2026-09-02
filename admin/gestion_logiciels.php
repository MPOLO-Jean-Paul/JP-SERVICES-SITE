<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';
require_once dirname(__DIR__) . '/app/logiciel_helpers.php';
require_admin();
require_once '../includes/connexion_db.php';

$message = '';
$status = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'ajouter') {
        $nom = trim((string)($_POST['nom'] ?? ''));
        $description = trim((string)($_POST['description'] ?? ''));
        $version = trim((string)($_POST['version'] ?? ''));
        $plateforme = trim((string)($_POST['plateforme'] ?? ''));
        $licence = trim((string)($_POST['licence'] ?? '')) ?: 'Gratuit';
        $lienExterne = trim((string)($_POST['lien_externe'] ?? ''));
        $categorieId = filter_input(INPUT_POST, 'categorie_id', FILTER_VALIDATE_INT) ?: null;
        $fichierPath = '';
        $imagePath = '';
        $taille = 0;

        if (isset($_FILES['fichier']) && ($_FILES['fichier']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            try {
                $fichierPath = jp_upload_software($_FILES['fichier']);
                $taille = (int)$_FILES['fichier']['size'];
            } catch (RuntimeException $exception) {
                $message = $exception->getMessage();
                $status = 'danger';
            }
        }
        if ($message === '' && isset($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            try {
                $imagePath = jp_upload_image($_FILES['image'], 'images/logiciels', 4 * 1024 * 1024);
            } catch (RuntimeException $exception) {
                $message = $exception->getMessage();
                $status = 'danger';
            }
        }
        if ($message === '' && $lienExterne !== '' && (!filter_var($lienExterne, FILTER_VALIDATE_URL) || !preg_match('~^https?://~i', $lienExterne))) {
            $message = 'Le lien externe doit être une URL valide (https://…).';
            $status = 'warning';
        }
        if ($message === '' && $fichierPath === '' && $lienExterne === '') {
            $message = 'Ajoutez un fichier à téléverser ou un lien externe de téléchargement.';
            $status = 'warning';
        }
        if ($message === '' && (mb_strlen($nom, 'UTF-8') < 2 || mb_strlen($nom, 'UTF-8') > 180 || mb_strlen($description, 'UTF-8') > 10000 || mb_strlen($version, 'UTF-8') > 40 || mb_strlen($plateforme, 'UTF-8') > 120 || mb_strlen($licence, 'UTF-8') > 60)) {
            $message = 'Vérifiez le nom, la version, la plateforme et la description.';
            $status = 'warning';
        }
        if ($message === '') {
            try {
                $stmt = $conn->prepare('INSERT INTO logiciels (categorie_id, nom, description, version, taille_octets, plateforme, licence, fichier, lien_externe, image) VALUES (:cat, :nom, :description, :version, :taille, :plateforme, :licence, :fichier, :lien, :image)');
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
                ]);
                redirect('/admin/logiciels?success=1');
            } catch (Throwable $exception) {
                jp_delete_software_file($fichierPath);
                jp_safe_delete_media($imagePath !== '' ? $imagePath : null, ['images/logiciels']);
                error_log('Ajout logiciel: ' . $exception->getMessage());
                $message = 'Le logiciel n’a pas pu être enregistré.';
                $status = 'danger';
            }
        } else {
            jp_delete_software_file($fichierPath);
            jp_safe_delete_media($imagePath !== '' ? $imagePath : null, ['images/logiciels']);
        }
    }

    if ($action === 'supprimer') {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        if ($id) {
            $stmt = $conn->prepare('SELECT fichier, image FROM logiciels WHERE id = :id');
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $conn->prepare('DELETE FROM logiciels WHERE id = :id')->execute([':id' => $id]);
            if ($row) {
                jp_delete_software_file((string)$row['fichier']);
                jp_safe_delete_media((string)$row['image'], ['images/logiciels']);
            }
            redirect('/admin/logiciels?deleted=1');
        }
    }

    if ($action === 'basculer_statut') {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        if ($id) {
            $conn->prepare('UPDATE logiciels SET statut = IF(statut = "publie", "brouillon", "publie") WHERE id = :id')->execute([':id' => $id]);
            redirect('/admin/logiciels?status=1');
        }
    }

    if ($action === 'ajouter_categorie') {
        $nom = trim((string)($_POST['categorie_nom'] ?? ''));
        $icone = trim((string)($_POST['categorie_icone'] ?? '')) ?: 'fa-box-open';
        if (mb_strlen($nom, 'UTF-8') >= 2 && mb_strlen($nom, 'UTF-8') <= 120 && preg_match('/^fa-[a-z0-9-]+$/', $icone)) {
            $slug = strtolower(trim((string)preg_replace('/[^a-z0-9]+/', '-', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $nom) ?: $nom), '-'));
            if ($slug === '') {
                $slug = 'categorie-' . bin2hex(random_bytes(3));
            }
            try {
                $conn->prepare('INSERT INTO logiciel_categories (nom, slug, icone, ordre) VALUES (:nom, :slug, :icone, 99)')->execute([':nom' => $nom, ':slug' => $slug, ':icone' => $icone]);
                redirect('/admin/logiciels?category=1');
            } catch (Throwable $exception) {
                error_log('Ajout catégorie logiciel: ' . $exception->getMessage());
                $message = 'Cette catégorie existe déjà ou n’a pas pu être créée.';
                $status = 'warning';
            }
        }
    }

    if ($action === 'supprimer_categorie') {
        $id = filter_input(INPUT_POST, 'categorie_id', FILTER_VALIDATE_INT);
        if ($id) {
            $conn->prepare('DELETE FROM logiciel_categories WHERE id = :id')->execute([':id' => $id]);
            redirect('/admin/logiciels?category_deleted=1');
        }
    }
}

$logiciels = $conn->query('SELECT l.*, c.nom AS categorie_nom FROM logiciels l LEFT JOIN logiciel_categories c ON c.id = l.categorie_id ORDER BY l.mis_a_jour DESC')->fetchAll(PDO::FETCH_ASSOC);
$categories = $conn->query('SELECT c.*, (SELECT COUNT(*) FROM logiciels l WHERE l.categorie_id = c.id) AS total FROM logiciel_categories c ORDER BY c.ordre ASC, c.nom ASC')->fetchAll(PDO::FETCH_ASSOC);

$page_title = 'Gestion des logiciels';
include '../includes/header_admin.php';
?>
<style>
    .jp-admin-soft-grid { display: grid; grid-template-columns: minmax(300px, 380px) 1fr; gap: 24px; align-items: start; }
    @media (max-width: 960px) { .jp-admin-soft-grid { grid-template-columns: 1fr; } }
    .jp-admin-card { background: var(--jp-panel, #fff); border: 1px solid var(--jp-classroom-line, #e5e0ef); border-radius: 12px; padding: 22px; }
    .jp-admin-card h2 { margin: 0 0 18px; font-size: 1.05rem; }
    .jp-soft-table { width: 100%; border-collapse: collapse; font-size: .88rem; }
    .jp-soft-table th { text-align: left; padding: 10px 12px; font-size: .72rem; text-transform: uppercase; letter-spacing: .06em; color: var(--jp-classroom-copy, #5f5868); border-bottom: 1px solid var(--jp-classroom-line, #e5e0ef); }
    .jp-soft-table td { padding: 12px; border-bottom: 1px solid var(--jp-classroom-line, #e5e0ef); vertical-align: middle; }
    .jp-soft-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 99px; font-size: .72rem; font-weight: 700; }
    .jp-soft-badge.is-on { background: #e5f6ec; color: #1e7a3c; }
    .jp-soft-badge.is-off { background: #f1f0f5; color: #6b6474; }
    .jp-cat-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .jp-cat-chips span { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border: 1px solid var(--jp-classroom-line, #e5e0ef); border-radius: 99px; font-size: .78rem; }
    .jp-cat-chips form { display: inline; }
    .jp-cat-chips button { border: 0; background: none; color: #c0392b; cursor: pointer; padding: 0; }
    .jp-admin-form label { display: block; margin-bottom: 12px; font-size: .8rem; font-weight: 700; color: var(--jp-classroom-copy, #5f5868); }
    .jp-admin-form input, .jp-admin-form select, .jp-admin-form textarea { width: 100%; margin-top: 5px; }
    .jp-admin-form .jp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 640px) { .jp-admin-form .jp-row { grid-template-columns: 1fr; } }
</style>

<div class="jp-admin-page">
    <div class="jp-admin-page-head">
        <div><h1 data-testid="admin-logiciels-title">Logiciels</h1><p class="text-muted">Publiez les fichiers téléchargeables de l’onglet Logiciels : fiches, catégories, versions et statistiques.</p></div>
        <a class="jp-btn jp-btn-secondary" href="<?= e(url('/logiciels')) ?>" target="_blank" rel="noopener"><i class="fas fa-arrow-up-right-from-square"></i> Voir la page publique</a>
    </div>

    <?php if (isset($_GET['success'])): ?><div class="alert alert-success" data-testid="admin-logiciels-flash">Logiciel publié avec succès.</div><?php endif; ?>
    <?php if (isset($_GET['deleted'])): ?><div class="alert alert-success" data-testid="admin-logiciels-flash">Logiciel supprimé.</div><?php endif; ?>
    <?php if (isset($_GET['status'])): ?><div class="alert alert-success" data-testid="admin-logiciels-flash">Statut mis à jour.</div><?php endif; ?>
    <?php if (isset($_GET['category'])): ?><div class="alert alert-success" data-testid="admin-logiciels-flash">Catégorie ajoutée.</div><?php endif; ?>
    <?php if (isset($_GET['category_deleted'])): ?><div class="alert alert-success" data-testid="admin-logiciels-flash">Catégorie supprimée.</div><?php endif; ?>
    <?php if ($message !== ''): ?><div class="alert alert-<?= e($status) ?>" data-testid="admin-logiciels-flash"><?= e($message) ?></div><?php endif; ?>

    <div class="jp-admin-soft-grid">
        <div>
            <form class="jp-admin-card jp-admin-form" method="post" enctype="multipart/form-data" data-testid="admin-logiciel-form">
                <h2><i class="fas fa-plus"></i> Nouveau logiciel</h2>
                <input type="hidden" name="action" value="ajouter">
                <label>Nom du logiciel
                    <input type="text" name="nom" minlength="2" maxlength="180" required data-testid="admin-logiciel-nom">
                </label>
                <label>Description
                    <textarea name="description" rows="4" maxlength="10000" placeholder="À quoi sert ce logiciel, pour quelle formation…"></textarea>
                </label>
                <div class="jp-row">
                    <label>Version
                        <input type="text" name="version" maxlength="40" placeholder="Ex. 2.4.1">
                    </label>
                    <label>Licence
                        <input type="text" name="licence" maxlength="60" value="Gratuit">
                    </label>
                </div>
                <div class="jp-row">
                    <label>Catégorie
                        <select name="categorie_id" data-testid="admin-logiciel-categorie">
                            <option value="">Sans catégorie</option>
                            <?php foreach ($categories as $category): ?><option value="<?= (int)$category['id'] ?>"><?= e($category['nom']) ?></option><?php endforeach; ?>
                        </select>
                    </label>
                    <label>Plateforme
                        <input type="text" name="plateforme" maxlength="120" placeholder="Ex. Windows, Android, Web…">
                    </label>
                </div>
                <label>Fichier à téléverser (zip, apk, exe, msi, dmg, pkg, deb, rar, 7z, pdf — 50 Mo max)
                    <input type="file" name="fichier" accept=".zip,.apk,.exe,.msi,.dmg,.pkg,.deb,.rar,.7z,.pdf" data-testid="admin-logiciel-fichier">
                </label>
                <label>Ou lien externe de téléchargement
                    <input type="url" name="lien_externe" maxlength="500" placeholder="https://…">
                </label>
                <label>Image d’illustration (facultatif)
                    <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif">
                </label>
                <button class="jp-btn jp-btn-primary" type="submit" data-testid="admin-logiciel-submit"><i class="fas fa-cloud-arrow-up"></i> Publier le logiciel</button>
            </form>

            <div class="jp-admin-card" style="margin-top:20px">
                <h2><i class="fas fa-folder-tree"></i> Catégories</h2>
                <form class="jp-admin-form" method="post">
                    <input type="hidden" name="action" value="ajouter_categorie">
                    <div class="jp-row">
                        <label>Nom
                            <input type="text" name="categorie_nom" minlength="2" maxlength="120" required data-testid="admin-categorie-nom">
                        </label>
                        <label>Icône (FontAwesome)
                            <input type="text" name="categorie_icone" maxlength="60" value="fa-box-open" pattern="fa-[a-z0-9-]+">
                        </label>
                    </div>
                    <button class="jp-btn jp-btn-secondary" type="submit"><i class="fas fa-plus"></i> Ajouter</button>
                </form>
                <div class="jp-cat-chips">
                    <?php foreach ($categories as $category): ?>
                    <span><i class="fas <?= e($category['icone']) ?>"></i> <?= e($category['nom']) ?> (<?= (int)$category['total'] ?>)
                        <form method="post" data-confirm="Supprimer cette catégorie ? Les logiciels associés seront conservés sans catégorie.">
                            <input type="hidden" name="action" value="supprimer_categorie">
                            <input type="hidden" name="categorie_id" value="<?= (int)$category['id'] ?>">
                            <button type="submit" aria-label="Supprimer la catégorie <?= e($category['nom']) ?>"><i class="fas fa-xmark"></i></button>
                        </form>
                    </span>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <div class="jp-admin-card">
            <h2><i class="fas fa-list"></i> Logiciels publiés (<?= count($logiciels) ?>)</h2>
            <div style="overflow-x:auto">
                <table class="jp-soft-table">
                    <thead><tr><th>Logiciel</th><th>Catégorie</th><th>Taille</th><th><i class="fas fa-arrow-down"></i></th><th>Statut</th><th style="text-align:right">Actions</th></tr></thead>
                    <tbody>
                    <?php foreach ($logiciels as $logiciel): ?>
                        <tr data-testid="admin-logiciel-row-<?= (int)$logiciel['id'] ?>">
                            <td>
                                <strong><?= e($logiciel['nom']) ?></strong><?= $logiciel['version'] !== '' ? ' <small>v' . e($logiciel['version']) . '</small>' : '' ?>
                                <br><small class="text-muted"><?= $logiciel['fichier'] !== '' ? 'Fichier hébergé' : 'Lien externe' ?> · <?= e(jp_logiciel_date_label($logiciel['mis_a_jour'])) ?></small>
                            </td>
                            <td><?= e($logiciel['categorie_nom'] ?? '—') ?></td>
                            <td><?= e(jp_logiciel_size($logiciel['taille_octets'])) ?></td>
                            <td><?= (int)$logiciel['telechargements'] ?></td>
                            <td><span class="jp-soft-badge <?= $logiciel['statut'] === 'publie' ? 'is-on' : 'is-off' ?>"><?= $logiciel['statut'] === 'publie' ? 'Publié' : 'Brouillon' ?></span></td>
                            <td style="text-align:right;white-space:nowrap">
                                <form method="post" style="display:inline">
                                    <input type="hidden" name="action" value="basculer_statut">
                                    <input type="hidden" name="id" value="<?= (int)$logiciel['id'] ?>">
                                    <button class="jp-icon-btn" type="submit" title="<?= $logiciel['statut'] === 'publie' ? 'Passer en brouillon' : 'Publier' ?>"><i class="fas <?= $logiciel['statut'] === 'publie' ? 'fa-eye-slash' : 'fa-eye' ?>"></i></button>
                                </form>
                                <a class="jp-icon-btn" href="<?= e(app_route('/admin/logiciel/modifier', ['id' => (int)$logiciel['id']])) ?>" title="Modifier"><i class="fas fa-pen"></i></a>
                                <form method="post" style="display:inline" data-confirm="Supprimer définitivement ce logiciel et son fichier ?">
                                    <input type="hidden" name="action" value="supprimer">
                                    <input type="hidden" name="id" value="<?= (int)$logiciel['id'] ?>">
                                    <button class="jp-icon-btn jp-danger" type="submit" title="Supprimer"><i class="fas fa-trash"></i></button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    <?php if ($logiciels === []): ?><tr><td colspan="6" style="text-align:center;padding:32px" class="text-muted">Aucun logiciel publié pour le moment.</td></tr><?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer_admin.php'; ?>
