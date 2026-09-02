<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';
require_login();

$projectId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if (!$projectId) {
    redirect('/mes-projets');
}

$statement = $conn->prepare("SELECT id, titre, description, date_soumission FROM projets WHERE id = :id AND auteur_id = :user_id AND statut = 'valide' LIMIT 1");
$statement->execute(['id' => $projectId, 'user_id' => (int)$_SESSION['user_id']]);
$project = $statement->fetch(PDO::FETCH_ASSOC);
if (!$project) {
    jp_abort(404, 'Ce projet est introuvable ou ne vous est pas accessible.');
}

include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-member-page">
    <section class="jp-project-detail-hero"><div class="home-shell"><a class="jp-back-link" href="<?= e(url('/mes-projets')) ?>"><i class="fas fa-arrow-left"></i> Mes projets validés</a><span class="jp-status jp-status-valide"><i class="fas fa-circle-check"></i> Projet validé</span><h2><?= e($project['titre']) ?></h2><p>Soumis le <?= e(date('d/m/Y', strtotime((string)$project['date_soumission']))) ?></p></div></section>
    <section class="home-section"><div class="home-shell"><article class="jp-project-detail"><div class="jp-section-heading"><div><span>Présentation</span><h3>Description du projet</h3></div></div><div class="jp-project-detail-copy"><?= nl2br(e($project['description'])) ?></div><div class="jp-project-detail-actions"><a class="jp-btn jp-btn-secondary" href="<?= e(url('/mes-projets')) ?>">Retour aux projets</a><a class="jp-btn jp-btn-primary" href="<?= e(url('/contact')) ?>">Échanger avec l’équipe <i class="fas fa-arrow-right"></i></a></div></article></div></section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
