<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';
require_login();

$projects = [];
$error = '';
try {
    $statement = $conn->prepare("SELECT id, titre, description, date_soumission FROM projets WHERE auteur_id = :user_id AND statut = 'valide' ORDER BY date_soumission DESC, id DESC");
    $statement->execute(['user_id' => (int)$_SESSION['user_id']]);
    $projects = $statement->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Projets validés : ' . $exception->getMessage());
    $error = 'Vos projets validés sont momentanément indisponibles.';
}

include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-member-page">
    <section class="jp-member-hero">
        <div class="home-shell jp-member-hero-inner">
            <div><span class="home-eyebrow"><i class="fas fa-circle-check"></i> Projets validés</span><h2>Les initiatives retenues par notre équipe.</h2><p>Consultez les projets dont l’analyse est terminée et accédez à leur présentation complète.</p></div>
            <a class="jp-btn jp-btn-primary" href="<?= e(url('/projets')) ?>"><i class="fas fa-plus"></i> Soumettre ou suivre un projet</a>
        </div>
    </section>
    <section class="home-section"><div class="home-shell">
        <?php if ($error !== ''): ?><div class="alert alert-danger"><?= e($error) ?></div>
        <?php elseif (!$projects): ?><div class="jp-empty-state jp-member-empty"><i class="far fa-folder-open"></i><h3>Aucun projet validé pour le moment</h3><p>Les demandes en cours d’analyse restent visibles dans votre tableau de suivi.</p><a class="jp-btn jp-btn-primary" href="<?= e(url('/projets#suivi')) ?>">Voir le suivi</a></div>
        <?php else: ?><div class="jp-member-card-grid">
            <?php foreach ($projects as $project): ?>
                <article class="jp-member-card reveal">
                    <div class="jp-member-card-top"><span class="jp-status jp-status-valide"><i class="fas fa-circle-check"></i> Validé</span><time datetime="<?= e(date('Y-m-d', strtotime((string)$project['date_soumission']))) ?>"><?= e(date('d/m/Y', strtotime((string)$project['date_soumission']))) ?></time></div>
                    <h3><?= e($project['titre']) ?></h3><p><?= e(mb_strimwidth((string)$project['description'], 0, 190, '…', 'UTF-8')) ?></p>
                    <a href="<?= e(app_route('/projet', ['id' => (int)$project['id']])) ?>">Consulter le projet <i class="fas fa-arrow-right"></i></a>
                </article>
            <?php endforeach; ?>
        </div><?php endif; ?>
    </div></section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
