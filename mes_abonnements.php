<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';
require_once __DIR__ . '/app/formation_helpers.php';
require_login();

$subscriptions = [];
$error = '';
try {
    $statement = $conn->prepare(
        'SELECT f.id AS formation_id, f.titre AS formation_titre, f.description AS formation_description,
                f.duree AS formation_duree, f.niveau AS formation_niveau, f.date_debut AS formation_date_debut,
                a.date_abonnement, COALESCE(a.notifications_active, 0) AS notifications_active,
                CASE WHEN i.user_id IS NULL THEN 0 ELSE 1 END AS is_inscribed, p.statut AS planning_statut
         FROM formations f
         LEFT JOIN inscriptions i ON i.formation_id = f.id AND i.user_id = :user_id_enrollment
         LEFT JOIN abonnements a ON a.formation_id = f.id AND a.user_id = :user_id_subscription
         LEFT JOIN planning_valide p ON p.formation_id = f.id AND p.user_id = :user_id_planning
         WHERE i.user_id IS NOT NULL OR a.user_id IS NOT NULL
         ORDER BY COALESCE(a.date_abonnement, f.date_debut) DESC, f.titre ASC'
    );
    $statement->execute([
        'user_id_enrollment' => (int)$_SESSION['user_id'],
        'user_id_subscription' => (int)$_SESSION['user_id'],
        'user_id_planning' => (int)$_SESSION['user_id'],
    ]);
    $subscriptions = $statement->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Formations suivies : ' . $exception->getMessage());
    $error = 'Vos formations sont momentanément indisponibles.';
}

include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-member-page">
    <section class="jp-member-hero"><div class="home-shell jp-member-hero-inner"><div><span class="home-eyebrow"><i class="fas fa-book-open"></i> Mon apprentissage</span><h2>Vos formations, réunies dans un espace clair.</h2><p>Retrouvez vos inscriptions, leurs dates clés et les préférences de notification associées.</p></div><a class="jp-btn jp-btn-primary" href="<?= e(url('/formations')) ?>">Découvrir les formations <i class="fas fa-arrow-right"></i></a></div></section>
    <section class="home-section"><div class="home-shell">
        <?php if ($error !== ''): ?><div class="alert alert-danger"><?= e($error) ?></div>
        <?php elseif (!$subscriptions): ?><div class="jp-empty-state jp-member-empty"><i class="fas fa-book-open"></i><h3>Aucune formation suivie</h3><p>Explorez le catalogue et choisissez le parcours adapté à votre objectif.</p><a class="jp-btn jp-btn-primary" href="<?= e(url('/formations')) ?>">Explorer le catalogue</a></div>
        <?php else: ?><div class="jp-member-card-grid">
            <?php foreach ($subscriptions as $subscription): ?>
                <article class="jp-member-card jp-course-card reveal">
                    <div class="jp-member-card-top"><span class="jp-status <?= !empty($subscription['is_inscribed']) ? 'jp-status-valide' : 'jp-status-en_attente' ?>"><i class="fas <?= !empty($subscription['is_inscribed']) ? 'fa-circle-check' : 'fa-bell' ?>"></i> <?= !empty($subscription['is_inscribed']) ? 'Inscription active' : 'Formation suivie' ?></span><span title="<?= !empty($subscription['notifications_active']) ? 'Notifications activées' : 'Notifications désactivées' ?>"><i class="fas <?= !empty($subscription['notifications_active']) ? 'fa-bell' : 'fa-bell-slash' ?>"></i></span></div>
                    <span class="jp-project-meta"><?php if (!empty($subscription['planning_statut'])): ?>Planning : <?= e(str_replace('_', ' ', (string)$subscription['planning_statut'])) ?><?php elseif (!empty($subscription['date_abonnement'])): ?>Suivie depuis le <?= e(date('d/m/Y', strtotime((string)$subscription['date_abonnement']))) ?><?php else: ?>Programme à organiser<?php endif; ?></span>
                    <h3><?= e($subscription['formation_titre']) ?></h3><p><?= e(mb_strimwidth((string)$subscription['formation_description'], 0, 190, '…', 'UTF-8')) ?></p>
                    <dl class="jp-course-facts"><div><dt>Niveau</dt><dd><?= e($subscription['formation_niveau'] ?: 'Tous niveaux') ?></dd></div><div><dt>Durée</dt><dd><?= e($subscription['formation_duree'] ?: 'À confirmer') ?></dd></div><div><dt>Début</dt><dd><?= e(jp_formation_date_label($subscription['formation_date_debut'] ?? '')) ?></dd></div></dl>
                    <a href="<?= e(!empty($subscription['is_inscribed']) ? app_route('/programme', ['id' => (int)$subscription['formation_id']]) : app_route('/formation', ['id' => (int)$subscription['formation_id']])) ?>"><?= !empty($subscription['is_inscribed']) ? 'Ouvrir mon programme' : 'Voir la formation' ?> <i class="fas fa-arrow-right"></i></a>
                </article>
            <?php endforeach; ?>
        </div><?php endif; ?>
    </div></section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
