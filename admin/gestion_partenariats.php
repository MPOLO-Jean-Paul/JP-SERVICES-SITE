<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
require_once '../includes/connexion_db.php';

$message = '';
$status = '';

$requestStatuses = ['nouvelle', 'en_discussion', 'acceptee', 'refusee'];
$requestLabels = [
    'nouvelle' => 'Nouvelle',
    'en_discussion' => 'En discussion',
    'acceptee' => 'Acceptée',
    'refusee' => 'Refusée',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'ajouter_partenaire' || $action === 'modifier_partenaire') {
        $partenaireId = $action === 'modifier_partenaire' ? filter_input(INPUT_POST, 'partenaire_id', FILTER_VALIDATE_INT) : null;
        $nom = trim((string)($_POST['nom'] ?? ''));
        $description = trim((string)($_POST['description'] ?? ''));
        $siteWeb = trim((string)($_POST['site_web'] ?? ''));
        $typePartenariat = trim((string)($_POST['type_partenariat'] ?? ''));
        $ordre = filter_input(INPUT_POST, 'ordre', FILTER_VALIDATE_INT);
        $logoPath = null;

        if ($siteWeb !== '' && (!filter_var($siteWeb, FILTER_VALIDATE_URL) || !preg_match('~^https?://~i', $siteWeb))) {
            $message = 'Le site web doit être une URL valide (https://…).';
            $status = 'warning';
        } elseif (mb_strlen($nom, 'UTF-8') < 2 || mb_strlen($nom, 'UTF-8') > 160 || mb_strlen($description, 'UTF-8') > 2000 || mb_strlen($typePartenariat, 'UTF-8') > 80 || $ordre === false || $ordre < 0 || $ordre > 1000) {
            $message = 'Vérifiez le nom, la description et l’ordre d’affichage.';
            $status = 'warning';
        } else {
            try {
                if (isset($_FILES['logo']) && ($_FILES['logo']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                    $logoPath = jp_upload_image($_FILES['logo'], 'images/partenaires', 3 * 1024 * 1024);
                }
                if ($action === 'ajouter_partenaire') {
                    $stmt = $conn->prepare('INSERT INTO partenaires (nom, logo, description, site_web, type_partenariat, ordre) VALUES (:nom, :logo, :description, :site, :type, :ordre)');
                    $stmt->execute([':nom' => $nom, ':logo' => (string)$logoPath, ':description' => $description, ':site' => $siteWeb, ':type' => $typePartenariat, ':ordre' => $ordre]);
                } else {
                    $setLogo = $logoPath !== null ? ', logo = :logo' : '';
                    $sql = 'UPDATE partenaires SET nom = :nom, description = :description, site_web = :site, type_partenariat = :type, ordre = :ordre' . $setLogo . ' WHERE id = :id';
                    $params = [':nom' => $nom, ':description' => $description, ':site' => $siteWeb, ':type' => $typePartenariat, ':ordre' => $ordre, ':id' => $partenaireId];
                    if ($logoPath !== null) {
                        $params[':logo'] = $logoPath;
                        $old = $conn->prepare('SELECT logo FROM partenaires WHERE id = :id');
                        $old->execute([':id' => $partenaireId]);
                        $oldLogo = $old->fetchColumn();
                    }
                    $conn->prepare($sql)->execute($params);
                    if (isset($oldLogo) && is_string($oldLogo) && $oldLogo !== '') {
                        jp_safe_delete_media($oldLogo, ['images/partenaires']);
                    }
                }
                redirect('/admin/partenariats?saved=1');
            } catch (RuntimeException $exception) {
                $message = $exception->getMessage();
                $status = 'danger';
            } catch (Throwable $exception) {
                error_log('Partenaire: ' . $exception->getMessage());
                $message = 'Le partenaire n’a pas pu être enregistré.';
                $status = 'danger';
            }
        }
    }

    if ($action === 'supprimer_partenaire') {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        if ($id) {
            $stmt = $conn->prepare('SELECT logo FROM partenaires WHERE id = :id');
            $stmt->execute([':id' => $id]);
            $logo = $stmt->fetchColumn();
            $conn->prepare('DELETE FROM partenaires WHERE id = :id')->execute([':id' => $id]);
            if (is_string($logo) && $logo !== '') {
                jp_safe_delete_media($logo, ['images/partenaires']);
            }
            redirect('/admin/partenariats?deleted=1');
        }
    }

    if ($action === 'basculer_partenaire') {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        if ($id) {
            $conn->prepare('UPDATE partenaires SET actif = 1 - actif WHERE id = :id')->execute([':id' => $id]);
            redirect('/admin/partenariats?status=1');
        }
    }

    if ($action === 'statut_demande') {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        $newStatus = (string)($_POST['statut'] ?? '');
        $note = trim((string)($_POST['note_admin'] ?? ''));
        if ($id && in_array($newStatus, $requestStatuses, true)) {
            $conn->prepare('UPDATE partenariat_demandes SET statut = :statut, note_admin = :note WHERE id = :id')->execute([':statut' => $newStatus, ':note' => mb_substr($note, 0, 2000, 'UTF-8'), ':id' => $id]);
            redirect('/admin/partenariats?request=1#demandes');
        }
    }

    if ($action === 'supprimer_demande') {
        $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
        if ($id) {
            $conn->prepare('DELETE FROM partenariat_demandes WHERE id = :id')->execute([':id' => $id]);
            redirect('/admin/partenariats?request_deleted=1#demandes');
        }
    }
}

$editPartenaire = null;
$editId = filter_input(INPUT_GET, 'edit', FILTER_VALIDATE_INT);
if ($editId) {
    $stmt = $conn->prepare('SELECT * FROM partenaires WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $editId]);
    $editPartenaire = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

$partenaires = $conn->query('SELECT * FROM partenaires ORDER BY ordre ASC, nom ASC')->fetchAll(PDO::FETCH_ASSOC);
$demandes = $conn->query('SELECT * FROM partenariat_demandes ORDER BY (statut = "nouvelle") DESC, date_demande DESC')->fetchAll(PDO::FETCH_ASSOC);
$newCount = count(array_filter($demandes, static fn(array $d) => $d['statut'] === 'nouvelle'));

$page_title = 'Partenariats';
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
    .jp-soft-badge.is-on { background: #e5f6ec; color: #1e7a3c; }
    .jp-soft-badge.is-off { background: #f1f0f5; color: #6b6474; }
    .jp-soft-badge.is-new { background: #e7f0fd; color: #1a5fc1; }
    .jp-soft-badge.is-talk { background: #fdf3e0; color: #9a6a00; }
    .jp-soft-badge.is-no { background: #fdeceb; color: #b3372f; }
    .jp-admin-form label { display: block; margin-bottom: 12px; font-size: .8rem; font-weight: 700; color: var(--jp-classroom-copy, #5f5868); }
    .jp-admin-form input, .jp-admin-form select, .jp-admin-form textarea { width: 100%; margin-top: 5px; }
    .jp-request-details summary { cursor: pointer; font-weight: 700; }
    .jp-request-details p { white-space: pre-line; color: var(--jp-classroom-copy, #5f5868); font-size: .86rem; }
</style>

<div class="jp-admin-page">
    <div class="jp-admin-page-head">
        <div><h1 data-testid="admin-partenariats-title">Partenariats</h1><p class="text-muted">Gérez les partenaires affichés sur le site et suivez les demandes reçues via le formulaire.</p></div>
        <a class="jp-btn jp-btn-secondary" href="<?= e(url('/partenariat')) ?>" target="_blank" rel="noopener"><i class="fas fa-arrow-up-right-from-square"></i> Voir la page publique</a>
    </div>

    <?php foreach (['saved' => 'Partenaire enregistré.', 'deleted' => 'Partenaire supprimé.', 'status' => 'Visibilité mise à jour.', 'request' => 'Demande mise à jour.', 'request_deleted' => 'Demande supprimée.'] as $key => $text): ?>
        <?php if (isset($_GET[$key])): ?><div class="alert alert-success" data-testid="admin-partenariats-flash"><?= e($text) ?></div><?php endif; ?>
    <?php endforeach; ?>
    <?php if ($message !== ''): ?><div class="alert alert-<?= e($status) ?>" data-testid="admin-partenariats-flash"><?= e($message) ?></div><?php endif; ?>

    <div class="jp-admin-soft-grid">
        <form class="jp-admin-card jp-admin-form" method="post" enctype="multipart/form-data" data-testid="admin-partenaire-form">
            <h2><i class="fas <?= $editPartenaire ? 'fa-pen' : 'fa-plus' ?>"></i> <?= $editPartenaire ? 'Modifier le partenaire' : 'Nouveau partenaire' ?></h2>
            <input type="hidden" name="action" value="<?= $editPartenaire ? 'modifier_partenaire' : 'ajouter_partenaire' ?>">
            <?php if ($editPartenaire): ?><input type="hidden" name="partenaire_id" value="<?= (int)$editPartenaire['id'] ?>"><?php endif; ?>
            <label>Nom de l’organisation
                <input type="text" name="nom" minlength="2" maxlength="160" value="<?= e($editPartenaire['nom'] ?? '') ?>" required data-testid="admin-partenaire-nom">
            </label>
            <label>Description courte
                <textarea name="description" rows="3" maxlength="2000" placeholder="Domaine d’activité, nature du soutien…"><?= e($editPartenaire['description'] ?? '') ?></textarea>
            </label>
            <label>Site web (facultatif)
                <input type="url" name="site_web" maxlength="500" value="<?= e($editPartenaire['site_web'] ?? '') ?>" placeholder="https://…">
            </label>
            <label>Type de partenariat
                <input type="text" name="type_partenariat" maxlength="80" value="<?= e($editPartenaire['type_partenariat'] ?? '') ?>" placeholder="Ex. Formation, Sponsoring…">
            </label>
            <label>Logo <?= $editPartenaire ? '(laisser vide pour conserver)' : '' ?>
                <input type="file" name="logo" accept="image/jpeg,image/png,image/webp,image/gif">
            </label>
            <label>Ordre d’affichage
                <input type="number" name="ordre" min="0" max="1000" value="<?= e((string)($editPartenaire['ordre'] ?? 0)) ?>">
            </label>
            <button class="jp-btn jp-btn-primary" type="submit" data-testid="admin-partenaire-submit"><i class="fas fa-floppy-disk"></i> <?= $editPartenaire ? 'Enregistrer' : 'Ajouter le partenaire' ?></button>
            <?php if ($editPartenaire): ?><a class="jp-btn jp-btn-ghost" href="<?= e(url('/admin/partenariats')) ?>">Annuler la modification</a><?php endif; ?>
        </form>

        <div class="jp-admin-card">
            <h2><i class="fas fa-handshake"></i> Partenaires (<?= count($partenaires) ?>)</h2>
            <div style="overflow-x:auto">
                <table class="jp-soft-table">
                    <thead><tr><th>Partenaire</th><th>Type</th><th>Visibilité</th><th style="text-align:right">Actions</th></tr></thead>
                    <tbody>
                    <?php foreach ($partenaires as $partenaire): ?>
                        <tr data-testid="admin-partenaire-row-<?= (int)$partenaire['id'] ?>">
                            <td><strong><?= e($partenaire['nom']) ?></strong><?php if ($partenaire['site_web'] !== ''): ?> <a href="<?= e($partenaire['site_web']) ?>" target="_blank" rel="noopener noreferrer" title="Visiter"><i class="fas fa-arrow-up-right-from-square fa-xs"></i></a><?php endif; ?></td>
                            <td><?= e($partenaire['type_partenariat'] !== '' ? $partenaire['type_partenariat'] : '—') ?></td>
                            <td><span class="jp-soft-badge <?= $partenaire['actif'] ? 'is-on' : 'is-off' ?>"><?= $partenaire['actif'] ? 'Visible' : 'Masqué' ?></span></td>
                            <td style="text-align:right;white-space:nowrap">
                                <form method="post" style="display:inline">
                                    <input type="hidden" name="action" value="basculer_partenaire">
                                    <input type="hidden" name="id" value="<?= (int)$partenaire['id'] ?>">
                                    <button class="jp-icon-btn" type="submit" title="<?= $partenaire['actif'] ? 'Masquer' : 'Afficher' ?>"><i class="fas <?= $partenaire['actif'] ? 'fa-eye-slash' : 'fa-eye' ?>"></i></button>
                                </form>
                                <a class="jp-icon-btn" href="<?= e(app_route('/admin/partenariats', ['edit' => (int)$partenaire['id']])) ?>" title="Modifier"><i class="fas fa-pen"></i></a>
                                <form method="post" style="display:inline" data-confirm="Supprimer ce partenaire ?">
                                    <input type="hidden" name="action" value="supprimer_partenaire">
                                    <input type="hidden" name="id" value="<?= (int)$partenaire['id'] ?>">
                                    <button class="jp-icon-btn jp-danger" type="submit" title="Supprimer"><i class="fas fa-trash"></i></button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    <?php if ($partenaires === []): ?><tr><td colspan="4" style="text-align:center;padding:32px" class="text-muted">Aucun partenaire enregistré.</td></tr><?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="jp-admin-card" id="demandes" style="margin-top:24px">
        <h2><i class="fas fa-inbox"></i> Demandes de partenariat <?= $newCount > 0 ? '<span class="jp-soft-badge is-new">' . $newCount . ' nouvelle' . ($newCount > 1 ? 's' : '') . '</span>' : '' ?></h2>
        <div style="overflow-x:auto">
            <table class="jp-soft-table">
                <thead><tr><th>Organisation</th><th>Contact</th><th>Type</th><th>Reçue le</th><th>Statut</th><th style="text-align:right">Actions</th></tr></thead>
                <tbody>
                <?php foreach ($demandes as $demande): ?>
                    <tr data-testid="admin-demande-row-<?= (int)$demande['id'] ?>">
                        <td>
                            <details class="jp-request-details">
                                <summary><?= e($demande['organisation']) ?></summary>
                                <p><?= e($demande['message']) ?></p>
                                <form method="post" class="jp-admin-form" style="margin-top:10px">
                                    <input type="hidden" name="action" value="statut_demande">
                                    <input type="hidden" name="id" value="<?= (int)$demande['id'] ?>">
                                    <label>Note interne (facultatif)
                                        <textarea name="note_admin" rows="2" maxlength="2000"><?= e((string)$demande['note_admin']) ?></textarea>
                                    </label>
                                    <label>Statut
                                        <select name="statut" data-testid="admin-demande-statut-<?= (int)$demande['id'] ?>">
                                            <?php foreach ($requestLabels as $value => $label): ?><option value="<?= e($value) ?>" <?= $demande['statut'] === $value ? 'selected' : '' ?>><?= e($label) ?></option><?php endforeach; ?>
                                        </select>
                                    </label>
                                    <button class="jp-btn jp-btn-secondary" type="submit"><i class="fas fa-floppy-disk"></i> Mettre à jour</button>
                                </form>
                            </details>
                        </td>
                        <td><?= e($demande['contact_nom']) ?><br><small><a href="mailto:<?= e($demande['email']) ?>"><?= e($demande['email']) ?></a><?= $demande['telephone'] !== '' ? ' · ' . e($demande['telephone']) : '' ?></small></td>
                        <td><?= e($demande['type_partenariat']) ?></td>
                        <td><?= e(date('d/m/Y', strtotime((string)$demande['date_demande']))) ?></td>
                        <td><span class="jp-soft-badge <?= ['nouvelle' => 'is-new', 'en_discussion' => 'is-talk', 'acceptee' => 'is-on', 'refusee' => 'is-no'][$demande['statut']] ?? 'is-off' ?>"><?= e($requestLabels[$demande['statut']] ?? $demande['statut']) ?></span></td>
                        <td style="text-align:right">
                            <form method="post" style="display:inline" data-confirm="Supprimer définitivement cette demande ?">
                                <input type="hidden" name="action" value="supprimer_demande">
                                <input type="hidden" name="id" value="<?= (int)$demande['id'] ?>">
                                <button class="jp-icon-btn jp-danger" type="submit" title="Supprimer"><i class="fas fa-trash"></i></button>
                            </form>
                        </td>
                    </tr>
                <?php endforeach; ?>
                <?php if ($demandes === []): ?><tr><td colspan="6" style="text-align:center;padding:32px" class="text-muted">Aucune demande reçue pour le moment.</td></tr><?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php include '../includes/footer_admin.php'; ?>
