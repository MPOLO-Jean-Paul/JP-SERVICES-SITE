<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
require_once '../includes/connexion_db.php';

$editableSettings = [
    'contact_email' => ['Adresse e-mail professionnelle de contact', 'Visible sur la page Contact et en pied de page. Vide : utiliser CONTACT_EMAIL du .env.', 'email'],
    'contact_phone' => ['Téléphone public', 'Numéro international conseillé (ex. +243 977 152 825). Vide : valeur CONTACT_PHONE ou numéro actuel.', 'tel'],
    'contact_whatsapp' => ['WhatsApp professionnel', 'Numéro international avec indicatif (ex. +243 860 951 131). Vide : valeur CONTACT_WHATSAPP ou numéro actuel.', 'tel'],
    'annonce_texte' => ['Bandeau d’annonce — texte', 'Texte affiché dans le bandeau en haut de toutes les pages. Laisser vide pour masquer le bandeau.', 'text'],
    'annonce_url' => ['Bandeau d’annonce — lien', 'Adresse du lien du bandeau (ex. /formations ou https://…).', 'text'],
    'annonce_lien_label' => ['Bandeau d’annonce — libellé du lien', 'Texte du bouton du bandeau.', 'text'],
    'logiciels_intro' => ['Page Logiciels — introduction', 'Texte d’introduction affiché en haut de la page Logiciels.', 'textarea'],
    'partenariat_intro' => ['Page Partenariat — introduction', 'Texte d’introduction affiché en haut de la page Partenariat.', 'textarea'],
];

$saveError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $contactEmail = trim((string)($_POST['contact_email'] ?? ''));
    $contactPhone = trim((string)($_POST['contact_phone'] ?? ''));
    $contactWhatsapp = trim((string)($_POST['contact_whatsapp'] ?? ''));
    if ($contactEmail !== '' && (strlen($contactEmail) > 254 || !filter_var($contactEmail, FILTER_VALIDATE_EMAIL))) {
        $saveError = 'Veuillez saisir une adresse e-mail de contact valide.';
    } elseif ($contactPhone !== '' && !jp_valid_public_phone($contactPhone)) {
        $saveError = 'Le numéro de téléphone public est invalide.';
    } elseif ($contactWhatsapp !== '' && jp_normalize_whatsapp($contactWhatsapp) === null) {
        $saveError = 'Saisissez un numéro WhatsApp international valide.';
    } else {
        try {
            $conn->beginTransaction();
            $stmt = $conn->prepare('INSERT INTO site_settings (cle, valeur) VALUES (:cle, :valeur) ON DUPLICATE KEY UPDATE valeur = VALUES(valeur)');
            foreach ($editableSettings as $key => $meta) {
                $value = match ($key) {
                    'contact_email' => $contactEmail,
                    'contact_phone' => $contactPhone,
                    'contact_whatsapp' => $contactWhatsapp !== '' ? jp_normalize_whatsapp($contactWhatsapp) : '',
                    default => mb_substr(trim((string)($_POST[$key] ?? '')), 0, 2000, 'UTF-8'),
                };
                $stmt->execute([':cle' => $key, ':valeur' => $value]);
            }
            $conn->commit();
            redirect('/admin/parametres?saved=1');
        } catch (Throwable $exception) {
            if ($conn->inTransaction()) {
                $conn->rollBack();
            }
            error_log('Paramètres site: ' . $exception->getMessage());
            $saveError = 'Enregistrement impossible. Veuillez réessayer.';
        }
    }
}

$values = jp_settings_all($conn);
if ($saveError !== '') {
    foreach (array_keys($editableSettings) as $key) {
        if (isset($_POST[$key]) && is_string($_POST[$key])) {
            $values[$key] = $_POST[$key];
        }
    }
}

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

    <?php if ($saveError !== ''): ?><div class="alert alert-danger" role="alert"><?= e($saveError) ?></div><?php endif; ?>
    <?php if (isset($_GET['saved']) && $saveError === ''): ?><div class="alert alert-success" data-testid="admin-parametres-flash">Paramètres enregistrés.</div><?php endif; ?>

    <div style="margin:0 0 18px;display:flex;gap:10px;flex-wrap:wrap">
        <a class="jp-btn jp-btn-secondary" href="<?= e(url('/admin/smtp-test')) ?>" data-testid="admin-parametres-smtp-link"><i class="fas fa-envelope-circle-check"></i> Tester la configuration SMTP</a>
        <a class="jp-btn jp-btn-secondary" href="<?= e(url('/admin/sante')) ?>" data-testid="admin-parametres-sante-link"><i class="fas fa-heart-pulse"></i> Santé du système</a>
    </div>

    <form class="jp-admin-card jp-admin-form" method="post" data-testid="admin-parametres-form">
        <h2 class="h5">Coordonnées professionnelles</h2>
        <p class="text-muted">Mettez à jour les coordonnées publiques sans toucher aux identifiants de messagerie SMTP.</p>
        <?php foreach ($editableSettings as $key => [$label, $help, $kind]): ?>
        <?php if ($key === 'annonce_texte'): ?><h2 class="h5 mt-4">Contenus et annonces</h2><?php endif; ?>
        <label for="setting-<?= e($key) ?>"><?= e($label) ?></label>
        <?php if ($kind === 'textarea'): ?>
            <textarea id="setting-<?= e($key) ?>" name="<?= e($key) ?>" rows="3" maxlength="2000"><?= e((string)($values[$key] ?? '')) ?></textarea>
        <?php else: ?>
            <input id="setting-<?= e($key) ?>" type="<?= $kind === 'email' ? 'email' : ($kind === 'tel' ? 'tel' : 'text') ?>" name="<?= e($key) ?>" maxlength="<?= $kind === 'email' ? '254' : ($kind === 'tel' ? '35' : '500') ?>" value="<?= e((string)($values[$key] ?? '')) ?>">
        <?php endif; ?>
        <small><?= e($help) ?></small>
        <?php endforeach; ?>
        <button class="jp-btn jp-btn-primary" type="submit" data-testid="admin-parametres-submit"><i class="fas fa-floppy-disk"></i> Enregistrer les paramètres</button>
    </form>
</div>

<?php include '../includes/footer_admin.php'; ?>
