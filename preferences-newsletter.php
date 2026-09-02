<?php
require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/newsletter_helpers.php';
require_once __DIR__ . '/includes/connexion_db.php';

$themes = jp_newsletter_themes();
$allowedThemes = array_keys($themes);

$email = strtolower(trim((string)($_REQUEST['email'] ?? '')));
$token = trim((string)($_REQUEST['t'] ?? ''));
$linkValid = $email !== '' && mb_strlen($email, 'UTF-8') <= 254
    && filter_var($email, FILTER_VALIDATE_EMAIL)
    && $token !== '' && hash_equals(jp_newsletter_token($email), $token);

$feedback = null;
$subscriber = null;

if ($linkValid && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    if (!jp_rate_limit('newsletter-prefs:' . $ip, 12, 900)) {
        $feedback = ['type' => 'danger', 'message' => 'Trop de tentatives. Réessayez dans quelques minutes.'];
    } else {
        $action = (string)($_POST['action'] ?? 'update');
        try {
            if ($action === 'unsubscribe') {
                $stmt = $conn->prepare("UPDATE newsletter_subscribers SET statut = 'desinscrit', date_desinscription = NOW() WHERE email = :email");
                $stmt->execute([':email' => $email]);
                $feedback = ['type' => 'success', 'message' => 'Vous êtes désinscrit de la newsletter. Vous pouvez vous réabonner à tout moment ci-dessous.'];
            } else {
                $selected = is_array($_POST['themes'] ?? null)
                    ? array_values(array_intersect($allowedThemes, array_map('strval', $_POST['themes'])))
                    : [];
                if ($selected === []) {
                    $feedback = ['type' => 'warning', 'message' => 'Sélectionnez au moins un thème, ou utilisez le bouton de désinscription.'];
                } else {
                    try {
                        $stmt = $conn->prepare(
                            'INSERT INTO newsletter_subscribers (email, statut, themes, date_inscription)
                             VALUES (:email, \'actif\', :themes, NOW())
                             ON DUPLICATE KEY UPDATE statut = \'actif\', themes = VALUES(themes), date_desinscription = NULL'
                        );
                        $stmt->execute([':email' => $email, ':themes' => implode(',', $selected)]);
                    } catch (Throwable $columnException) {
                        // Colonne themes absente (migration non appliquée) : mise à jour du statut seul
                        if (stripos($columnException->getMessage(), 'themes') === false) {
                            throw $columnException;
                        }
                        $stmt = $conn->prepare(
                            'INSERT INTO newsletter_subscribers (email, statut, date_inscription)
                             VALUES (:email, \'actif\', NOW())
                             ON DUPLICATE KEY UPDATE statut = \'actif\', date_desinscription = NULL'
                        );
                        $stmt->execute([':email' => $email]);
                    }
                    $feedback = ['type' => 'success', 'message' => 'Vos préférences ont été enregistrées (' . count($selected) . ' thème' . (count($selected) > 1 ? 's' : '') . ').'];
                }
            }
        } catch (Throwable $exception) {
            error_log('Préférences newsletter: ' . $exception->getMessage());
            $feedback = ['type' => 'danger', 'message' => 'Une erreur est survenue. Réessayez dans un instant.'];
        }
    }
}

if ($linkValid) {
    try {
        $stmt = $conn->prepare('SELECT * FROM newsletter_subscribers WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $subscriber = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    } catch (Throwable $exception) {
        error_log('Préférences newsletter (lecture): ' . $exception->getMessage());
    }
}

$isActive = is_array($subscriber) && (string)($subscriber['statut'] ?? '') === 'actif';
$currentThemes = $allowedThemes;
if (is_array($subscriber) && trim((string)($subscriber['themes'] ?? '')) !== '') {
    $currentThemes = array_values(array_intersect($allowedThemes, array_map('trim', explode(',', (string)$subscriber['themes']))));
    if ($currentThemes === []) {
        $currentThemes = $allowedThemes;
    }
}
?>
<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#1F72F1"><meta name="color-scheme" content="light dark"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="strict-origin-when-cross-origin"><title>Préférences newsletter | JP-Services</title><link rel="icon" href="<?= e(url('/images/logo2.png')) ?>"><script>(function(){try{var t=localStorage.getItem('jp-theme')||'system';var d=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.dataset.theme=d;document.documentElement.dataset.themeChoice=t}catch(e){}})();</script><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet"><link rel="stylesheet" href="<?= e(url('/css/app.css?v=20260901')) ?>"><link rel="stylesheet" href="<?= e(url('/css/pro-polish.css?v=20260901')) ?>"></head><body class="jp-app">
<main class="auth-wrapper" id="main-content">
    <section class="auth-card jp-prefs-card" data-testid="newsletter-prefs-card">
        <div class="brand-header">
            <a href="<?= e(url('/')) ?>"><img src="<?= e(url('/images/logo2.png')) ?>" alt="JP-Services"></a>
            <h1>Préférences newsletter</h1>
            <?php if ($linkValid): ?>
            <p>Choisissez les thèmes qui vous intéressent pour <strong data-testid="newsletter-prefs-email"><?= e($email) ?></strong>.</p>
            <?php else: ?>
            <p>Gérez les thèmes de la newsletter JP-Services.</p>
            <?php endif; ?>
        </div>

        <?php if ($feedback): ?>
        <div class="alert alert-<?= e($feedback['type']) ?>" role="status" data-testid="newsletter-prefs-feedback"><?= e($feedback['message']) ?></div>
        <?php endif; ?>

        <?php if (!$linkValid): ?>
        <div class="alert alert-danger" role="alert" data-testid="newsletter-prefs-invalid">
            <i class="fas fa-triangle-exclamation"></i> Ce lien de gestion est invalide ou expiré. Utilisez le lien présent dans nos e-mails, ou réabonnez-vous depuis le pied de page du site.
        </div>
        <div class="jp-prefs-actions"><a class="btn btn-primary" href="<?= e(url('/#newsletter')) ?>">Retour à l’accueil <i class="fas fa-arrow-right"></i></a></div>
        <?php else: ?>

        <div class="jp-prefs-status <?= $isActive ? 'is-active' : 'is-inactive' ?>" data-testid="newsletter-prefs-status">
            <i class="fas <?= $isActive ? 'fa-circle-check' : 'fa-circle-pause' ?>"></i>
            <?= $isActive ? 'Abonnement actif' : (is_array($subscriber) ? 'Vous êtes actuellement désinscrit' : 'Cette adresse n’est pas encore abonnée') ?>
        </div>

        <form method="post" action="<?= e(url('/newsletter/preferences')) ?>" data-testid="newsletter-prefs-form">
            <?= csrf_field() ?>
            <input type="hidden" name="email" value="<?= e($email) ?>">
            <input type="hidden" name="t" value="<?= e($token) ?>">

            <p class="jp-prefs-label">Thèmes suivis</p>
            <div class="jp-prefs-themes" role="group" aria-label="Thèmes de la newsletter">
                <?php foreach ($themes as $themeKey => $themeLabel): ?>
                <label class="jp-prefs-chip">
                    <input type="checkbox" name="themes[]" value="<?= e($themeKey) ?>" <?= in_array($themeKey, $currentThemes, true) ? 'checked' : '' ?> data-testid="newsletter-prefs-theme-<?= e($themeKey) ?>">
                    <span><?= e($themeLabel) ?></span>
                </label>
                <?php endforeach; ?>
            </div>

            <div class="jp-prefs-actions">
                <button class="btn btn-primary" type="submit" name="action" value="update" data-testid="newsletter-prefs-save-btn">
                    <i class="fas fa-floppy-disk"></i> <?= $isActive ? 'Enregistrer mes préférences' : 'Activer mon abonnement' ?>
                </button>
                <?php if ($isActive): ?>
                <button class="jp-prefs-unsubscribe" type="submit" name="action" value="unsubscribe" data-testid="newsletter-prefs-unsubscribe-btn">
                    <i class="fas fa-circle-minus"></i> Me désinscrire totalement
                </button>
                <?php endif; ?>
            </div>
        </form>

        <div class="auth-security-note"><i class="fas fa-shield-halved"></i><span>Lien personnel signé et sécurisé : ne le partagez pas. Aucune donnée n’est communiquée à des tiers.</span></div>
        <?php endif; ?>

        <p class="text-center small text-muted mt-4 mb-0"><a class="auth-footer-link" href="<?= e(url('/')) ?>"><i class="fas fa-arrow-left"></i> Retour au site JP-Services</a></p>
    </section>
</main>
<script src="<?= e(url('/js/site-ui.js?v=20260807')) ?>" defer></script>
</body></html>
