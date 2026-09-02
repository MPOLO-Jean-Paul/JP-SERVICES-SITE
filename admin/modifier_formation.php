<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
require_once dirname(__DIR__) . '/includes/connexion_db.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) redirect('/admin/formations');
$stmt = $conn->prepare('SELECT * FROM formations WHERE id = :id LIMIT 1');
$stmt->execute([':id'=>$id]);
$formation = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$formation) redirect('/admin/formations');

$message = '';
$status = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titre = trim((string)($_POST['titre'] ?? ''));
    $description = trim((string)($_POST['description'] ?? ''));
    $prix = filter_var($_POST['prix'] ?? 0, FILTER_VALIDATE_FLOAT);
    $niveau = trim((string)($_POST['niveau'] ?? ''));
    $dateDebut = trim((string)($_POST['date_debut'] ?? ''));
    $duree = trim((string)($_POST['duree'] ?? ''));
    $modules = trim((string)($_POST['modules_liste'] ?? ''));
    $allowedDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    $postedDays = is_array($_POST['jours'] ?? null) ? array_values(array_intersect($allowedDays, array_map('trim', $_POST['jours']))) : [];
    $jours = implode(',', $postedDays);
    $heureDebut = trim((string)($_POST['heure_debut_defaut'] ?? '08:00'));
    $heureFin = trim((string)($_POST['heure_fin_defaut'] ?? '17:00'));
    $newImage = null;

    $dateObject = $dateDebut === '' ? null : DateTimeImmutable::createFromFormat('!Y-m-d', $dateDebut);
    $dateErrors = DateTimeImmutable::getLastErrors();
    $validDate = $dateDebut === '' || ($dateObject !== false && (!is_array($dateErrors) || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0)));
    $validTimes = preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $heureDebut) && preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $heureFin) && $heureDebut < $heureFin;
    if (mb_strlen($titre, 'UTF-8') < 3 || mb_strlen($titre, 'UTF-8') > 180 || mb_strlen($description, 'UTF-8') < 30 || mb_strlen($description, 'UTF-8') > 10000 || mb_strlen($duree, 'UTF-8') < 2 || mb_strlen($duree, 'UTF-8') > 80 || mb_strlen($modules, 'UTF-8') > 5000 || $prix === false || $prix < 0 || $prix > 1000000000 || !in_array($niveau, ['Débutant', 'Intermédiaire', 'Avancé'], true) || !$validDate || !$validTimes || $postedDays === []) {
        $message = 'Veuillez renseigner correctement les champs obligatoires.';
        $status = 'danger';
    } else {
        try {
            if (isset($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $newImage = jp_upload_image($_FILES['image'], 'images/formations', 6 * 1024 * 1024);
            }
            $imagePath = $newImage ?: (string)$formation['image'];
            $update = $conn->prepare('UPDATE formations SET titre=:titre, description=:description, prix=:prix, niveau=:niveau, date_debut=:date_debut, duree=:duree, image=:image, modules_liste=:modules, jours_possibles=:jours, heure_debut_defaut=:heure_debut, heure_fin_defaut=:heure_fin WHERE id=:id');
            $update->execute([':titre'=>$titre, ':description'=>$description, ':prix'=>$prix, ':niveau'=>$niveau, ':date_debut'=>$dateDebut ?: null, ':duree'=>$duree, ':image'=>$imagePath, ':modules'=>$modules, ':jours'=>$jours, ':heure_debut'=>$heureDebut, ':heure_fin'=>$heureFin, ':id'=>$id]);
            if ($newImage && !empty($formation['image']) && $formation['image'] !== 'images/formations/default.jpg') jp_safe_delete_media((string)$formation['image']);
            $stmt->execute([':id'=>$id]);
            $formation = $stmt->fetch(PDO::FETCH_ASSOC);
            $message = 'Modification enregistrée avec succès.';
            $status = 'success';
        } catch (Throwable $exception) {
            if ($newImage) jp_safe_delete_media($newImage);
            error_log('Modification formation: ' . $exception->getMessage());
            $message = 'La formation n’a pas pu être mise à jour.';
            $status = 'danger';
        }
    }
}

$page_title = 'Modifier Formation';
include '../includes/header_admin.php';
?>

<style>
    :root { --g-blue: #1a73e8; --g-border: #dadce0; }
    body { background-color: #f8f9fa; font-family: 'Roboto', sans-serif; }
    .sidebar-g { background: white; border-right: 1px solid var(--g-border); min-height: 100vh; padding-top: 20px; position: sticky; top: 0; }
    .nav-link-g { color: #202124; padding: 12px 24px; display: flex; align-items: center; text-decoration: none; font-weight: 500; border-radius: 0 25px 25px 0; margin-right: 10px; transition: 0.2s; }
    .nav-link-g.active { background-color: #e8f0fe; color: var(--g-blue); }
    .g-card { background: white; border: 1px solid var(--g-border); border-radius: 12px; padding: clamp(20px, 5vw, 32px); }
    .g-input { border: 1px solid var(--g-border); border-radius: 6px; padding: 12px; font-size: 0.95rem; }
    .g-label { font-size: 11px; font-weight: 700; color: #5f6368; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; display: block; }
    .check-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; background: #fbfbfb; padding: 15px; border-radius: 8px; border: 1px solid var(--g-border); }
    .img-preview { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; border: 1px solid var(--g-border); margin-bottom: 10px; }
</style>

<div class="container-fluid">
    <div class="row">
        <nav class="col-md-3 col-lg-2 sidebar-g d-none d-md-block">
            <a href="index.php" class="nav-link-g"><i class="fas fa-chart-line me-2"></i> Dashboard</a>
            <a href="publier_formation.php" class="nav-link-g"><i class="fas fa-plus-circle me-2"></i> Publier</a>
            <a href="gerer_formation.php" class="nav-link-g active"><i class="fas fa-layer-group me-2"></i> Gérer</a>
        </nav>

        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-5 py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 fw-bold mb-0" style="font-family: 'Google Sans';">Modifier la formation</h1>
                <a href="gerer_formation.php" class="btn btn-outline-secondary btn-sm px-3 rounded-pill">Retour</a>
            </div>

            <?php if ($message): ?>
                <div class="alert alert-<?= e($status) ?> border-0 shadow-sm mb-4">
                    <i class="fas fa-info-circle me-2"></i> <?= e($message) ?>
                </div>
            <?php endif; ?>

            <div class="g-card shadow-sm border-0">
                <form action="" method="POST" enctype="multipart/form-data">
                    <div class="row g-4">
                        <div class="col-lg-7">
                            <div class="mb-4">
                                <label class="g-label">Titre</label>
                                <input type="text" class="form-control g-input" name="titre" minlength="3" maxlength="180" value="<?= e($formation['titre']) ?>" required>
                            </div>
                            <div class="mb-4">
                                <label class="g-label">Description</label>
                                <textarea class="form-control g-input" name="description" rows="5" minlength="30" maxlength="10000" required><?= e($formation['description']) ?></textarea>
                            </div>
                            <div class="mb-4">
                                <label class="g-label">Modules détaillés</label>
                                <textarea class="form-control g-input" name="modules_liste" rows="4" maxlength="5000" placeholder="Un module par ligne ou séparé par une virgule"><?= e($formation['modules_liste']) ?></textarea>
                            </div>
                            <div class="mb-2">
                                <label class="g-label">Jours de cours</label>
                                <div class="check-grid">
                                    <?php 
                                    $jours_db = explode(',', $formation['jours_possibles']);
                                    $jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
                                    foreach($jours as $j): ?>
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="jours[]" value="<?= e($j) ?>" id="j_<?= e($j) ?>" <?= in_array($j, $jours_db) ? 'checked' : '' ?>>
                                        <label class="form-check-label small" for="j_<?= e($j) ?>"><?= e($j) ?></label>
                                    </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-5">
                            <div class="p-4 bg-light rounded-4 border mb-4">
                                <h6 class="fw-bold mb-3 small text-primary">PARAMÈTRES</h6>
                                <div class="row g-3">
                                    <div class="col-6">
                                        <label class="g-label">Prix (USD)</label>
                                        <input type="number" step="0.01" min="0" max="1000000000" class="form-control g-input" name="prix" value="<?= e($formation['prix']) ?>" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="g-label">Niveau</label>
                                        <select class="form-select g-input" name="niveau">
                                            <?php foreach(['Débutant', 'Intermédiaire', 'Avancé'] as $n): ?>
                                                <option value="<?= e($n) ?>" <?= $formation['niveau'] == $n ? 'selected' : '' ?>><?= e($n) ?></option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="col-12">
                                        <label class="g-label">Durée affichée</label>
                                        <input type="text" class="form-control g-input" name="duree" minlength="2" maxlength="80" value="<?= e($formation['duree'] ?? '') ?>" placeholder="Ex. 8 semaines" required>
                                    </div>
                                    <div class="col-12">
                                        <label class="g-label">Date de lancement</label>
                                        <input type="date" class="form-control g-input" name="date_debut" value="<?= e($formation['date_debut']) ?>">
                                    </div>
                                </div>
                                <hr class="my-3">
                                <label class="g-label">Horaires</label>
                                <div class="d-flex align-items-center gap-2">
                                    <input type="time" name="heure_debut_defaut" class="form-control g-input" value="<?= e($formation['heure_debut_defaut']) ?>">
                                    <span class="text-muted">à</span>
                                    <input type="time" name="heure_fin_defaut" class="form-control g-input" value="<?= e($formation['heure_fin_defaut']) ?>">
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="g-label">Image de couverture</label>
                                <img src="../<?= e($formation['image']) ?>?t=<?= time() ?>" id="preview" class="img-preview" alt="Aperçu">
                                <input type="file" name="image" id="imageInput" class="form-control g-input" accept="image/jpeg,image/png,image/webp,image/gif">
                            </div>

                            <button type="submit" class="btn btn-primary w-100 py-3 fw-bold shadow-sm" style="background: var(--g-blue); border:none; border-radius: 8px;">
                                <i class="fas fa-save me-2"></i> Mettre à jour la formation
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    </div>
</div>

<script>
    // Aperçu immédiat lors du changement de fichier
    document.getElementById('imageInput').onchange = evt => {
        const [file] = evt.target.files;
        if (file) {
            document.getElementById('preview').src = URL.createObjectURL(file);
        }
    }
</script>

<?php include '../includes/footer_admin.php'; ?>
