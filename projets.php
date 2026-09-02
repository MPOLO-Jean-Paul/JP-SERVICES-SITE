<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';
require_login();

$message = '';
$messageType = '';
$title = '';
$description = '';
$userId = (int)$_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim((string)($_POST['titre'] ?? ''));
    $description = trim((string)($_POST['description'] ?? ''));
    $titleLength = mb_strlen($title, 'UTF-8');
    $descriptionLength = mb_strlen($description, 'UTF-8');

    if ($titleLength < 5 || $titleLength > 180) {
        $message = 'Le titre doit contenir entre 5 et 180 caractères.';
        $messageType = 'danger';
    } elseif ($descriptionLength < 30 || $descriptionLength > 10000) {
        $message = 'La description doit contenir entre 30 et 10 000 caractères.';
        $messageType = 'danger';
    } elseif (!jp_rate_limit('project:' . $userId . ':' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 5, 3600)) {
        $message = 'Trop de projets ont été soumis récemment. Réessayez un peu plus tard.';
        $messageType = 'danger';
    } else {
        try {
            $statement = $conn->prepare('INSERT INTO projets (titre, description, auteur_id) VALUES (:titre, :description, :auteur_id)');
            $statement->execute(['titre' => $title, 'description' => $description, 'auteur_id' => $userId]);
            $_SESSION['project_flash'] = 'Votre projet a été transmis à notre équipe.';
            redirect('/projets#suivi');
        } catch (Throwable $exception) {
            error_log('Soumission projet : ' . $exception->getMessage());
            $message = 'Le projet n’a pas pu être enregistré. Veuillez réessayer.';
            $messageType = 'danger';
        }
    }
}

if (!empty($_SESSION['project_flash'])) {
    $message = (string)$_SESSION['project_flash'];
    $messageType = 'success';
    unset($_SESSION['project_flash']);
}

$projects = [];
$historyError = '';
try {
    $history = $conn->prepare('SELECT id, titre, description, date_soumission, statut FROM projets WHERE auteur_id = :user_id ORDER BY date_soumission DESC, id DESC');
    $history->execute(['user_id' => $userId]);
    $projects = $history->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Historique projets : ' . $exception->getMessage());
    $historyError = 'Votre historique est momentanément indisponible.';
}

$statusLabels = ['en_attente' => 'En attente', 'valide' => 'Validé', 'approuve' => 'Validé', 'rejete' => 'À revoir'];
$statusIcons = ['en_attente' => 'fa-clock', 'valide' => 'fa-circle-check', 'approuve' => 'fa-circle-check', 'rejete' => 'fa-circle-exclamation'];

include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-projects-page">
    <section class="jp-projects-hero">
        <div class="home-shell jp-projects-hero-grid">
            <div>
                <span class="home-eyebrow"><i class="fas fa-lightbulb"></i> Atelier de projets</span>
                <h2>Transformons votre idée en projet structuré.</h2>
                <p>Décrivez votre initiative, transmettez-la de manière sécurisée et suivez son examen depuis le même espace.</p>
                <div class="jp-project-proof"><span><i class="fas fa-shield-halved"></i> Données protégées</span><span><i class="fas fa-eye"></i> Suivi transparent</span></div>
            </div>
            <div class="jp-project-process" aria-label="Étapes de traitement">
                <div class="jp-hero-illustration" aria-hidden="true"><img src="<?= e(url('/images/hero-projets.jpg')) ?>" alt=""></div>
                <div><b>01</b><span><strong>Soumission</strong>Vous présentez votre besoin.</span></div>
                <div><b>02</b><span><strong>Analyse</strong>Notre équipe étudie sa faisabilité.</span></div>
                <div><b>03</b><span><strong>Retour</strong>Le statut évolue dans votre espace.</span></div>
            </div>
        </div>
    </section>

    <section class="home-section">
        <div class="home-shell">
            <?php if ($message !== ''): ?><div class="alert alert-<?= e($messageType) ?> jp-page-alert" role="status"><?= e($message) ?></div><?php endif; ?>
            <div class="jp-project-workspace">
                <section class="jp-project-form-card">
                    <span class="jp-thread-label">Nouvelle demande</span>
                    <h3>Présenter un projet</h3>
                    <p>Donnez suffisamment de contexte pour obtenir un premier retour pertinent.</p>
                    <form method="post" action="<?= e(url('/projets')) ?>">
                        <?= csrf_field() ?>
                        <div class="jp-field"><label class="form-label" for="titre">Nom du projet</label><input class="form-control" id="titre" name="titre" minlength="5" maxlength="180" value="<?= e($title) ?>" placeholder="Ex. Plateforme de suivi scolaire" required></div>
                        <div class="jp-field"><label class="form-label" for="description">Description détaillée</label><textarea class="form-control" id="description" name="description" rows="9" minlength="30" maxlength="10000" placeholder="Objectif, bénéficiaires, difficultés actuelles et résultat attendu…" required><?= e($description) ?></textarea><small>30 à 10 000 caractères</small></div>
                        <button class="jp-btn jp-btn-primary" type="submit">Transmettre pour analyse <i class="fas fa-arrow-right"></i></button>
                    </form>
                </section>

                <section class="jp-project-history" id="suivi">
                    <div class="jp-section-heading"><div><span>Tableau de suivi</span><h3>Mes projets</h3></div><strong><?= count($projects) ?></strong></div>
                    <?php if ($historyError !== ''): ?>
                        <div class="alert alert-danger"><?= e($historyError) ?></div>
                    <?php elseif ($projects): ?>
                        <div class="jp-project-list">
                            <?php foreach ($projects as $project):
                                $status = array_key_exists((string)$project['statut'], $statusLabels) ? (string)$project['statut'] : 'en_attente';
                            ?>
                                <article class="jp-project-item reveal">
                                    <div class="jp-project-item-main">
                                        <span class="jp-project-meta">Projet #<?= (int)$project['id'] ?> · <?= e(date('d/m/Y', strtotime((string)$project['date_soumission']))) ?></span>
                                        <h4><?= e($project['titre']) ?></h4>
                                        <p><?= e(mb_strimwidth((string)$project['description'], 0, 170, '…', 'UTF-8')) ?></p>
                                    </div>
                                    <div class="jp-project-item-actions">
                                        <span class="jp-status jp-status-<?= e($status) ?>"><i class="fas <?= e($statusIcons[$status]) ?>"></i><?= e($statusLabels[$status]) ?></span>
                                        <button class="jp-icon-button" type="button" data-jp-toggle="modal" data-jp-target="#project-<?= (int)$project['id'] ?>" aria-label="Voir les détails de <?= e($project['titre']) ?>"><i class="fas fa-arrow-up-right-from-square"></i></button>
                                    </div>
                                </article>

                                <div class="modal fade jp-project-modal" id="project-<?= (int)$project['id'] ?>" tabindex="-1" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="project-title-<?= (int)$project['id'] ?>">
                                    <div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-body">
                                        <div class="jp-modal-top"><span class="jp-status jp-status-<?= e($status) ?>"><i class="fas <?= e($statusIcons[$status]) ?>"></i><?= e($statusLabels[$status]) ?></span><button class="jp-icon-button" type="button" data-jp-dismiss="modal" aria-label="Fermer"><i class="fas fa-times"></i></button></div>
                                        <span class="jp-project-meta">Projet #<?= (int)$project['id'] ?> · soumis le <?= e(date('d/m/Y à H:i', strtotime((string)$project['date_soumission']))) ?></span>
                                        <h3 id="project-title-<?= (int)$project['id'] ?>"><?= e($project['titre']) ?></h3>
                                        <div class="jp-project-description"><?= nl2br(e($project['description'])) ?></div>
                                    </div></div></div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php else: ?>
                        <div class="jp-empty-state"><i class="far fa-folder-open"></i><h3>Aucun projet soumis</h3><p>Votre première demande apparaîtra ici avec son statut.</p></div>
                    <?php endif; ?>
                </section>
            </div>
        </div>
    </section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
