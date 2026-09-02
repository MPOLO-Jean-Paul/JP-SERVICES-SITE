<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/formation_helpers.php';
require_once __DIR__ . '/includes/connexion_db.php';

$formationId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$formationId) {
    redirect('/formations');
}

try {
    $stmt = $conn->prepare('SELECT * FROM formations WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $formationId]);
    $formation = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Fiche formation: ' . $exception->getMessage());
    jp_abort(503, 'Le catalogue est momentanément indisponible. Réessayez dans quelques instants.');
}

if (!$formation) {
    jp_abort(404, 'Cette formation est introuvable.');
}

$userId = !empty($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_login();
    $userId = (int)$_SESSION['user_id'];
    $action = trim((string)($_POST['formation_action'] ?? ''));

    if (!in_array($action, ['enroll', 'subscribe', 'unsubscribe'], true)) {
        jp_abort(400, 'Action de formation invalide.');
    }
    if (!jp_rate_limit('formation-action:' . $userId, 20, 300)) {
        $_SESSION['formation_flash'] = ['type' => 'warning', 'message' => 'Trop d’actions successives. Patientez quelques instants.'];
        redirect('/formation?id=' . $formationId);
    }

    try {
        if ($action === 'enroll') {
            $enroll = $conn->prepare('INSERT IGNORE INTO inscriptions (user_id, formation_id) VALUES (:user, :formation)');
            $enroll->execute([':user' => $userId, ':formation' => $formationId]);
            $_SESSION['formation_flash'] = ['type' => 'success', 'message' => 'Votre inscription est confirmée. Vous pouvez maintenant organiser votre programme.'];
        } elseif ($action === 'unsubscribe') {
            $off = $conn->prepare('UPDATE abonnements SET notifications_active = 0 WHERE user_id = :user AND formation_id = :formation');
            $off->execute([':user' => $userId, ':formation' => $formationId]);
            $_SESSION['formation_flash'] = ['type' => 'info', 'message' => 'Les alertes de cette formation sont désactivées.'];
        } else {
            $userStmt = $conn->prepare('SELECT nom, prenom, email FROM users WHERE id = :id AND is_active = 1 LIMIT 1');
            $userStmt->execute([':id' => $userId]);
            $subscriber = $userStmt->fetch(PDO::FETCH_ASSOC);
            if (!$subscriber) {
                throw new RuntimeException('Utilisateur introuvable.');
            }

            $check = $conn->prepare('SELECT id FROM abonnements WHERE user_id = :user AND formation_id = :formation LIMIT 1');
            $check->execute([':user' => $userId, ':formation' => $formationId]);
            if ($check->fetchColumn()) {
                $on = $conn->prepare('UPDATE abonnements SET notifications_active = 1 WHERE user_id = :user AND formation_id = :formation');
                $on->execute([':user' => $userId, ':formation' => $formationId]);
            } else {
                $insert = $conn->prepare('INSERT INTO abonnements (user_id, formation_id, formation_titre, formation_description, formation_prix, formation_duree, formation_niveau, formation_date_debut, prenom, nom, email, ip_utilisateur, user_agent, notifications_active) VALUES (:user, :formation, :titre, :description, :prix, :duree, :niveau, :date_debut, :prenom, :nom, :email, :ip, :agent, 1)');
                $insert->execute([
                    ':user' => $userId,
                    ':formation' => $formationId,
                    ':titre' => (string)$formation['titre'],
                    ':description' => (string)($formation['description'] ?? ''),
                    ':prix' => $formation['prix'] ?? 0,
                    ':duree' => (string)($formation['duree'] ?? ''),
                    ':niveau' => (string)($formation['niveau'] ?? ''),
                    ':date_debut' => $formation['date_debut'] ?? null,
                    ':prenom' => (string)$subscriber['prenom'],
                    ':nom' => (string)$subscriber['nom'],
                    ':email' => (string)$subscriber['email'],
                    ':ip' => substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45),
                    ':agent' => substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
                ]);
            }
            $_SESSION['formation_flash'] = ['type' => 'success', 'message' => 'Vous recevrez les prochaines informations concernant cette formation.'];
        }
    } catch (Throwable $exception) {
        error_log('Action formation: ' . $exception->getMessage());
        $_SESSION['formation_flash'] = ['type' => 'danger', 'message' => 'Cette action n’a pas pu être enregistrée. Réessayez plus tard.'];
    }
    redirect('/formation?id=' . $formationId);
}

$isInscribed = false;
$isNotifOn = false;
if ($userId) {
    try {
        $enrollmentCheck = $conn->prepare('SELECT 1 FROM inscriptions WHERE user_id = :user AND formation_id = :formation LIMIT 1');
        $enrollmentCheck->execute([':user' => $userId, ':formation' => $formationId]);
        $isInscribed = (bool)$enrollmentCheck->fetchColumn();

        $notificationCheck = $conn->prepare('SELECT 1 FROM abonnements WHERE user_id = :user AND formation_id = :formation AND notifications_active = 1 LIMIT 1');
        $notificationCheck->execute([':user' => $userId, ':formation' => $formationId]);
        $isNotifOn = (bool)$notificationCheck->fetchColumn();
    } catch (Throwable $exception) {
        error_log('État formation utilisateur: ' . $exception->getMessage());
    }
}

$related = [];
try {
    $relatedStmt = $conn->prepare('SELECT id, titre, description, niveau, duree, prix, image FROM formations WHERE id <> :id ORDER BY id DESC LIMIT 3');
    $relatedStmt->execute([':id' => $formationId]);
    $related = $relatedStmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Formations associées: ' . $exception->getMessage());
}

$flash = $_SESSION['formation_flash'] ?? null;
unset($_SESSION['formation_flash']);
$domain = jp_formation_domain($formation);
$modules = jp_formation_modules($formation['modules_liste'] ?? '');
if ($modules === []) {
    $modules = ['Fondamentaux et prise en main', 'Mise en pratique guidée', 'Application sur un cas concret'];
}
$price = max(0, (float)($formation['prix'] ?? 0));
$level = trim((string)($formation['niveau'] ?? 'Niveau ouvert')) ?: 'Niveau ouvert';
$duration = trim((string)($formation['duree'] ?? 'À confirmer')) ?: 'À confirmer';
$startLabel = jp_formation_date_label($formation['date_debut'] ?? '');

include __DIR__ . '/includes/header.php';
?>

<main id="main-content">
    <section class="jp-course-hero">
        <div class="home-shell">
            <nav class="jp-course-breadcrumb" aria-label="Fil d’Ariane de la formation">
                <a href="<?= e(url('/formations')) ?>">Formations</a><i class="fas fa-chevron-right"></i><span><?= e($domain['label']) ?></span>
            </nav>
            <div class="jp-course-hero-grid">
                <div class="reveal">
                    <span class="jp-course-domain"><i class="fas <?= e($domain['icon']) ?>"></i> <?= e($domain['label']) ?> · Formation</span>
                    <h2><?= e($formation['titre']) ?></h2>
                    <p><?= e(jp_formation_excerpt($formation['description'] ?? '', 220)) ?></p>
                    <dl class="jp-course-hero-facts">
                        <div><dt>Niveau</dt><dd><i class="fas fa-signal"></i> <?= e($level) ?></dd></div>
                        <div><dt>Durée</dt><dd><i class="far fa-clock"></i> <?= e($duration) ?></dd></div>
                        <div><dt>Prochaine session</dt><dd><i class="far fa-calendar"></i> <?= e($startLabel) ?></dd></div>
                    </dl>
                </div>
                <div class="jp-course-visual reveal">
                    <img src="<?= e(jp_formation_image($formation['image'] ?? '')) ?>" alt="Illustration de la formation <?= e($formation['titre']) ?>" data-fallback-src="<?= e(url('/images/formations/default.jpg')) ?>">
                    <span><i class="fas fa-user-check"></i> Parcours accompagné</span>
                </div>
            </div>
        </div>
    </section>

    <nav class="jp-course-nav" aria-label="Sections de la formation">
        <div class="home-shell">
            <a href="#apercu">Aperçu</a>
            <a href="#competences">Compétences</a>
            <a href="#methode">Méthode</a>
            <a href="#programme-formation">Programme</a>
        </div>
    </nav>

    <section class="jp-section">
        <div class="home-shell jp-course-layout">
            <div class="jp-course-content">
                <?php if (is_array($flash)): ?>
                    <div class="alert alert-<?= e($flash['type'] ?? 'info') ?> jp-course-alert" role="status"><i class="fas fa-circle-info"></i><span><?= e($flash['message'] ?? '') ?></span></div>
                <?php endif; ?>

                <section id="apercu" class="jp-course-section reveal">
                    <span class="home-eyebrow">À propos de cette formation</span>
                    <h2>Développez une compétence utile, avec un cadre clair.</h2>
                    <div class="jp-course-description"><?= nl2br(e((string)($formation['description'] ?? ''))) ?></div>
                    <div class="jp-course-assurance">
                        <div><i class="fas fa-laptop-code"></i><span><strong>Apprentissage concret</strong>Des notions expliquées puis appliquées progressivement.</span></div>
                        <div><i class="fas fa-people-group"></i><span><strong>Échanges facilités</strong>Un espace membre pour suivre vos formations et vos demandes.</span></div>
                        <div><i class="fas fa-calendar-check"></i><span><strong>Organisation flexible</strong>Vous proposez jusqu’à trois disponibilités après inscription.</span></div>
                    </div>
                </section>

                <section id="competences" class="jp-course-section reveal">
                    <span class="home-eyebrow">Compétences travaillées</span>
                    <h2>Ce que vous allez parcourir.</h2>
                    <div class="jp-course-outcomes">
                        <?php foreach ($modules as $index => $module): ?>
                            <article><span><?= str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT) ?></span><div><h3><?= e($module) ?></h3><p>Comprendre les notions essentielles, les pratiquer et savoir les mobiliser dans un contexte professionnel.</p></div></article>
                        <?php endforeach; ?>
                    </div>
                </section>

                <section id="methode" class="jp-course-section reveal">
                    <span class="home-eyebrow">Expérience d’apprentissage</span>
                    <h2>Une progression en trois temps.</h2>
                    <ol class="jp-course-method">
                        <li><span>1</span><div><h3>Comprendre</h3><p>Vous découvrez les principes, le vocabulaire et les méthodes indispensables.</p></div></li>
                        <li><span>2</span><div><h3>Pratiquer</h3><p>Vous passez à l’action au moyen d’exercices, de démonstrations et de cas guidés.</p></div></li>
                        <li><span>3</span><div><h3>Consolider</h3><p>Vous réutilisez les acquis dans un travail de synthèse et identifiez vos prochaines étapes.</p></div></li>
                    </ol>
                </section>

                <section id="programme-formation" class="jp-course-section reveal">
                    <span class="home-eyebrow">Programme</span>
                    <h2>Les étapes de votre parcours.</h2>
                    <div class="jp-course-syllabus">
                        <?php foreach ($modules as $index => $module): ?>
                            <details <?= $index === 0 ? 'open' : '' ?>>
                                <summary><span>Module <?= $index + 1 ?></span><strong><?= e($module) ?></strong><i class="fas fa-plus"></i></summary>
                                <div><p>Ce module combine compréhension, démonstration et mise en pratique. Le contenu détaillé et les supports sont communiqués dans votre espace de formation.</p></div>
                            </details>
                        <?php endforeach; ?>
                    </div>
                </section>
            </div>

            <aside class="jp-course-enroll-card reveal" aria-label="Inscription à la formation">
                <div class="jp-course-price"><span>Tarif de la formation</span><strong class="<?= $price <= 0 ? 'is-free' : '' ?>"><?= e(jp_formation_price_label($price)) ?></strong></div>
                <ul>
                    <li><i class="far fa-clock"></i><span><small>Durée</small><?= e($duration) ?></span></li>
                    <li><i class="fas fa-signal"></i><span><small>Niveau</small><?= e($level) ?></span></li>
                    <li><i class="far fa-calendar"></i><span><small>Début</small><?= e($startLabel) ?></span></li>
                    <li><i class="fas fa-list-check"></i><span><small>Programme</small><?= count($modules) ?> module<?= count($modules) > 1 ? 's' : '' ?></span></li>
                </ul>

                <?php if ($userId): ?>
                    <?php if ($isInscribed): ?>
                        <div class="jp-enrollment-status"><i class="fas fa-circle-check"></i><span><strong>Vous êtes inscrit</strong>Votre programme peut maintenant être organisé.</span></div>
                        <a class="jp-btn jp-btn-primary" href="<?= e(app_route('/programme', ['id' => $formationId])) ?>">Organiser mon programme <i class="fas fa-arrow-right"></i></a>
                    <?php else: ?>
                        <form method="post"><input type="hidden" name="formation_action" value="enroll"><button class="jp-btn jp-btn-primary" type="submit">S’inscrire à cette formation <i class="fas fa-arrow-right"></i></button></form>
                    <?php endif; ?>
                    <form method="post" class="jp-course-notify-form">
                        <input type="hidden" name="formation_action" value="<?= $isNotifOn ? 'unsubscribe' : 'subscribe' ?>">
                        <button type="submit" class="jp-btn jp-btn-ghost"><i class="<?= $isNotifOn ? 'fas fa-bell-slash' : 'far fa-bell' ?>"></i> <?= $isNotifOn ? 'Désactiver les alertes' : 'Recevoir les mises à jour' ?></button>
                    </form>
                <?php else: ?>
                    <a class="jp-btn jp-btn-primary" href="<?= e(app_route('/connexion', ['redirect_to' => app_route('/formation', ['id' => $formationId])])) ?>">Se connecter pour s’inscrire <i class="fas fa-arrow-right"></i></a>
                    <p class="jp-course-login-note"><i class="fas fa-shield-halved"></i> Votre compte permet de suivre l’inscription, le planning et les notifications.</p>
                <?php endif; ?>

                <a class="jp-course-help-link" href="<?= e(url('/aide')) ?>"><i class="far fa-circle-question"></i> Une question avant de commencer ?</a>
            </aside>
        </div>
    </section>

    <?php if ($related !== []): ?>
    <section class="jp-section jp-related-training">
        <div class="home-shell">
            <div class="jp-section-heading reveal"><span class="home-eyebrow">À découvrir aussi</span><h2>D’autres formations pour continuer.</h2></div>
            <div class="jp-related-training-grid">
                <?php foreach ($related as $item): $itemDomain = jp_formation_domain($item); ?>
                    <article class="reveal">
                        <span><i class="fas <?= e($itemDomain['icon']) ?>"></i> <?= e($itemDomain['label']) ?></span>
                        <h3><a href="<?= e(app_route('/formation', ['id' => (int)$item['id']])) ?>"><?= e($item['titre']) ?></a></h3>
                        <p><?= e(jp_formation_excerpt($item['description'] ?? '', 110)) ?></p>
                        <div><small><?= e($item['niveau'] ?? 'Niveau ouvert') ?> · <?= e($item['duree'] ?? 'Durée à confirmer') ?></small><strong><?= e(jp_formation_price_label($item['prix'] ?? 0)) ?></strong></div>
                    </article>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
