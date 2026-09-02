<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
require_once dirname(__DIR__) . '/includes/connexion_db.php';

$message = '';
$status = 'info';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['publier'])) {
    $titre = trim((string)($_POST['titre'] ?? ''));
    $description = trim((string)($_POST['description'] ?? ''));
    $prix = filter_var($_POST['prix'] ?? 0, FILTER_VALIDATE_FLOAT);
    $niveau = trim((string)($_POST['niveau'] ?? 'Débutant'));
    $dateDebut = trim((string)($_POST['date_debut'] ?? ''));
    $duree = trim((string)($_POST['duree'] ?? ''));
    $modules = is_array($_POST['modules'] ?? null) ? array_slice(array_values(array_unique(array_filter(array_map('trim', $_POST['modules'])))), 0, 30) : [];
    $allowedDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    $jours = is_array($_POST['jours'] ?? null) ? array_values(array_intersect($allowedDays, array_map('trim', $_POST['jours']))) : [];
    $firstDay = $jours[0] ?? '';
    $heureDebut = trim((string)($_POST['heure_debut_defaut'] ?? ($firstDay !== '' ? ($_POST['h_start_' . $firstDay] ?? '08:00') : '08:00')));
    $heureFin = trim((string)($_POST['heure_fin_defaut'] ?? ($firstDay !== '' ? ($_POST['h_end_' . $firstDay] ?? '17:00') : '17:00')));
    $imagePath = 'images/formations/default.jpg';
    $uploaded = null;

    $dateObject = DateTimeImmutable::createFromFormat('!Y-m-d', $dateDebut);
    $dateErrors = DateTimeImmutable::getLastErrors();
    $validDate = $dateObject !== false && (!is_array($dateErrors) || ($dateErrors['warning_count'] === 0 && $dateErrors['error_count'] === 0));
    $validTimes = preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $heureDebut) && preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $heureFin) && $heureDebut < $heureFin;
    $validModules = count($modules) > 0 && !array_filter($modules, static fn (string $module): bool => mb_strlen($module, 'UTF-8') > 180);

    if (mb_strlen($titre, 'UTF-8') < 3 || mb_strlen($titre, 'UTF-8') > 180 || mb_strlen($description, 'UTF-8') < 30 || mb_strlen($description, 'UTF-8') > 10000 || $prix === false || $prix < 0 || $prix > 1000000000 || mb_strlen($duree, 'UTF-8') < 2 || mb_strlen($duree, 'UTF-8') > 80 || !in_array($niveau, ['Débutant', 'Intermédiaire', 'Avancé'], true) || !$validDate || !$validTimes || !$validModules || $jours === []) {
        $message = 'Vérifiez le titre, la description, le programme, les jours, les horaires, la durée et le tarif.';
        $status = 'danger';
    } else {
        try {
            if (isset($_FILES['image']) && ($_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $uploaded = jp_upload_image($_FILES['image'], 'images/formations', 6 * 1024 * 1024);
                $imagePath = $uploaded;
            }
            $stmt = $conn->prepare('INSERT INTO formations (titre, description, prix, niveau, date_debut, duree, image, modules_liste, jours_possibles, heure_debut_defaut, heure_fin_defaut) VALUES (:titre, :description, :prix, :niveau, :date_debut, :duree, :image, :modules, :jours, :heure_debut, :heure_fin)');
            $stmt->execute([
                ':titre'=>$titre, ':description'=>$description, ':prix'=>$prix, ':niveau'=>$niveau,
                ':date_debut'=>$dateDebut ?: null, ':duree'=>$duree, ':image'=>$imagePath,
                ':modules'=>implode(',', $modules), ':jours'=>implode(',', $jours),
                ':heure_debut'=>$heureDebut, ':heure_fin'=>$heureFin,
            ]);
            $message = 'Formation enregistrée avec succès.';
            $status = 'success';
            require_once dirname(__DIR__) . '/app/seo_ping.php';
            $newFormationId = (int)$conn->lastInsertId();
            $ping = jp_indexnow_ping(['/formation?id=' . $newFormationId, '/formations', '/sitemap.xml']);
            if ($ping['ok']) {
                $message .= ' Moteurs de recherche notifiés (IndexNow + sitemap).';
            }
        } catch (Throwable $exception) {
            if ($uploaded) jp_safe_delete_media($uploaded);
            error_log('Publication formation: ' . $exception->getMessage());
            $message = 'La formation n’a pas pu être enregistrée.';
            $status = 'danger';
        }
    }
}

try {
    $all_formations = $conn->query('SELECT * FROM formations ORDER BY id DESC LIMIT 6')->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Liste formations: ' . $exception->getMessage());
    $all_formations = [];
}

include '../includes/header_admin.php';
?>

<style>
    :root { 
        --google-blue: #1a73e8; 
        --google-gray: #5f6368;
        --google-bg: #f8f9fa;
        --surface: #ffffff;
        --border: #dadce0;
        --text-main: #202124;
    }

    body { background-color: var(--google-bg); font-family: 'Roboto', sans-serif; color: var(--text-main); }
    .g-sans { font-family: 'Google Sans', sans-serif; }

    .g-card { 
        background: var(--surface); 
        border: 1px solid var(--border); 
        border-radius: 16px; 
        padding: 30px; 
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .g-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }

    .g-input { 
        border: 1px solid var(--border); 
        border-radius: 8px; 
        padding: 12px 16px; 
        font-size: 14px;
        background: #fff;
        transition: all 0.2s;
    }
    .g-input:focus { 
        border-color: var(--google-blue); 
        box-shadow: 0 0 0 3px rgba(26,115,232,0.15);
        outline: none;
    }

    .g-label { 
        font-size: 13px; 
        font-weight: 500; 
        color: var(--google-gray); 
        margin-bottom: 8px; 
        display: block;
    }

    .day-pill {
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: 0.2s;
    }
    .day-pill:hover { background: #f1f3f4; }
    .day-pill:has(input:checked) {
        border-color: var(--google-blue);
        background-color: #e8f0fe;
        color: var(--google-blue);
    }

    .btn-publish {
        background: var(--google-blue);
        color: white;
        border: none;
        border-radius: 28px;
        padding: 14px 40px;
        font-weight: 500;
        letter-spacing: 0.25px;
        transition: all 0.3s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .btn-publish:hover {
        background: #174ea6;
        box-shadow: 0 4px 12px rgba(26,115,232,0.3);
        transform: scale(1.02);
    }

    .manage-item {
        padding: 15px;
        border-radius: 12px;
        margin-bottom: 8px;
        transition: 0.2s;
        border: 1px solid transparent;
    }
    .manage-item:hover { 
        background: white; 
        border-color: var(--border);
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
    
    .icon-circle {
        width: 40px; height: 40px;
        background: #e8f0fe;
        color: var(--google-blue);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
    }
</style>

<div class="container py-5">
    <div class="row g-5">
        <div class="col-lg-8 reveal">
            <div class="d-flex align-items-center mb-4">
                <div class="icon-circle me-3"><i class="fas fa-plus fa-lg"></i></div>
                <div>
                    <h1 class="h3 fw-bold m-0 g-sans">Nouvelle Formation</h1>
                    <p class="text-muted small m-0">Concevez un programme d'apprentissage de haute qualité.</p>
                </div>
            </div>

            <?php if ($message !== ''): ?><div class="alert alert-<?= e($status) ?>" role="status"><i class="fas fa-circle-info me-2"></i><?= e($message) ?></div><?php endif; ?>

            <form action="" method="POST" enctype="multipart/form-data">
                <div class="g-card mb-4">
                    <div class="row g-3">
                        <div class="col-md-8">
                            <label class="g-label">Titre de la formation</label>
                            <input type="text" name="titre" class="form-control g-input" minlength="3" maxlength="180" placeholder="ex: Architecture des Systèmes d'Information" required>
                        </div>
                        <div class="col-md-4">
                            <label class="g-label">Niveau</label>
                            <select name="niveau" class="form-control g-input">
                                <option value="Débutant">Débutant</option>
                                <option value="Intermédiaire">Intermédiaire</option>
                                <option value="Avancé">Avancé</option>
                            </select>
                        </div>
                        <div class="col-12">
                            <label class="g-label">Description détaillée</label>
                            <textarea name="description" class="form-control g-input" rows="4" minlength="30" maxlength="10000" placeholder="Décrivez les objectifs, le public et les compétences développées…" required></textarea>
                        </div>
                        <div class="col-md-4">
                            <label class="g-label">Durée totale</label>
                            <input type="text" name="duree" class="form-control g-input" minlength="2" maxlength="80" placeholder="ex: 12 semaines" required>
                        </div>
                        <div class="col-md-4">
                            <label class="g-label">Investissement (USD)</label>
                            <input type="number" name="prix" min="0" max="1000000000" step="0.01" class="form-control g-input" placeholder="Prix" required>
                        </div>
                        <div class="col-md-4">
                            <label class="g-label">Date de rentrée</label>
                            <input type="date" name="date_debut" class="form-control g-input" required>
                        </div>
                    </div>
                </div>

                <div class="g-card mb-4">
                    <h3 class="h6 fw-bold mb-4 g-sans text-uppercase" style="letter-spacing: 1px;">Organisation du temps</h3>
                    <div class="row g-2">
                        <?php foreach(['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'] as $day): ?>
                        <div class="col-md-6">
                            <label class="day-pill">
                                <div class="d-flex align-items-center">
                                    <input type="checkbox" name="jours[]" value="<?= e($day) ?>" class="form-check-input m-0 me-3 shadow-none">
                                    <span class="fw-medium"><?= e($day) ?></span>
                                </div>
                                <div class="d-flex gap-2">
                                    <input type="time" name="h_start_<?= e($day) ?>" class="form-control form-control-sm border-0 bg-white" value="08:00" style="width:70px">
                                    <input type="time" name="h_end_<?= e($day) ?>" class="form-control form-control-sm border-0 bg-white" value="12:00" style="width:70px">
                                </div>
                            </label>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="g-card mb-4">
                    <label class="g-label">Curriculum (Modules)</label>
                    <div id="module-list">
                        <div class="d-flex gap-2 mb-2 reveal">
                            <input type="text" name="modules[]" class="form-control g-input" maxlength="180" placeholder="Nom du module (ex: Introduction au PHP)" required>
                            <button type="button" class="btn btn-light rounded-pill border" data-remove-parent><i class="fas fa-times text-danger"></i></button>
                        </div>
                    </div>
                    <button type="button" data-add-module class="btn btn-sm btn-outline-primary rounded-pill px-3 mt-2">
                        <i class="fas fa-plus-circle me-1"></i> Ajouter une étape
                    </button>
                </div>

                <div class="g-card mb-4 bg-light border-0 py-5 text-center">
                    <label class="g-label text-center w-100">Visuel de couverture</label>
                    <div class="upload-area mt-2">
                        <i class="fas fa-image fa-3x text-muted mb-3"></i>
                        <input type="file" name="image" class="form-control form-control-sm w-50 mx-auto border-0 bg-white shadow-sm" accept="image/jpeg,image/png,image/webp,image/gif">
                    </div>
                </div>

                <button type="submit" name="publier" class="btn-publish w-100 g-sans">
                    PUBLIER LE PROGRAMME <i class="fas fa-arrow-right ms-2"></i>
                </button>
            </form>
        </div>

        <div class="col-lg-4 reveal">
            <div class="g-card p-4 sticky-top" style="top: 20px;">
                <h2 class="h6 fw-bold mb-4 g-sans border-bottom pb-2">Gestion Rapide</h2>
                
                <?php if(empty($all_formations)): ?>
                    <div class="text-center py-4">
                        <p class="text-muted small">Aucune formation active.</p>
                    </div>
                <?php else: ?>
                    <div class="manage-list">
                        <?php foreach($all_formations as $f): ?>
                        <div class="manage-item d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center overflow-hidden">
                                <div class="bg-primary rounded-circle me-3" style="width: 10px; height: 10px; flex-shrink: 0;"></div>
                                <div class="text-truncate">
                                    <div class="fw-bold small text-truncate"><?= htmlspecialchars($f['titre']) ?></div>
                                    <div class="text-muted" style="font-size: 11px;"><?= e($f['prix']) ?> USD • <?= e($f['duree']) ?></div>
                                </div>
                            </div>
                            <a href="modifier_formation.php?id=<?= (int)$f['id'] ?>" class="btn btn-sm btn-light border-0 shadow-sm rounded-circle" title="Modifier">
                                <i class="fas fa-pen text-primary p-1"></i>
                            </a>
                        </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <a href="gerer_formation.php" class="btn btn-light w-100 rounded-pill mt-4 fw-bold text-primary small">
                    <i class="fas fa-external-link-alt me-2"></i> Voir tout l'inventaire
                </a>
            </div>
        </div>
    </div>
</div>

<script>
// Notifications push héritées retirées : la configuration FCM legacy n'est plus embarquée dans le frontend.
</script>

<?php include '../includes/footer_admin.php'; ?>
