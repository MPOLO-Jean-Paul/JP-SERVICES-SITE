<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/formation_helpers.php';
require_once __DIR__ . '/includes/connexion_db.php';
require_login();

$userId = (int)$_SESSION['user_id'];
$formationId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$formationId) {
    redirect('/formations');
}

try {
    $stmt = $conn->prepare('SELECT id, titre, niveau, duree, image, modules_liste, jours_possibles, heure_debut_defaut, heure_fin_defaut FROM formations WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $formationId]);
    $formation = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$formation) {
        jp_abort(404, 'Cette formation est introuvable.');
    }

    $enrollment = $conn->prepare('SELECT 1 FROM inscriptions WHERE user_id = :user AND formation_id = :formation LIMIT 1');
    $enrollment->execute([':user' => $userId, ':formation' => $formationId]);
    if (!$enrollment->fetchColumn()) {
        $_SESSION['formation_flash'] = ['type' => 'warning', 'message' => 'Inscrivez-vous à la formation avant d’organiser votre programme.'];
        redirect('/formation?id=' . $formationId);
    }

    $check = $conn->prepare('SELECT statut FROM planning_valide WHERE user_id = :user AND formation_id = :formation LIMIT 1');
    $check->execute([':user' => $userId, ':formation' => $formationId]);
    $existingStatus = $check->fetchColumn();
} catch (Throwable $exception) {
    error_log('Programme formation: ' . $exception->getMessage());
    jp_abort(503, 'Le programme est momentanément indisponible.');
}

$modules = jp_formation_modules($formation['modules_liste'] ?? '');
$days = jp_formation_modules($formation['jours_possibles'] ?? '');
if ($modules === []) {
    $modules = ['Parcours complet'];
}
if ($days === []) {
    $days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
}
$defaultStart = preg_match('/^\d{2}:\d{2}/', (string)$formation['heure_debut_defaut']) ? substr((string)$formation['heure_debut_defaut'], 0, 5) : '08:00';
$defaultEnd = preg_match('/^\d{2}:\d{2}/', (string)$formation['heure_fin_defaut']) ? substr((string)$formation['heure_fin_defaut'], 0, 5) : '12:00';
$statusLabels = [
    'brouillon' => 'Brouillon',
    'en_attente' => 'En attente de validation',
    'valide' => 'Planning validé',
    'refuse' => 'À revoir',
];
$statusLabel = $statusLabels[(string)$existingStatus] ?? ucfirst(str_replace('_', ' ', (string)$existingStatus));

include __DIR__ . '/includes/header.php';
?>

<main id="main-content" class="jp-program-page">
    <section class="jp-program-hero">
        <div class="home-shell jp-program-hero-grid">
            <div class="reveal">
                <a class="jp-back-link" href="<?= e(app_route('/formation', ['id' => $formationId])) ?>"><i class="fas fa-arrow-left"></i> Retour à la formation</a>
                <span class="home-eyebrow">Programme personnalisé</span>
                <h2>Organisez votre rythme d’apprentissage.</h2>
                <p>Sélectionnez les modules souhaités et jusqu’à trois créneaux. L’équipe vérifiera ensuite la disponibilité du planning.</p>
            </div>
            <div class="jp-program-course-card reveal">
                <img src="<?= e(jp_formation_image($formation['image'] ?? '')) ?>" alt="" data-fallback-src="<?= e(url('/images/formations/default.jpg')) ?>">
                <div><span>Votre formation</span><h3><?= e($formation['titre']) ?></h3><p><?= e($formation['niveau'] ?? 'Niveau ouvert') ?> · <?= e($formation['duree'] ?? 'Durée à confirmer') ?></p></div>
            </div>
        </div>
    </section>

    <section class="jp-section">
        <div class="home-shell jp-program-shell">
            <?php if ($existingStatus): ?>
                <section class="jp-program-existing reveal">
                    <span class="jp-program-status"><i class="fas fa-clock-rotate-left"></i> <?= e($statusLabel) ?></span>
                    <h2>Votre demande de programme est déjà enregistrée.</h2>
                    <p>Consultez le récapitulatif transmis et son état de validation. Les modifications restent gérées avec l’équipe pour éviter les conflits de planning.</p>
                    <div class="jp-program-existing-actions">
                        <form method="post" action="<?= e(app_route('/programme/traitement')) ?>"><input type="hidden" name="formation_id" value="<?= (int)$formationId ?>"><button class="jp-btn jp-btn-primary" type="submit">Consulter mon programme <i class="fas fa-arrow-right"></i></button></form>
                        <a class="jp-btn jp-btn-ghost" href="<?= e(url('/aide')) ?>">Contacter l’assistance</a>
                    </div>
                </section>
            <?php else: ?>
                <form class="jp-program-form" method="post" action="<?= e(app_route('/programme/traitement')) ?>" data-programme-form novalidate>
                    <input type="hidden" name="formation_id" value="<?= (int)$formationId ?>">
                    <div class="jp-program-main">
                        <section class="jp-program-step reveal" aria-labelledby="program-modules-title">
                            <header><span>Étape 1 sur 2</span><h2 id="program-modules-title">Choisissez vos modules</h2><p>Vous pouvez suivre le parcours complet ou sélectionner uniquement les parties pertinentes pour votre objectif.</p></header>
                            <div class="jp-program-module-list">
                                <?php foreach ($modules as $index => $module): ?>
                                    <label class="jp-program-module">
                                        <input type="checkbox" name="modules[]" value="<?= e($module) ?>" <?= $index === 0 ? 'checked' : '' ?> data-programme-module>
                                        <span class="jp-program-checkbox"><i class="fas fa-check"></i></span>
                                        <span class="jp-program-module-number"><?= str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT) ?></span>
                                        <span><strong><?= e($module) ?></strong><small>Notions, démonstration et mise en pratique guidée</small></span>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                        </section>

                        <section class="jp-program-step reveal" aria-labelledby="program-days-title">
                            <header><span>Étape 2 sur 2</span><h2 id="program-days-title">Indiquez vos disponibilités</h2><p>Choisissez entre un et trois jours, puis précisez la plage horaire souhaitée pour chacun.</p></header>
                            <div class="jp-program-day-head"><span>Sélection</span><output data-programme-day-count>0 / 3 jours</output></div>
                            <div class="jp-program-days">
                                <?php foreach ($days as $day): $key = preg_replace('/[^a-z0-9_-]/i', '_', $day); ?>
                                    <article class="jp-program-day" data-programme-day-card>
                                        <label class="jp-program-day-toggle"><input type="checkbox" name="jours[]" value="<?= e($day) ?>" data-programme-day><span class="jp-program-checkbox"><i class="fas fa-check"></i></span><strong><?= e($day) ?></strong></label>
                                        <div class="jp-program-times">
                                            <label for="start_<?= e($key) ?>"><span>De</span><input type="time" id="start_<?= e($key) ?>" name="debut_<?= e($day) ?>" value="<?= e($defaultStart) ?>"></label>
                                            <i class="fas fa-arrow-right" aria-hidden="true"></i>
                                            <label for="end_<?= e($key) ?>"><span>À</span><input type="time" id="end_<?= e($key) ?>" name="fin_<?= e($day) ?>" value="<?= e($defaultEnd) ?>"></label>
                                        </div>
                                    </article>
                                <?php endforeach; ?>
                            </div>
                        </section>
                    </div>

                    <aside class="jp-program-summary reveal">
                        <span class="home-eyebrow">Votre sélection</span>
                        <h2>Récapitulatif</h2>
                        <dl>
                            <div><dt>Formation</dt><dd><?= e($formation['titre']) ?></dd></div>
                            <div><dt>Modules</dt><dd data-programme-module-count>1 sélectionné</dd></div>
                            <div><dt>Disponibilités</dt><dd data-programme-summary-days>Aucun jour sélectionné</dd></div>
                        </dl>
                        <div class="jp-program-process"><i class="fas fa-shield-halved"></i><p><strong>Avant l’envoi</strong>Vous pourrez vérifier une dernière fois les modules et horaires choisis.</p></div>
                        <p class="jp-form-error" data-programme-error role="alert" hidden></p>
                        <button class="jp-btn jp-btn-primary" type="submit">Vérifier mon programme <i class="fas fa-arrow-right"></i></button>
                        <small>Cette étape n’enregistre pas encore définitivement votre demande.</small>
                    </aside>
                </form>
            <?php endif; ?>
        </div>
    </section>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
