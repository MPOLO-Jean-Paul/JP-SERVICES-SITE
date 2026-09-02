<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
require_once '../includes/connexion_db.php';

$message = '';
$status = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'creer') {
        $titre = trim((string)($_POST['titre'] ?? ''));
        $description = trim((string)($_POST['description'] ?? ''));
        $formateur = trim((string)($_POST['formateur'] ?? ''));
        $formationId = filter_input(INPUT_POST, 'formation_id', FILTER_VALIDATE_INT) ?: null;
        $date = trim((string)($_POST['date_debut'] ?? ''));
        $heure = trim((string)($_POST['heure_debut'] ?? ''));
        $duree = filter_input(INPUT_POST, 'duree_minutes', FILTER_VALIDATE_INT);
        $acces = in_array(($_POST['acces'] ?? ''), ['public', 'membres'], true) ? (string)$_POST['acces'] : 'membres';

        $start = DateTimeImmutable::createFromFormat('Y-m-d H:i', $date . ' ' . $heure);
        if (mb_strlen($titre, 'UTF-8') < 3 || mb_strlen($titre, 'UTF-8') > 190 || !$start || $duree === false || $duree < 15 || $duree > 480 || mb_strlen($formateur, 'UTF-8') > 160 || mb_strlen($description, 'UTF-8') > 5000) {
            $message = 'Vérifiez le titre, la date, l’heure et la durée (15 à 480 minutes).';
            $status = 'warning';
        } else {
            try {
                $room = 'jpservices-' . strtolower(bin2hex(random_bytes(8)));
                $stmt = $conn->prepare('INSERT INTO live_sessions (formation_id, titre, description, formateur, room_name, date_debut, duree_minutes, acces) VALUES (:formation, :titre, :description, :formateur, :room, :debut, :duree, :acces)');
                $stmt->execute([
                    ':formation' => $formationId,
                    ':titre' => $titre,
                    ':description' => $description,
                    ':formateur' => $formateur,
                    ':room' => $room,
                    ':debut' => $start->format('Y-m-d H:i:s'),
                    ':duree' => $duree,
                    ':acces' => $acces,
                ]);
                redirect('/admin/live?created=1');
            } catch (Throwable $exception) {
                error_log('Création session live: ' . $exception->getMessage());
                $message = 'La session n’a pas pu être créée.';
                $status = 'danger';
            }
        }
    }

    if (in_array($action, ['demarrer', 'terminer', 'annuler', 'replanifier', 'supprimer'], true)) {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        if ($id) {
            if ($action === 'supprimer') {
                $conn->prepare('DELETE FROM live_sessions WHERE id = :id')->execute([':id' => $id]);
                redirect('/admin/live?deleted=1');
            }
            $newStatus = ['demarrer' => 'en_cours', 'terminer' => 'terminee', 'annuler' => 'annulee', 'replanifier' => 'planifiee'][$action];
            $conn->prepare('UPDATE live_sessions SET statut = :statut WHERE id = :id')->execute([':statut' => $newStatus, ':id' => $id]);
            redirect('/admin/live?status=1');
        }
    }
}

$sessions = $conn->query('SELECT s.*, f.titre AS formation_titre FROM live_sessions s LEFT JOIN formations f ON f.id = s.formation_id ORDER BY (s.statut = "en_cours") DESC, (s.statut = "planifiee") DESC, s.date_debut DESC')->fetchAll(PDO::FETCH_ASSOC);
try {
    $formationsList = $conn->query('SELECT id, titre FROM formations ORDER BY titre ASC')->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    $formationsList = [];
}

$statusLabels = ['planifiee' => 'Planifiée', 'en_cours' => 'En direct', 'terminee' => 'Terminée', 'annulee' => 'Annulée'];

$page_title = 'Formations en ligne';
include '../includes/header_admin.php';
?>
<style>
    .jp-admin-soft-grid { display: grid; grid-template-columns: minmax(300px, 380px) 1fr; gap: 24px; align-items: start; }
    @media (max-width: 960px) { .jp-admin-soft-grid { grid-template-columns: 1fr; } }
    .jp-admin-card { background: var(--jp-panel, #fff); border: 1px solid var(--jp-classroom-line, #e5e0ef); border-radius: 12px; padding: 22px; }
    .jp-admin-card h2 { margin: 0 0 18px; font-size: 1.05rem; }
    .jp-soft-table { width: 100%; border-collapse: collapse; font-size: .88rem; }
    .jp-soft-table th { text-align: left; padding: 10px 12px; font-size: .72rem; text-transform: uppercase; letter-spacing: .06em; color: var(--jp-classroom-copy, #5f5868); border-bottom: 1px solid var(--jp-classroom-line, #e5e0ef); }
    .jp-soft-table td { padding: 12px; border-bottom: 1px solid var(--jp-classroom-line, #e5e0ef); vertical-align: middle; }
    .jp-soft-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 99px; font-size: .72rem; font-weight: 700; }
    .jp-soft-badge.is-live { background: #fdeceb; color: #b3372f; }
    .jp-soft-badge.is-planned { background: #e7f0fd; color: #1a5fc1; }
    .jp-soft-badge.is-done { background: #e5f6ec; color: #1e7a3c; }
    .jp-soft-badge.is-off { background: #f1f0f5; color: #6b6474; }
    .jp-admin-form label { display: block; margin-bottom: 12px; font-size: .8rem; font-weight: 700; color: var(--jp-classroom-copy, #5f5868); }
    .jp-admin-form input, .jp-admin-form select, .jp-admin-form textarea { width: 100%; margin-top: 5px; }
    .jp-admin-form .jp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 640px) { .jp-admin-form .jp-row { grid-template-columns: 1fr; } }
    .jp-live-link { display: inline-flex; align-items: center; gap: 6px; font-size: .78rem; }
</style>

<div class="jp-admin-page">
    <div class="jp-admin-page-head">
        <div><h1 data-testid="admin-live-title">Formations en ligne</h1><p class="text-muted">Créez des salles de visioconférence, partagez le lien d’invitation et pilotez les sessions en direct.</p></div>
        <a class="jp-btn jp-btn-secondary" href="<?= e(url('/formations-en-ligne')) ?>" target="_blank" rel="noopener"><i class="fas fa-arrow-up-right-from-square"></i> Voir la page publique</a>
    </div>

    <?php foreach (['created' => 'Session créée. Le lien d’invitation est prêt à être partagé.', 'deleted' => 'Session supprimée.', 'status' => 'Statut de la session mis à jour.'] as $key => $text): ?>
        <?php if (isset($_GET[$key])): ?><div class="alert alert-success" data-testid="admin-live-flash"><?= e($text) ?></div><?php endif; ?>
    <?php endforeach; ?>
    <?php if ($message !== ''): ?><div class="alert alert-<?= e($status) ?>" data-testid="admin-live-flash"><?= e($message) ?></div><?php endif; ?>

    <div class="jp-admin-soft-grid">
        <form class="jp-admin-card jp-admin-form" method="post" data-testid="admin-live-form">
            <h2><i class="fas fa-video"></i> Nouvelle session en ligne</h2>
            <input type="hidden" name="action" value="creer">
            <label>Titre de la session
                <input type="text" name="titre" minlength="3" maxlength="190" required placeholder="Ex. Atelier Excel — session 2" data-testid="admin-live-titre">
            </label>
            <label>Formation associée (facultatif)
                <select name="formation_id">
                    <option value="">Aucune</option>
                    <?php foreach ($formationsList as $formation): ?><option value="<?= (int)$formation['id'] ?>"><?= e($formation['titre']) ?></option><?php endforeach; ?>
                </select>
            </label>
            <label>Hôte / formateur
                <input type="text" name="formateur" maxlength="160" value="<?= e(trim((string)($_SESSION['user_prenom'] ?? '') . ' ' . (string)($_SESSION['user_nom'] ?? ''))) ?>" placeholder="Nom de l’animateur">
            </label>
            <div class="jp-row">
                <label>Date
                    <input type="date" name="date_debut" required data-testid="admin-live-date">
                </label>
                <label>Heure
                    <input type="time" name="heure_debut" required>
                </label>
            </div>
            <div class="jp-row">
                <label>Durée (minutes)
                    <input type="number" name="duree_minutes" min="15" max="480" value="60" required>
                </label>
                <label>Accès
                    <select name="acces">
                        <option value="membres">Membres connectés</option>
                        <option value="public">Tout public (lien seul)</option>
                    </select>
                </div>
            </div>
            <label>Description (facultatif)
                <textarea name="description" rows="3" maxlength="5000" placeholder="Objectifs de la session, prérequis…"></textarea>
            </label>
            <button class="jp-btn jp-btn-primary" type="submit" data-testid="admin-live-submit"><i class="fas fa-plus"></i> Créer la salle et le lien</button>
            <small class="text-muted">La salle de visioconférence est générée automatiquement (Jitsi Meet, sans installation). En tant qu’hôte, entrez en premier pour obtenir les droits de modération.</small>
        </form>

        <div class="jp-admin-card">
            <h2><i class="fas fa-list"></i> Sessions (<?= count($sessions) ?>)</h2>
            <div style="overflow-x:auto">
                <table class="jp-soft-table">
                    <thead><tr><th>Session</th><th>Date</th><th>Accès</th><th>Statut</th><th style="text-align:right">Actions</th></tr></thead>
                    <tbody>
                    <?php foreach ($sessions as $session):
                        $invite = absolute_url(app_route('/visio', ['id' => (int)$session['id']]));
                        $badge = ['planifiee' => 'is-planned', 'en_cours' => 'is-live', 'terminee' => 'is-done', 'annulee' => 'is-off'][$session['statut']] ?? 'is-off';
                    ?>
                        <tr data-testid="admin-live-row-<?= (int)$session['id'] ?>">
                            <td>
                                <strong><?= e($session['titre']) ?></strong>
                                <br><small class="text-muted"><?= e($session['formateur'] !== '' ? $session['formateur'] : 'Équipe JP-Services') ?><?= !empty($session['formation_titre']) ? ' · ' . e($session['formation_titre']) : '' ?></small>
                                <br><span class="jp-live-link"><i class="fas fa-link"></i> <input type="text" readonly value="<?= e($invite) ?>" style="width:190px;font-size:.72rem;padding:3px 7px" onclick="this.select()"> <button class="jp-icon-btn" type="button" title="Copier le lien" data-copy-live><i class="far fa-copy"></i></button></span>
                            </td>
                            <td><?= e(date('d/m/Y H\hi', strtotime((string)$session['date_debut']))) ?><br><small class="text-muted"><?= (int)$session['duree_minutes'] ?> min</small></td>
                            <td><?= $session['acces'] === 'public' ? 'Public' : 'Membres' ?></td>
                            <td><span class="jp-soft-badge <?= e($badge) ?>"><?= e($statusLabels[$session['statut']] ?? $session['statut']) ?></span></td>
                            <td style="text-align:right;white-space:nowrap">
                                <a class="jp-icon-btn" href="<?= e(app_route('/visio', ['id' => (int)$session['id']])) ?>" title="Ouvrir la salle (hôte)"><i class="fas fa-video"></i></a>
                                <?php if ($session['statut'] === 'planifiee'): ?>
                                <form method="post" style="display:inline"><input type="hidden" name="action" value="demarrer"><input type="hidden" name="id" value="<?= (int)$session['id'] ?>"><button class="jp-icon-btn" type="submit" title="Marquer en direct"><i class="fas fa-play"></i></button></form>
                                <form method="post" style="display:inline" data-confirm="Annuler cette session ?"><input type="hidden" name="action" value="annuler"><input type="hidden" name="id" value="<?= (int)$session['id'] ?>"><button class="jp-icon-btn" type="submit" title="Annuler"><i class="fas fa-ban"></i></button></form>
                                <?php elseif ($session['statut'] === 'en_cours'): ?>
                                <form method="post" style="display:inline"><input type="hidden" name="action" value="terminer"><input type="hidden" name="id" value="<?= (int)$session['id'] ?>"><button class="jp-icon-btn" type="submit" title="Clôturer la session"><i class="fas fa-stop"></i></button></form>
                                <?php elseif (in_array($session['statut'], ['terminee', 'annulee'], true)): ?>
                                <form method="post" style="display:inline"><input type="hidden" name="action" value="replanifier"><input type="hidden" name="id" value="<?= (int)$session['id'] ?>"><button class="jp-icon-btn" type="submit" title="Republier comme planifiée"><i class="fas fa-rotate-left"></i></button></form>
                                <?php endif; ?>
                                <form method="post" style="display:inline" data-confirm="Supprimer définitivement cette session ?"><input type="hidden" name="action" value="supprimer"><input type="hidden" name="id" value="<?= (int)$session['id'] ?>"><button class="jp-icon-btn jp-danger" type="submit" title="Supprimer"><i class="fas fa-trash"></i></button></form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    <?php if ($sessions === []): ?><tr><td colspan="5" style="text-align:center;padding:32px" class="text-muted">Aucune session créée.</td></tr><?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script>
document.querySelectorAll('[data-copy-live]').forEach(function (button) {
    button.addEventListener('click', async function () {
        var input = button.parentElement.querySelector('input');
        if (!input) return;
        try { await navigator.clipboard.writeText(input.value); button.innerHTML = '<i class="fas fa-check"></i>'; setTimeout(function () { button.innerHTML = '<i class="far fa-copy"></i>'; }, 2000); }
        catch (error) { input.select(); document.execCommand('copy'); }
    });
});
</script>

<?php include '../includes/footer_admin.php'; ?>
