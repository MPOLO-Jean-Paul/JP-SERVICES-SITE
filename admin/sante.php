<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
require_once dirname(__DIR__) . '/app/seo_ping.php';
require_once dirname(__DIR__) . '/includes/PHPMailer/Exception.php';
require_once dirname(__DIR__) . '/includes/PHPMailer/PHPMailer.php';
require_once dirname(__DIR__) . '/includes/PHPMailer/SMTP.php';
require_once dirname(__DIR__) . '/app/mailer.php';

// ---------------------------------------------------------------------------
// Collecte des vérifications (chaque check : id, label, icon, level, summary, details[])
// level : ok | warn | crit | info
// ---------------------------------------------------------------------------
$checks = [];
$addCheck = static function (string $id, string $label, string $icon, string $level, string $summary, array $details = []) use (&$checks): void {
    $checks[] = compact('id', 'label', 'icon', 'level', 'summary', 'details');
};

// 1. Base de données
$dbLevel = 'crit';
$dbSummary = 'Connexion impossible.';
$dbDetails = [];
$dbHost = trim((string)env('DB_HOST', ''));
$dbName = trim((string)env('DB_NAME', ''));
if ($dbHost === '' || $dbName === '') {
    $dbSummary = 'Variables DB_HOST / DB_NAME manquantes dans le .env.';
} else {
    try {
        $start = microtime(true);
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $dbHost, (int)env('DB_PORT', 3306), $dbName);
        $healthPdo = new PDO($dsn, trim((string)env('DB_USER', '')), (string)env('DB_PASSWORD', ''), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ]);
        $healthPdo->query('SELECT 1');
        $latency = (int)round((microtime(true) - $start) * 1000);
        $dbLevel = $latency > 1500 ? 'warn' : 'ok';
        $dbSummary = 'Connexion établie en ' . $latency . ' ms.';
        $dbDetails['Hôte'] = $dbHost . ' (' . $dbName . ')';
        $dbDetails['Latence'] = $latency . ' ms' . ($latency > 1500 ? ' — élevée' : '');
        foreach (['users' => 'Utilisateurs', 'formations' => 'Formations', 'newsletter_subscribers' => 'Abonnés newsletter', 'messages' => 'Messages reçus'] as $table => $tableLabel) {
            try {
                $dbDetails[$tableLabel] = (string)(int)$healthPdo->query('SELECT COUNT(*) FROM `' . $table . '`')->fetchColumn();
            } catch (Throwable $tableException) {
                $dbDetails[$tableLabel] = 'table indisponible';
            }
        }
    } catch (Throwable $exception) {
        $dbSummary = 'Échec de connexion : ' . $exception->getMessage();
    }
}
$addCheck('db', 'Base de données MySQL', 'fa-database', $dbLevel, $dbSummary, $dbDetails);

// 2. SMTP (test de connexion réseau, sans envoi d'e-mail)
$smtpHost = trim((string)env('SMTP_HOST', ''));
$smtpPort = (int)env('SMTP_PORT', 587);
$smtpEncryption = strtolower((string)env('SMTP_ENCRYPTION', 'tls'));
$smtpConfigurationError = jp_smtp_configuration_error();
$smtpConfigured = $smtpConfigurationError === null;
if (!$smtpConfigured) {
    $addCheck('smtp', 'Serveur d’e-mails (SMTP)', 'fa-envelope', 'warn', 'Configuration SMTP invalide ou incomplète.', ['Détail' => (string)$smtpConfigurationError]);
} else {
    $target = ($smtpEncryption === 'ssl' ? 'ssl://' : '') . $smtpHost;
    $errno = 0;
    $errstr = '';
    $start = microtime(true);
    $socket = @fsockopen($target, $smtpPort, $errno, $errstr, 6);
    if ($socket === false) {
        $addCheck('smtp', 'Serveur d’e-mails (SMTP)', 'fa-envelope', 'crit', 'Connexion à ' . $smtpHost . ':' . $smtpPort . ' impossible : ' . ($errstr ?: 'erreur réseau') . '.', ['Hôte' => $smtpHost . ':' . $smtpPort, 'Chiffrement' => $smtpEncryption]);
    } else {
        stream_set_timeout($socket, 5);
        $banner = trim((string)fgets($socket, 512));
        fclose($socket);
        $latency = (int)round((microtime(true) - $start) * 1000);
        $bannerOk = str_starts_with($banner, '220');
        $addCheck('smtp', 'Serveur d’e-mails (SMTP)', 'fa-envelope', $bannerOk ? 'ok' : 'warn',
            $bannerOk ? 'Serveur joignable en ' . $latency . ' ms (bannière 220 reçue).' : 'Serveur joignable mais réponse inattendue.',
            ['Hôte' => $smtpHost . ':' . $smtpPort, 'Chiffrement' => $smtpEncryption, 'Bannière' => $banner !== '' ? mb_strimwidth($banner, 0, 90, '…') : '—', 'Astuce' => 'Utilisez « Test SMTP » pour un envoi réel.']);
    }
}

// 3. Espace disque
$freeBytes = @disk_free_space(JP_ROOT);
$totalBytes = @disk_total_space(JP_ROOT);
if ($freeBytes === false || $totalBytes === false || $totalBytes <= 0) {
    $addCheck('disk', 'Espace disque', 'fa-hard-drive', 'warn', 'Impossible de mesurer l’espace disque sur cet hébergement.', []);
} else {
    $pctFree = ($freeBytes / $totalBytes) * 100;
    $format = static fn (float $bytes): string => $bytes >= 1073741824 ? round($bytes / 1073741824, 1) . ' Go' : round($bytes / 1048576) . ' Mo';
    $diskLevel = $pctFree < 5 ? 'crit' : ($pctFree < 15 ? 'warn' : 'ok');
    $addCheck('disk', 'Espace disque', 'fa-hard-drive', $diskLevel,
        $format((float)$freeBytes) . ' libres sur ' . $format((float)$totalBytes) . ' (' . round($pctFree) . ' %).',
        ['Seuil d’alerte' => 'Avertissement < 15 %, critique < 5 %']);
}

// 4. Dossiers d'écriture
$writableDirs = ['storage/cache' => 'Cache & limites de tentatives', 'storage/logs' => 'Journaux d’erreurs', 'images/formations' => 'Visuels des formations'];
$writableDetails = [];
$writableLevel = 'ok';
foreach ($writableDirs as $dir => $dirLabel) {
    $full = JP_ROOT . '/' . $dir;
    if (!is_dir($full)) {
        @mkdir($full, 0750, true);
    }
    $isWritable = is_dir($full) && is_writable($full);
    $writableDetails[$dirLabel] = $isWritable ? 'accessible en écriture' : 'NON INSCRIPTIBLE';
    if (!$isWritable) {
        $writableLevel = 'crit';
    }
}
$addCheck('storage', 'Dossiers de stockage', 'fa-folder-open', $writableLevel,
    $writableLevel === 'ok' ? 'Tous les dossiers critiques sont inscriptibles.' : 'Un ou plusieurs dossiers ne sont pas inscriptibles : sessions, limites et téléversements peuvent échouer.',
    $writableDetails);

// 5. Environnement PHP
$phpDetails = ['Version PHP' => PHP_VERSION];
$phpLevel = 'ok';
$phpIssues = [];
foreach (['pdo_mysql' => 'crit', 'openssl' => 'crit', 'fileinfo' => 'warn', 'mbstring' => 'warn', 'json' => 'crit'] as $extension => $severity) {
    $loaded = extension_loaded($extension);
    $phpDetails['Extension ' . $extension] = $loaded ? 'chargée' : 'MANQUANTE';
    if (!$loaded) {
        $phpIssues[] = $extension;
        if ($severity === 'crit' || $phpLevel !== 'crit') {
            $phpLevel = $severity === 'crit' ? 'crit' : ($phpLevel === 'crit' ? 'crit' : 'warn');
        }
    }
}
$urlFopen = filter_var(ini_get('allow_url_fopen'), FILTER_VALIDATE_BOOLEAN);
$phpDetails['allow_url_fopen'] = $urlFopen ? 'activé' : 'DÉSACTIVÉ (requis pour Google Sign-In et IndexNow)';
if (!$urlFopen && $phpLevel === 'ok') {
    $phpLevel = 'warn';
}
$addCheck('php', 'Environnement PHP', 'fa-code', $phpLevel,
    $phpLevel === 'ok' ? 'PHP ' . PHP_VERSION . ' — toutes les extensions requises sont présentes.' : 'Éléments à vérifier : ' . implode(', ', array_merge($phpIssues, $urlFopen ? [] : ['allow_url_fopen'])) . '.',
    $phpDetails);

// 6. Configuration .env
$envVars = [
    'APP_URL' => ['crit', 'URL publique HTTPS du site'],
    'APP_KEY' => ['warn', 'Clé de signature (liens newsletter, limites)'],
    'SMTP_HOST' => ['warn', 'Envoi d’e-mails'],
    'SMTP_USERNAME' => ['warn', 'Envoi d’e-mails'],
    'SMTP_PASSWORD' => ['warn', 'Envoi d’e-mails'],
    'GOOGLE_CLIENT_ID' => ['info', 'Connexion Google (One Tap)'],
    'INDEXNOW_KEY' => ['info', 'Notification des moteurs de recherche'],
    'RECAPTCHA_SITE_KEY' => ['info', 'Protection anti-robots'],
];
$envDetails = [];
$envLevel = 'ok';
foreach ($envVars as $variable => [$severity, $role]) {
    $defined = trim((string)env($variable, '')) !== '';
    $envDetails[$variable . ' (' . $role . ')'] = $defined ? 'défini' : ($severity === 'info' ? 'non défini (optionnel)' : 'MANQUANT');
    if (!$defined && $severity !== 'info') {
        $envLevel = $severity === 'crit' ? 'crit' : ($envLevel === 'crit' ? 'crit' : 'warn');
    }
}
$addCheck('env', 'Configuration (.env)', 'fa-gears', $envLevel,
    $envLevel === 'ok' ? 'Toutes les variables essentielles sont définies.' : 'Certaines variables essentielles sont absentes du .env.',
    $envDetails);

// 7. Référencement — dernier ping IndexNow
$lastPing = jp_indexnow_last_status();
if ($lastPing === null) {
    $addCheck('seo', 'Référencement (IndexNow)', 'fa-magnifying-glass-chart', 'info', 'Aucun ping envoyé pour le moment. Le prochain se déclenchera automatiquement à la publication d’une formation.', ['Google' => 'Découverte via le sitemap dynamique (lastmod) déclaré dans robots.txt']);
} else {
    $pingDate = date('d/m/Y H:i', strtotime((string)$lastPing['date']) ?: time());
    $addCheck('seo', 'Référencement (IndexNow)', 'fa-magnifying-glass-chart', !empty($lastPing['ok']) ? 'ok' : 'warn',
        (!empty($lastPing['ok']) ? 'Dernier ping réussi le ' . $pingDate . ' (' . (int)($lastPing['urls'] ?? 0) . ' URL).' : 'Dernier ping en échec le ' . $pingDate . '.'),
        ['Détail' => (string)($lastPing['message'] ?? ''), 'Google' => 'Découverte via le sitemap dynamique (lastmod)']);
}

// 8. Journal d'erreurs PHP
$logFile = JP_ROOT . '/storage/logs/php-error.log';
if (!is_file($logFile)) {
    $addCheck('logs', 'Journal d’erreurs', 'fa-file-lines', 'ok', 'Aucun fichier d’erreurs : rien à signaler.', []);
} else {
    $size = (int)filesize($logFile);
    $recent = (time() - (int)filemtime($logFile)) < 86400;
    $lines = @file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    $tail = array_slice($lines, -3);
    $logDetails = ['Taille' => round($size / 1024) . ' Ko', 'Dernière écriture' => date('d/m/Y H:i', (int)filemtime($logFile))];
    foreach ($tail as $index => $line) {
        $logDetails['Entrée ' . ($index + 1)] = mb_strimwidth(trim($line), 0, 140, '…');
    }
    $logLevel = $size > 5242880 ? 'warn' : ($recent && $size > 0 ? 'warn' : 'ok');
    $addCheck('logs', 'Journal d’erreurs', 'fa-file-lines', $logLevel,
        $logLevel === 'ok' ? 'Journal calme (' . round($size / 1024) . ' Ko).' : ($size > 5242880 ? 'Journal volumineux (' . round($size / 1048576, 1) . ' Mo) : pensez à le purger.' : 'Des erreurs ont été enregistrées ces dernières 24 h.'),
        $logDetails);
}

// ---------------------------------------------------------------------------
// Statut global + envoi du rapport par e-mail
// ---------------------------------------------------------------------------
$levels = array_column($checks, 'level');
$overall = in_array('crit', $levels, true) ? 'crit' : (in_array('warn', $levels, true) ? 'warn' : 'ok');
$overallText = ['ok' => 'Tous les services fonctionnent normalement.', 'warn' => 'Certains services demandent votre attention.', 'crit' => 'Un ou plusieurs services critiques sont en panne.'][$overall];

$reportFeedback = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'email_report') {
    if (!$smtpConfigured) {
        $reportFeedback = ['type' => 'danger', 'message' => 'SMTP non configuré : impossible d’envoyer le rapport.'];
    } elseif (!jp_rate_limit('health-report:' . (int)$_SESSION['user_id'], 4, 900)) {
        $reportFeedback = ['type' => 'danger', 'message' => 'Trop d’envois. Attendez quelques minutes.'];
    } else {
        try {
            $recipient = trim((string)env('SMTP_FROM_ADDRESS', env('SMTP_USERNAME', '')));
            $rows = '';
            foreach ($checks as $check) {
                $badge = ['ok' => '✅', 'warn' => '⚠️', 'crit' => '🔴', 'info' => 'ℹ️'][$check['level']];
                $rows .= '<tr><td style="padding:8px 10px;border-bottom:1px solid #E5E9F0">' . $badge . ' <strong>' . e($check['label']) . '</strong></td><td style="padding:8px 10px;border-bottom:1px solid #E5E9F0">' . e($check['summary']) . '</td></tr>';
            }
            $mail = jp_configure_mailer(new PHPMailer\PHPMailer\PHPMailer(true));
            $mail->Timeout = 12;
            $mail->addAddress($recipient);
            $mail->isHTML(true);
            $mail->Subject = ($overall === 'ok' ? '[OK]' : ($overall === 'warn' ? '[ATTENTION]' : '[CRITIQUE]')) . ' Rapport santé JP-SERVICES — ' . date('d/m/Y H:i');
            $mail->Body = '<div style="font-family:Arial,sans-serif;color:#0B1526"><h2 style="color:#1F72F1;margin:0 0 6px">Rapport de santé du système</h2><p style="margin:0 0 16px">' . e($overallText) . '</p><table style="border-collapse:collapse;width:100%;font-size:14px">' . $rows . '</table><p style="color:#6B7385;font-size:12px;margin-top:16px">Généré le ' . e(date('d/m/Y H:i')) . ' depuis ' . e((string)($_SERVER['HTTP_HOST'] ?? 'JP-SERVICES')) . '.</p></div>';
            $mail->AltBody = 'Rapport santé JP-SERVICES : ' . $overallText;
            $mail->send();
            $reportFeedback = ['type' => 'success', 'message' => 'Rapport envoyé à ' . $recipient . '.'];
        } catch (Throwable $exception) {
            error_log('Rapport santé: ' . $exception->getMessage());
            $reportFeedback = ['type' => 'danger', 'message' => 'Échec de l’envoi : ' . $exception->getMessage()];
        }
    }
}

$badgeMeta = [
    'ok' => ['fa-circle-check', 'Opérationnel'],
    'warn' => ['fa-triangle-exclamation', 'À surveiller'],
    'crit' => ['fa-circle-xmark', 'En panne'],
    'info' => ['fa-circle-info', 'Information'],
];

$page_title = 'Santé du système';
include dirname(__DIR__) . '/includes/header_admin.php';
?>
<style>
    .jp-health-banner { display: flex; align-items: center; gap: 16px; padding: 18px 22px; border-radius: 14px; margin: 4px 0 22px; border: 1px solid; }
    .jp-health-banner i { font-size: 1.6rem; }
    .jp-health-banner strong { display: block; font-size: 1.02rem; margin-bottom: 2px; }
    .jp-health-banner span { font-size: .84rem; }
    .jp-health-banner.is-ok { background: #E7F6EE; border-color: #BFE8D0; color: #175E3B; }
    .jp-health-banner.is-warn { background: #FEF3E2; border-color: #F5D9A8; color: #8A5A12; }
    .jp-health-banner.is-crit { background: #FEECEC; border-color: #F3C5C5; color: #9F1D1D; }
    .jp-health-toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 20px; }
    .jp-health-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; }
    .jp-health-card { background: var(--jp-panel, #fff); border: 1px solid var(--jp-line, #E5E9F0); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .jp-health-card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .jp-health-card-head h2 { margin: 0; font-size: .95rem; display: flex; align-items: center; gap: 9px; }
    .jp-health-card-head h2 i { color: #1F72F1; }
    .jp-health-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 999px; font-size: .72rem; font-weight: 800; white-space: nowrap; }
    .jp-health-badge.is-ok { background: #E7F6EE; color: #175E3B; }
    .jp-health-badge.is-warn { background: #FEF3E2; color: #8A5A12; }
    .jp-health-badge.is-crit { background: #FEECEC; color: #9F1D1D; }
    .jp-health-badge.is-info { background: #EAF2FE; color: #0E58C7; }
    .jp-health-summary { margin: 0; font-size: .85rem; color: var(--jp-copy, #3B4557); }
    .jp-health-details { width: 100%; border-collapse: collapse; font-size: .8rem; }
    .jp-health-details th, .jp-health-details td { padding: 6px 8px; border-bottom: 1px solid var(--jp-line, #E5E9F0); text-align: left; vertical-align: top; }
    .jp-health-details th { color: var(--jp-muted, #6B7385); font-weight: 700; width: 46%; }
    .jp-health-details td { color: var(--jp-ink, #0B1526); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .76rem; word-break: break-word; }
    .jp-health-alert { padding: 12px 14px; border-radius: 10px; border-left: 4px solid; margin-bottom: 16px; font-size: .86rem; }
    .jp-health-alert.success { background: #E7F6EE; border-color: #1E7A3C; color: #175E3B; }
    .jp-health-alert.danger { background: #FEECEC; border-color: #C53030; color: #9F1D1D; }
</style>

<div class="jp-admin-page">
    <div class="jp-admin-page-head">
        <div>
            <h1 data-testid="admin-health-title"><i class="fas fa-heart-pulse" style="color:#1F72F1;margin-right:8px"></i>Santé du système</h1>
            <p class="text-muted">Surveillance en temps réel : base de données, e-mails, disque, PHP, configuration et référencement.</p>
        </div>
        <div><a class="jp-btn jp-btn-secondary" href="<?= e(url('/admin/parametres')) ?>"><i class="fas fa-arrow-left"></i> Paramètres</a></div>
    </div>

    <div class="jp-health-banner is-<?= e($overall) ?>" role="status" data-testid="admin-health-banner">
        <i class="fas <?= e($badgeMeta[$overall][0]) ?>"></i>
        <div>
            <strong><?= e($badgeMeta[$overall][1]) ?></strong>
            <span><?= e($overallText) ?> Vérification effectuée le <?= e(date('d/m/Y à H:i')) ?>.</span>
        </div>
    </div>

    <?php if ($reportFeedback): ?>
    <div class="jp-health-alert <?= e($reportFeedback['type']) ?>" role="status" data-testid="admin-health-report-feedback"><?= e($reportFeedback['message']) ?></div>
    <?php endif; ?>

    <div class="jp-health-toolbar">
        <a class="jp-btn jp-btn-primary" href="<?= e(url('/admin/sante')) ?>" data-testid="admin-health-refresh-btn"><i class="fas fa-arrows-rotate"></i> Relancer la vérification</a>
        <form method="post" action="<?= e(url('/admin/sante')) ?>" style="display:inline">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="email_report">
            <button class="jp-btn jp-btn-secondary" type="submit" data-testid="admin-health-email-btn"<?= $smtpConfigured ? '' : ' disabled title="Configurez le SMTP pour recevoir les rapports"' ?>><i class="fas fa-paper-plane"></i> Recevoir ce rapport par e-mail</button>
        </form>
        <a class="jp-btn jp-btn-secondary" href="<?= e(url('/admin/smtp-test')) ?>" data-testid="admin-health-smtp-link"><i class="fas fa-envelope-circle-check"></i> Test SMTP complet</a>
    </div>

    <div class="jp-health-grid" data-testid="admin-health-grid">
        <?php foreach ($checks as $check): ?>
        <section class="jp-health-card" data-testid="admin-health-card-<?= e($check['id']) ?>">
            <div class="jp-health-card-head">
                <h2><i class="fas <?= e($check['icon']) ?>"></i><?= e($check['label']) ?></h2>
                <span class="jp-health-badge is-<?= e($check['level']) ?>" data-testid="admin-health-badge-<?= e($check['id']) ?>"><i class="fas <?= e($badgeMeta[$check['level']][0]) ?>"></i><?= e($badgeMeta[$check['level']][1]) ?></span>
            </div>
            <p class="jp-health-summary"><?= e($check['summary']) ?></p>
            <?php if ($check['details'] !== []): ?>
            <table class="jp-health-details">
                <tbody>
                    <?php foreach ($check['details'] as $detailLabel => $detailValue): ?>
                    <tr><th><?= e((string)$detailLabel) ?></th><td><?= e((string)$detailValue) ?></td></tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php endif; ?>
        </section>
        <?php endforeach; ?>
    </div>
</div>

<?php include dirname(__DIR__) . '/includes/footer_admin.php'; ?>
