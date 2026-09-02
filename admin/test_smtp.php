<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
require_once dirname(__DIR__) . '/includes/PHPMailer/Exception.php';
require_once dirname(__DIR__) . '/includes/PHPMailer/PHPMailer.php';
require_once dirname(__DIR__) . '/includes/PHPMailer/SMTP.php';
require_once dirname(__DIR__) . '/app/mailer.php';

use PHPMailer\PHPMailer\PHPMailer;

$feedback = null;
$defaultRecipient = trim((string)env('SMTP_FROM_ADDRESS', env('SMTP_USERNAME', '')));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $recipient = strtolower(trim((string)($_POST['recipient'] ?? '')));
    if ($recipient === '' || !filter_var($recipient, FILTER_VALIDATE_EMAIL) || mb_strlen($recipient, 'UTF-8') > 254) {
        $feedback = ['type' => 'danger', 'title' => 'Adresse invalide', 'message' => 'Renseignez une adresse e-mail correcte pour recevoir le message de test.'];
    } elseif (!jp_rate_limit('smtp-test:' . (int)$_SESSION['user_id'], 6, 900)) {
        $feedback = ['type' => 'danger', 'title' => 'Trop de tests', 'message' => 'Attendez quelques minutes avant de relancer un test SMTP.'];
    } else {
        try {
            $mail = jp_configure_mailer(new PHPMailer(true));
            $mail->SMTPDebug = 0;
            $mail->Timeout = 12;
            $mail->addAddress($recipient);
            $mail->isHTML(true);
            $mail->Subject = 'Test SMTP JP-SERVICES';
            $mail->Body = '<div style="font-family:Arial,sans-serif;color:#0B1526"><h2 style="color:#1F72F1;margin:0 0 12px">Configuration SMTP opérationnelle</h2><p>Ce message confirme que l’envoi d’e-mails depuis <strong>JP-SERVICES</strong> fonctionne correctement.</p><p style="color:#6B7385;font-size:.85rem">Envoyé le ' . e(date('d/m/Y H:i')) . ' depuis ' . e((string)($_SERVER['HTTP_HOST'] ?? 'JP-SERVICES')) . '.</p></div>';
            $mail->AltBody = 'Configuration SMTP opérationnelle. Envoyé le ' . date('d/m/Y H:i') . '.';
            $mail->send();
            $feedback = ['type' => 'success', 'title' => 'Message envoyé', 'message' => 'Le test SMTP a été envoyé à ' . $recipient . '. Vérifiez la boîte de réception (et les indésirables).'];
        } catch (Throwable $exception) {
            error_log('SMTP test: ' . $exception->getMessage());
            $feedback = ['type' => 'danger', 'title' => 'Échec de l’envoi SMTP', 'message' => 'Impossible d’envoyer l’e-mail de test. Vérifiez la configuration et le journal d’erreurs du serveur.'];
        }
    }
}

$diagnostics = [
    'Hôte SMTP (SMTP_HOST)' => env('SMTP_HOST', ''),
    'Port (SMTP_PORT)' => env('SMTP_PORT', ''),
    'Chiffrement (SMTP_ENCRYPTION)' => env('SMTP_ENCRYPTION', 'tls'),
    'Utilisateur (SMTP_USERNAME)' => env('SMTP_USERNAME', ''),
    'Mot de passe (SMTP_PASSWORD)' => env('SMTP_PASSWORD', '') !== '' ? 'défini (masqué)' : 'MANQUANT',
    'From (SMTP_FROM_ADDRESS)' => env('SMTP_FROM_ADDRESS', env('SMTP_USERNAME', '')),
    'From Name (SMTP_FROM_NAME)' => env('SMTP_FROM_NAME', 'JP-SERVICES'),
    'État de configuration' => jp_smtp_configuration_error() ?? 'valide',
];

$configuredOk = jp_smtp_is_configured();

$page_title = 'Test SMTP';
include dirname(__DIR__) . '/includes/header_admin.php';
?>
<style>
    .jp-smtp-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 22px; align-items: start; margin-top: 4px; }
    @media (max-width: 900px) { .jp-smtp-grid { grid-template-columns: 1fr; } }
    .jp-smtp-card { background: var(--jp-panel, #fff); border: 1px solid var(--jp-line, #E5E9F0); border-radius: 12px; padding: 22px; }
    .jp-smtp-card h2 { margin: 0 0 6px; font-size: 1.05rem; letter-spacing: -.005em; }
    .jp-smtp-card p { margin: 0 0 16px; color: var(--jp-copy, #3B4557); font-size: .88rem; }
    .jp-smtp-status { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; font-size: .78rem; font-weight: 800; margin-bottom: 14px; }
    .jp-smtp-status.is-ok { background: #E7F6EE; color: #175E3B; }
    .jp-smtp-status.is-ko { background: #FEECEC; color: #9F1D1D; }
    .jp-smtp-table { width: 100%; border-collapse: collapse; margin: 0; font-size: .85rem; }
    .jp-smtp-table th, .jp-smtp-table td { padding: 8px 10px; border-bottom: 1px solid var(--jp-line, #E5E9F0); text-align: left; vertical-align: top; }
    .jp-smtp-table th { color: var(--jp-copy, #3B4557); font-weight: 700; width: 44%; }
    .jp-smtp-table td { color: var(--jp-ink, #0B1526); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .82rem; word-break: break-all; }
    .jp-smtp-table td.is-missing { color: #9F1D1D; font-weight: 800; }
    .jp-smtp-form label { display: block; font-weight: 700; font-size: .82rem; margin: 0 0 6px; }
    .jp-smtp-form input { width: 100%; padding: 11px 14px; border: 1px solid var(--jp-line, #E5E9F0); border-radius: 10px; font-size: .92rem; }
    .jp-smtp-form input:focus { outline: 0; border-color: #1F72F1; box-shadow: 0 0 0 3px rgba(31,114,241,.18); }
    .jp-smtp-hint { color: var(--jp-muted, #6B7385); font-size: .78rem; margin-top: 8px; }
    .jp-smtp-alert { padding: 12px 14px; border-radius: 10px; border-left: 4px solid; margin-bottom: 14px; }
    .jp-smtp-alert.success { background: #E7F6EE; border-color: #1E7A3C; color: #175E3B; }
    .jp-smtp-alert.danger { background: #FEECEC; border-color: #C53030; color: #9F1D1D; }
    .jp-smtp-alert strong { display: block; font-size: .95rem; margin-bottom: 4px; }
</style>

<div class="jp-admin-page">
    <div class="jp-admin-page-head">
        <div>
            <h1 data-testid="admin-smtp-title"><i class="fas fa-envelope-circle-check" style="color:#1F72F1;margin-right:8px"></i>Test de la configuration SMTP</h1>
            <p class="text-muted">Vérifiez que l’envoi d’e-mails (activation de compte, réinitialisation, newsletter) fonctionne avant tout déploiement.</p>
        </div>
        <div><a class="jp-btn jp-btn-secondary" href="<?= e(url('/admin/parametres')) ?>"><i class="fas fa-arrow-left"></i> Paramètres</a></div>
    </div>

    <div class="jp-smtp-grid">
        <section class="jp-smtp-card" aria-labelledby="smtp-diag-title">
            <h2 id="smtp-diag-title">Diagnostic actuel</h2>
            <p>Valeurs actuellement chargées depuis le fichier <code>.env</code>.</p>
            <span class="jp-smtp-status <?= $configuredOk ? 'is-ok' : 'is-ko' ?>" data-testid="admin-smtp-status">
                <i class="fas <?= $configuredOk ? 'fa-check-circle' : 'fa-triangle-exclamation' ?>"></i>
                <?= $configuredOk ? 'Configuration détectée' : 'Configuration incomplète' ?>
            </span>
            <table class="jp-smtp-table">
                <tbody>
                    <?php foreach ($diagnostics as $label => $value): $missing = ($value === '' || $value === 'MANQUANT'); ?>
                    <tr>
                        <th><?= e($label) ?></th>
                        <td class="<?= $missing ? 'is-missing' : '' ?>"><?= $missing ? 'MANQUANT' : e((string)$value) ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <p class="jp-smtp-hint"><i class="fas fa-lightbulb"></i> Les variables sont définies dans le fichier <code>.env</code> du serveur d’hébergement.</p>
        </section>

        <section class="jp-smtp-card" aria-labelledby="smtp-test-title">
            <h2 id="smtp-test-title">Envoyer un e-mail de test</h2>
            <p>Un message court est envoyé à l’adresse choisie pour valider la configuration.</p>
            <?php if ($feedback): ?>
                <div class="jp-smtp-alert <?= e($feedback['type']) ?>" role="status" data-testid="admin-smtp-feedback">
                    <strong><?= e($feedback['title']) ?></strong>
                    <span><?= e($feedback['message']) ?></span>
                </div>
            <?php endif; ?>
            <form method="post" action="<?= e(url('/admin/smtp-test')) ?>" class="jp-smtp-form" data-testid="admin-smtp-form">
                <?= csrf_field() ?>
                <label for="recipient">Adresse destinataire</label>
                <input id="recipient" type="email" name="recipient" required maxlength="254" placeholder="admin@exemple.com" value="<?= e($_POST['recipient'] ?? $defaultRecipient) ?>" data-testid="admin-smtp-recipient">
                <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
                    <button type="submit" class="jp-btn jp-btn-primary" data-testid="admin-smtp-submit"<?= $configuredOk ? '' : ' disabled title="Configurez SMTP_HOST, SMTP_USERNAME et SMTP_PASSWORD dans le .env"' ?>><i class="fas fa-paper-plane"></i> Envoyer le test</button>
                    <a class="jp-btn jp-btn-secondary" href="<?= e(url('/admin/smtp-test')) ?>"><i class="fas fa-arrows-rotate"></i> Réinitialiser</a>
                </div>
                <p class="jp-smtp-hint"><i class="fas fa-shield-halved"></i> Test limité à 6 envois toutes les 15 minutes pour éviter tout abus.</p>
            </form>
        </section>
    </div>
</div>

<?php include dirname(__DIR__) . '/includes/footer_admin.php'; ?>
