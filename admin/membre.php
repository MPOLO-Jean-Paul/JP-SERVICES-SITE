<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_once '../includes/connexion_db.php';
require_admin();
$page_title = "Gestion membres";

// Traitement de l'ajout d'un membre
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ajouter'])) {
    $nom = trim((string)($_POST['nom'] ?? ''));
    $role = trim((string)($_POST['role'] ?? ''));
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    $linkedin = trim((string)($_POST['linkedin'] ?? ''));
    $ordre = filter_var($_POST['ordre'] ?? 0, FILTER_VALIDATE_INT);
    $photo = 'default-avatar.svg';
    $uploaded = null;

    $linkedinHost = strtolower((string)(parse_url($linkedin, PHP_URL_HOST) ?? ''));
    if ($nom === '' || $role === '' || mb_strlen($nom, 'UTF-8') > 120 || mb_strlen($role, 'UTF-8') > 120 || mb_strlen($email, 'UTF-8') > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL) || $ordre === false || $ordre < 0 || $ordre > 1000 || ($linkedin !== '' && (!filter_var($linkedin, FILTER_VALIDATE_URL) || !in_array($linkedinHost, ['linkedin.com', 'www.linkedin.com'], true)))) {
        $message = 'Veuillez vérifier les informations du membre.';
    } else {
        try {
            if (isset($_FILES['photo']) && ($_FILES['photo']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $uploaded = jp_upload_image($_FILES['photo'], 'admin/images', 4 * 1024 * 1024);
                $photo = basename($uploaded);
            }
            $stmt = $conn->prepare('INSERT INTO equipe (nom, role, email, linkedin, photo, ordre) VALUES (:nom, :role, :email, :linkedin, :photo, :ordre)');
            $stmt->execute([':nom'=>$nom, ':role'=>$role, ':email'=>$email, ':linkedin'=>$linkedin, ':photo'=>$photo, ':ordre'=>$ordre]);
            redirect('/admin/membres?success=1');
        } catch (RuntimeException $exception) {
            if ($uploaded) jp_safe_delete_media($uploaded);
            $message = $exception->getMessage();
        } catch (Throwable $exception) {
            if ($uploaded) jp_safe_delete_media($uploaded);
            error_log('Ajout membre: ' . $exception->getMessage());
            $message = 'Le membre n’a pas pu être enregistré.';
        }
    }
}

// Traitement de la suppression par POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'supprimer') {
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    if ($id) {
        $stmt = $conn->prepare('SELECT photo FROM equipe WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $photo = $stmt->fetchColumn();
        $conn->prepare('DELETE FROM equipe WHERE id = :id')->execute(['id' => $id]);
        if (is_string($photo) && $photo !== 'default-avatar.svg') {
            jp_safe_delete_media('admin/images/' . basename($photo));
        }
        redirect('/admin/membres?deleted=1');
    }
}

$membres = $conn->query("SELECT * FROM equipe ORDER BY ordre ASC")->fetchAll();
?>
<?php
$page_title = 'Gestion des membres';
include '../includes/header_admin.php';
?>
<style>
        body { background-color: #f4f7f6; font-family: 'Plus Jakarta Sans', sans-serif; }
        .admin-card { border: none; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .member-thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 10px; }
        .table { background: white; border-radius: 15px; overflow: hidden; }
    </style>
<div class="container py-5">
    <?php if(isset($_GET['success'])): ?>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            Membre ajouté avec succès !
            <button type="button" class="btn-close" data-jp-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="fas fa-users me-2 text-primary"></i> Gestion de l'Équipe</h2>
    </div>

    <div class="row g-4">
        <div class="col-lg-4">
            <div class="card admin-card p-4">
                <h5 class="mb-4">Ajouter un membre</h5>
                <form action="" method="POST" enctype="multipart/form-data">
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Nom complet</label>
                        <input type="text" name="nom" class="form-control" maxlength="120" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Rôle / Poste</label>
                        <input type="text" name="role" class="form-control" maxlength="120" required placeholder="ex: Développeur Senior">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Email professionnel</label>
                        <input type="email" name="email" class="form-control" maxlength="254" required placeholder="nom@jp-services.com">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Lien LinkedIn</label>
                        <input type="url" name="linkedin" class="form-control" maxlength="500" placeholder="https://linkedin.com/in/...">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Photo de profil</label>
                        <input type="file" name="photo" class="form-control" accept="image/jpeg,image/png,image/webp,image/gif">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Ordre d'affichage</label>
                        <input type="number" name="ordre" class="form-control" min="0" max="1000" value="0">
                    </div>
                    <button type="submit" name="ajouter" class="btn btn-primary w-100 shadow-sm">Enregistrer le membre</button>
                </form>
            </div>
        </div>

        <div class="col-lg-8">
            <div class="card admin-card p-4">
                <h5 class="mb-4">Membres actuels</h5>
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Photo</th>
                                <th>Informations</th>
                                <th>Contacts</th>
                                <th class="text-center">Ordre</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach($membres as $m): ?>
                            <tr>
                                <td>
                                    <img src="images/<?= e($m['photo']) ?>" class="member-thumb" data-fallback-src="<?= e(url('/images/default-avatar.svg')) ?>" alt="Photo de <?= e($m['nom']) ?>">
                                </td>
                                <td>
                                    <div class="fw-bold"><?= htmlspecialchars($m['nom']) ?></div>
                                    <small class="text-primary"><?= htmlspecialchars($m['role']) ?></small>
                                </td>
                                <td>
                                    <?php if($m['email']): ?><i class="fas fa-at text-muted me-2" title="<?= e($m['email']) ?>"></i><?php endif; ?>
                                    <?php if($m['linkedin']): ?><i class="fab fa-linkedin-in text-muted" title="LinkedIn"></i><?php endif; ?>
                                </td>
                                <td class="text-center"><span class="badge bg-light text-dark"><?= (int)$m['ordre'] ?></span></td>
                                <td class="text-end">
                                    <form action="membre.php" method="post" class="d-inline" data-confirm="Supprimer ce membre ?">
                                        <input type="hidden" name="action" value="supprimer">
                                        <input type="hidden" name="id" value="<?= (int)$m['id'] ?>">
                                        <button type="submit" class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
<?php include '../includes/footer_admin.php'; ?>
