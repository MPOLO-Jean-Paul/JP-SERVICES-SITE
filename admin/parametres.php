<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
require_once '../includes/connexion_db.php';

$editableSettings = [
    'annonce_texte' => ['Bandeau d’annonce — texte', 'Texte affiché dans le bandeau en haut de toutes les pages. Laisser vide pour masquer le bandeau.', 'text'],
    'annonce_url' => ['Bandeau d’annonce — lien', 'Adresse du lien du bandeau (ex. /formations ou https://…).', 'text'],
    'annonce_lien_label' => ['Bandeau d’annonce — libellé du lien', 'Texte du bouton du bandeau.', 'text'],
    'logiciels_intro' => ['Page Logiciels — introduction', 'Texte d’introduction affiché en haut de la page Logiciels.', 'textarea'],
    'partenariat_intro' => ['Page Partenariat — introduction', 'Texte d’introduction affiché en haut de la page Partenariat.', 'textarea'],
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $stmt = $conn->prepare('INSERT INTO site_settings (cle, valeur) VALUES (:cle, :valeur) ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)');
        foreach ($editableSettings as $key => $meta) {
            $stmt->execute([':cle' => $key, ':valeur' => mb_substr(trim((string)($_POST[$key] ?? '')), 0, 2000, 'UTF-8')]);
        }
        redirect('/admin/parametres?saved=1');
    } catch (Throwable $exception) {
        error_log('Paramètres site: ' . $exception->getMessage());
    }
}

$values = jp_settings_all($conn);

$page_title = 'Paramètres du site';
include '../includes/header_admin.php';
?>
<style>
    .jp-admin-card { background: var(--jp-panel, #fff); border: 1px solid var(--jp-classroom-line, #e5e0ef); border-radius: 12px; padding: 22px; max-width: 820px; }
    .jp-admin-form label { display: block; margin-bottom: 6px; font-size: .84rem; font-weight: 700; }
    .jp-admin-form small { display: block; margin: 4px 0 14px; color: var(--jp-classroom-copy, #5f5868); font-weight: 400; }
    .jp-admin-form input, .jp-admin-form textarea { width: 100%; margin-top: 5px; }
</style>

<div class="jp-admin-page">
    <div class="jp-admin-page-head">
        <div><h1 data-testid="admin-parametres-title">Paramètres du site</h1><p class="text-muted">Les contenus éditoriaux ci-dessous alimentent directement les pages publiques.</p></div>
    </div>

    <?php if (isset($_GET['saved'])): ?><div class="alert alert-success" data-testid="admin-parametres-flash">Paramètres enregistrés.</div><?php endif; ?>

    <div style="margin:0 0 18px;display:flex;gap:10px;flex-wrap:wrap">
        <a class="jp-btn jp-btn-secondary" href="<?= e(url('/admin/smtp-test')) ?>" data-testid="admin-parametres-smtp-link"><i class="fas fa-envelope-circle-check"></i> Tester la configuration SMTP</a>
        <a class="jp-btn jp-btn-secondary" href="<?= e(url('/admin/sante')) ?>" data-testid="admin-parametres-sante-link"><i class="fas fa-heart-pulse"></i> Santé du système</a>
    </div>

    <form class="jp-admin-card jp-admin-form" method="post" data-testid="admin-parametres-form">
        <?php foreach ($editableSettings as $key => [$label, $help, $kind]): ?>
        <label for="setting-<?= e($key) ?>"><?= e($label) ?></label>
        <?php if ($kind === 'textarea'): ?>
            <textarea id="setting-<?= e($key) ?>" name="<?= e($key) ?>" rows="3" maxlength="2000"><?= e((string)($values[$key] ?? '')) ?></textarea>
        <?php else: ?>
            <input id="setting-<?= e($key) ?>" type="text" name="<?= e($key) ?>" maxlength="500" value="<?= e((string)($values[$key] ?? '')) ?>">
        <?php endif; ?>
        <small><?= e($help) ?></small>
        <?php endforeach; ?>
        <button class="jp-btn jp-btn-primary" type="submit" data-testid="admin-parametres-submit"><i class="fas fa-floppy-disk"></i> Enregistrer les paramètres</button>
    </form>
</div>

<?php include '../includes/footer_admin.php'; ?>
