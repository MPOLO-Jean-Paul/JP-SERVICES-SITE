<?php
require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/formation_helpers.php';
require_once __DIR__ . '/includes/connexion_db.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/formations');
}

$userId = (int)$_SESSION['user_id'];
$formationId = filter_input(INPUT_POST, 'formation_id', FILTER_VALIDATE_INT);
if (!$formationId) {
    jp_abort(400, 'Formation invalide.');
}

$stmt = $conn->prepare('SELECT id, titre, modules_liste, jours_possibles FROM formations WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $formationId]);
$formation = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$formation) {
    jp_abort(404, 'Cette formation est introuvable.');
}

$enrollmentStmt = $conn->prepare('SELECT 1 FROM inscriptions WHERE user_id = :user AND formation_id = :formation LIMIT 1');
$enrollmentStmt->execute([':user' => $userId, ':formation' => $formationId]);
if (!$enrollmentStmt->fetchColumn()) {
    jp_abort(403, 'Une inscription active est nécessaire pour organiser ce programme.');
}

$userStmt = $conn->prepare('SELECT prenom, nom, email FROM users WHERE id = :id AND is_active = 1 LIMIT 1');
$userStmt->execute([':id' => $userId]);
$user = $userStmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    jp_abort(403, 'Compte utilisateur indisponible.');
}

$allowedModules = jp_formation_modules($formation['modules_liste'] ?? '');
$allowedDays = jp_formation_modules($formation['jours_possibles'] ?? '');
if ($allowedModules === []) $allowedModules = ['Parcours complet'];
if ($allowedDays === []) $allowedDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

$existingStmt = $conn->prepare('SELECT modules_choisis, horaire_details, statut FROM planning_valide WHERE user_id = :user AND formation_id = :formation LIMIT 1');
$existingStmt->execute([':user' => $userId, ':formation' => $formationId]);
$existing = $existingStmt->fetch(PDO::FETCH_ASSOC);
$errors = [];
$createdNow = false;

if ($existing) {
    $modules = array_values(array_filter(array_map('trim', explode(',', (string)$existing['modules_choisis']))));
    $schedule = json_decode((string)$existing['horaire_details'], true);
    if (!is_array($schedule)) $schedule = [];
    $status = (string)$existing['statut'];
} else {
    $postedModules = $_POST['modules'] ?? [];
    $postedDays = $_POST['jours'] ?? [];
    $postedModules = is_array($postedModules) ? array_values(array_unique(array_map('trim', $postedModules))) : [];
    $postedDays = is_array($postedDays) ? array_values(array_unique(array_map('trim', $postedDays))) : [];
    $modules = array_values(array_intersect($postedModules, $allowedModules));
    $days = array_values(array_intersect($postedDays, $allowedDays));
    $schedule = [];

    if ($modules === []) $errors[] = 'Sélectionnez au moins un module autorisé.';
    if ($days === [] || count($days) > 3) $errors[] = 'Sélectionnez entre un et trois jours autorisés.';
    foreach ($days as $day) {
        $start = substr(trim((string)($_POST['debut_' . $day] ?? '')), 0, 5);
        $end = substr(trim((string)($_POST['fin_' . $day] ?? '')), 0, 5);
        if (!preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $start) || !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $end) || $start >= $end) {
            $errors[] = 'L’horaire choisi pour ' . $day . ' est invalide.';
            continue;
        }
        $schedule[$day] = ['debut' => $start, 'fin' => $end];
    }
    $status = 'brouillon';

    if (isset($_POST['confirmer_action']) && !jp_rate_limit('planning-submit:' . $userId, 6, 600)) {
        $errors[] = 'Trop de demandes successives. Patientez quelques minutes avant de recommencer.';
    }

    if (isset($_POST['confirmer_action']) && $errors === []) {
        try {
            $save = $conn->prepare("INSERT INTO planning_valide (user_id, formation_id, modules_choisis, horaire_details, statut) VALUES (:user, :formation, :modules, :schedule, 'en_attente')");
            $save->execute([
                ':user' => $userId,
                ':formation' => $formationId,
                ':modules' => implode(', ', $modules),
                ':schedule' => json_encode($schedule, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            ]);
            $status = 'en_attente';
            $createdNow = true;

            $smtpUser = trim((string)env('SMTP_USERNAME', ''));
            if ($smtpUser !== '') {
                try {
                    require_once __DIR__ . '/includes/PHPMailer/Exception.php';
                    require_once __DIR__ . '/includes/PHPMailer/PHPMailer.php';
                    require_once __DIR__ . '/includes/PHPMailer/SMTP.php';
                    require_once __DIR__ . '/app/mailer.php';
                    $mail = jp_configure_mailer(new PHPMailer\PHPMailer\PHPMailer(true));
                    $mail->addAddress((string)env('SMTP_FROM_ADDRESS', $smtpUser), 'Administration JP-SERVICES');
                    if (filter_var($user['email'], FILTER_VALIDATE_EMAIL)) $mail->addReplyTo($user['email'], trim($user['prenom'] . ' ' . $user['nom']));
                    $mail->isHTML(true);
                    $mail->Subject = 'Nouvelle demande de planning — ' . $formation['titre'];
                    $mail->Body = '<h2>Nouvelle demande de planning</h2><p><strong>Utilisateur :</strong> ' . e(trim($user['prenom'] . ' ' . $user['nom'])) . '</p><p><strong>Formation :</strong> ' . e($formation['titre']) . '</p><p><strong>Modules :</strong> ' . e(implode(', ', $modules)) . '</p>';
                    $mail->AltBody = 'Nouvelle demande de planning pour ' . $formation['titre'] . ' par ' . trim($user['prenom'] . ' ' . $user['nom']);
                    $mail->send();
                } catch (Throwable $mailException) {
                    error_log('Notification planning: ' . $mailException->getMessage());
                }
            }
        } catch (Throwable $exception) {
            error_log('Enregistrement planning: ' . $exception->getMessage());
            $errors[] = 'Le planning n’a pas pu être enregistré. Il existe peut-être déjà.';
        }
    }
}

$fullName = trim((string)$user['prenom'] . ' ' . (string)$user['nom']);
$statusLabels = ['brouillon' => 'Brouillon', 'en_attente' => 'En attente de validation', 'valide' => 'Planning validé', 'refuse' => 'À revoir'];
$statusLabel = $statusLabels[$status] ?? ucfirst(str_replace('_', ' ', $status));
include __DIR__ . '/includes/header.php';
?>
<main id="main-content">
    <section class="jp-program-review-hero">
        <div class="home-shell reveal">
            <a class="jp-back-link" href="<?= e(app_route('/programme', ['id' => $formationId])) ?>"><i class="fas fa-arrow-left"></i> Retour à la sélection</a>
            <span class="home-eyebrow">Dernière vérification</span>
            <h2>Votre programme personnalisé.</h2>
            <p>Relisez les modules et disponibilités avant de transmettre la demande à l’équipe JP-Services.</p>
        </div>
    </section>

    <section class="jp-section">
        <div class="home-shell jp-program-review-shell">
            <?php foreach ($errors as $error): ?><div class="alert alert-danger" role="alert"><i class="fas fa-triangle-exclamation"></i> <?= e($error) ?></div><?php endforeach; ?>
            <?php if ($createdNow): ?><div class="alert alert-success" role="status"><i class="fas fa-circle-check"></i> Votre demande a été enregistrée et transmise à l’administration.</div>
            <?php elseif ($status === 'en_attente'): ?><div class="alert alert-warning" role="status"><i class="fas fa-clock"></i> Votre planning est en attente de validation administrative.</div>
            <?php elseif ($status === 'valide'): ?><div class="alert alert-success" role="status"><i class="fas fa-circle-check"></i> Votre planning a été validé.</div><?php endif; ?>

            <article class="jp-program-review-card reveal">
                <header>
                    <div><span>Programme de formation</span><h2><?= e($formation['titre']) ?></h2><p><?= e($fullName) ?> · <?= date('d/m/Y') ?></p></div>
                    <strong class="jp-program-status"><i class="fas fa-circle"></i> <?= e($statusLabel) ?></strong>
                </header>
                <div class="jp-program-review-content">
                    <section><span class="jp-program-review-label">Modules sélectionnés</span><div class="jp-program-review-modules"><?php foreach ($modules as $index => $module): ?><div><span><?= str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT) ?></span><?= e($module) ?></div><?php endforeach; ?></div></section>
                    <section><span class="jp-program-review-label">Disponibilités proposées</span>
                        <?php if ($schedule !== []): ?><div class="jp-program-review-table"><table><thead><tr><th>Jour</th><th>Début</th><th>Fin</th></tr></thead><tbody><?php foreach ($schedule as $day => $times): ?><tr><td><strong><?= e($day) ?></strong></td><td><?= e($times['debut'] ?? '') ?></td><td><?= e($times['fin'] ?? '') ?></td></tr><?php endforeach; ?></tbody></table></div><?php else: ?><p class="text-muted">Aucune disponibilité enregistrée.</p><?php endif; ?>
                    </section>
                </div>
                <footer><i class="fas fa-shield-halved"></i><span>La validation finale dépend de la disponibilité des créneaux. Vous retrouverez l’état de la demande dans votre espace.</span></footer>
            </article>

            <div class="jp-program-review-actions">
                <?php if (!$existing && !isset($_POST['confirmer_action']) && $errors === []): ?>
                    <a class="jp-btn jp-btn-ghost" href="<?= e(app_route('/programme', ['id' => $formationId])) ?>">Modifier ma sélection</a>
                    <form method="post" action="<?= e(app_route('/programme/traitement')) ?>">
                        <input type="hidden" name="formation_id" value="<?= (int)$formationId ?>">
                        <?php foreach ($modules as $module): ?><input type="hidden" name="modules[]" value="<?= e($module) ?>"><?php endforeach; ?>
                        <?php foreach ($schedule as $day => $times): ?><input type="hidden" name="jours[]" value="<?= e($day) ?>"><input type="hidden" name="debut_<?= e($day) ?>" value="<?= e($times['debut']) ?>"><input type="hidden" name="fin_<?= e($day) ?>" value="<?= e($times['fin']) ?>"><?php endforeach; ?>
                        <button class="jp-btn jp-btn-primary" type="submit" name="confirmer_action" value="1">Confirmer et transmettre <i class="fas fa-paper-plane"></i></button>
                    </form>
                <?php else: ?>
                    <a class="jp-btn jp-btn-primary" href="<?= e(app_route('/formation', ['id' => $formationId])) ?>">Retour à la formation</a>
                    <a class="jp-btn jp-btn-ghost" href="<?= e(app_route('/abonnements')) ?>">Mes formations</a>
                <?php endif; ?>
            </div>
        </div>
    </section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
