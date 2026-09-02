<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';
require_once __DIR__ . '/app/auth_mailer.php';

header('Cache-Control: no-store, private');

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    if (mb_strlen($email, 'UTF-8') > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'Saisissez une adresse e-mail valide.';
    } elseif (!jp_rate_limit('password-reset-ip:' . (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 5, 3600)
        || !jp_rate_limit('password-reset-email:' . hash('sha256', $email), 3, 3600)) {
        $message = 'Trop de demandes ont été effectuées. Réessayez plus tard.';
    } else {
        // Le parcours reste volontairement générique afin de ne pas révéler
        // l’existence d’un compte associé à cette adresse.
        try {
            $lookup = $conn->prepare('SELECT id, prenom, reset_token, reset_expire FROM users WHERE email = :email AND is_active = 1 LIMIT 1');
            $lookup->execute(['email' => $email]);
            $user = $lookup->fetch(PDO::FETCH_ASSOC);

            if (is_array($user) && jp_smtp_is_configured()) {
                for ($attempt = 0; $attempt < 3; $attempt += 1) {
                    // Le secret reste stocké sous forme de hachage. Le code reçu est
                    // volontairement court pour éviter d'exposer une longue chaîne
                    // technique dans la barre d'adresse.
                    $rawToken = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                    $tokenHash = hash('sha256', $rawToken);
                    try {
                        $storeToken = $conn->prepare('UPDATE users SET reset_token = :token, reset_expire = DATE_ADD(NOW(), INTERVAL 1 MINUTE) WHERE id = :id');
                        $storeToken->execute(['token' => $tokenHash, 'id' => (int)$user['id']]);
                        jp_send_password_reset_email($email, (string)$user['prenom'], $rawToken);
                        break;
                    } catch (Throwable $mailException) {
                        // Si l'envoi échoue, le dernier lien effectivement envoyé est
                        // préservé au lieu d’être invalidé silencieusement.
                        try {
                            $restoreToken = $conn->prepare('UPDATE users SET reset_token = :old_token, reset_expire = :old_expire WHERE id = :id AND reset_token = :token');
                            $restoreToken->execute([
                                'old_token' => $user['reset_token'],
                                'old_expire' => $user['reset_expire'],
                                'id' => (int)$user['id'],
                                'token' => $tokenHash,
                            ]);
                        } catch (Throwable) {
                            error_log('Password reset: impossible de restaurer le jeton précédent.');
                        }
                        error_log('Password reset: envoi e-mail impossible.');
                        break;
                    }
                }
            } elseif (is_array($user)) {
                error_log('Password reset: SMTP indisponible.');
            }
        } catch (Throwable) {
            error_log('Password reset: traitement indisponible.');
        }

        // Toujours rediriger vers la saisie du code, même lorsqu'aucun compte
        // n'est associé à l'adresse. Cela préserve la confidentialité tout en
        // permettant à l'utilisateur de poursuivre immédiatement le parcours.
        $_SESSION['pending_reset_email'] = $email;
        $_SESSION['reset_flash'] = 'Si cette adresse correspond à un compte, un code vient d’être envoyé. Saisissez-le ci-dessous.';
        redirect('/mot-de-passe/reinitialiser');
    }
}
?>
<!doctype html>
<html lang="fr" data-auth-use-preferences>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#1F72F1">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="noindex,follow">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="description" content="Récupérez l’accès à votre compte JP-Services grâce à un code sécurisé et à durée limitée.">
<title>Récupérer votre compte | JP-Services</title>
<link rel="icon" href="<?= e(url('/images/logo2.png')) ?>" type="image/png">
<link rel="manifest" href="<?= e(url('/manifest.webmanifest')) ?>">
<link rel="canonical" href="<?= e(absolute_url('/mot-de-passe-oublie')) ?>">
<script>(function(){try{var t=localStorage.getItem('jp-theme')||'system';var q=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var d=t==='system'?(q?'dark':'light'):t;document.documentElement.dataset.theme=d;document.documentElement.dataset.themeChoice=t;document.querySelector('meta[name="color-scheme"]').content=d}catch(e){document.documentElement.dataset.theme='light';document.documentElement.dataset.themeChoice='system'}})();</script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">
<link rel="stylesheet" href="<?= e(url('/css/app.css?v=20260904')) ?>">
<link rel="stylesheet" href="<?= e(url('/css/interface-v2.css?v=20260940')) ?>">
<link rel="stylesheet" href="<?= e(url('/css/pro-polish.css?v=20260920')) ?>">
</head>
<body class="jp-app">
<div class="auth-theme jp-theme-control" data-theme-control>
    <button class="jp-theme-button" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Changer le thème" title="Apparence"><i class="fas fa-circle-half-stroke"></i></button>
    <div class="jp-theme-menu" role="menu" aria-hidden="true">
        <span class="jp-popup-heading">Apparence</span>
        <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="light"><i class="fas fa-sun"></i><span>Clair<small>Fond lumineux</small></span></button>
        <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="dark"><i class="fas fa-moon"></i><span>Sombre<small>Confort visuel</small></span></button>
        <button type="button" role="menuitemradio" aria-checked="false" data-theme-value="system"><i class="fas fa-desktop"></i><span>Système<small>Selon l’appareil</small></span></button>
    </div>
</div>
<main class="auth-wrapper jp-login-layout jp-recovery-layout" id="main-content">
    <section class="jp-login-showcase jp-recovery-showcase" aria-labelledby="recovery-showcase-title">
        <a class="jp-login-showcase-brand" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span>JP-Services</span></a>
        <div class="jp-login-showcase-copy">
            <span class="jp-login-kicker">ACCÈS SÉCURISÉ</span>
            <h1 id="recovery-showcase-title">Retrouvez votre espace en toute confiance.</h1>
            <ul>
                <li><i class="fas fa-envelope" aria-hidden="true"></i><span>Un code confidentiel est envoyé à l’adresse associée à votre compte.</span></li>
                <li><i class="fas fa-clock" aria-hidden="true"></i><span>Il reste utilisable pendant une minute, puis expire automatiquement.</span></li>
                <li><i class="fas fa-user-shield" aria-hidden="true"></i><span>Nous ne confirmons jamais l’existence d’un compte par e-mail.</span></li>
            </ul>
        </div>
        <div class="jp-recovery-stage" aria-hidden="true">
            <div class="jp-recovery-stage-icon"><i class="fas fa-key"></i></div>
            <div><strong>Un code, un nouvel accès.</strong><span>Simple, confidentiel et temporaire.</span></div>
            <i class="fas fa-shield-halved jp-recovery-stage-shield"></i>
        </div>
    </section>
    <section class="auth-card jp-login-card jp-recovery-card" aria-labelledby="recovery-title">
        <div class="brand-header">
            <a class="jp-login-product" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span><small>Plateforme</small>JP-Services</span></a>
            <h1 id="recovery-title">Récupérer votre compte</h1>
            <p>Indiquez votre adresse e-mail : nous vous enverrons un code de réinitialisation sécurisé.</p>
        </div>
        <?php if ($message !== ''): ?>
            <div class="alert alert-danger" role="alert" data-testid="forgot-error"><i class="fas fa-triangle-exclamation"></i> <?= e($message) ?></div>
        <?php endif; ?>
        <form class="jp-recovery-form" action="<?= e(url('/mot-de-passe-oublie')) ?>" method="post" data-testid="forgot-form">
            <?= csrf_field() ?>
            <div class="jp-field">
                <label class="form-label" for="email">Adresse e-mail</label>
                <div class="jp-recovery-input"><i class="fas fa-envelope" aria-hidden="true"></i><input class="form-control" id="email" type="email" name="email" autocomplete="email" maxlength="254" required value="<?= e($_POST['email'] ?? '') ?>" data-testid="forgot-email" placeholder="votre.email@domaine.com"></div>
            </div>
            <button class="btn btn-primary jp-login-submit" type="submit" data-testid="forgot-submit">Envoyer le code sécurisé <i class="fas fa-paper-plane" aria-hidden="true"></i></button>
            <a class="jp-recovery-back auth-footer-link" href="<?= e(url('/connexion')) ?>"><i class="fas fa-arrow-left" aria-hidden="true"></i> Retour à la connexion</a>
        </form>
        <div class="auth-security-note"><i class="fas fa-user-shield" aria-hidden="true"></i><span>Par confidentialité, nous ne confirmons jamais si cette adresse correspond à un compte.</span></div>
    </section>
</main>
<script src="<?= e(url('/js/site-ui.js?v=20260940')) ?>" defer></script>
<script src="<?= e(url('/js/pwa.js?v=20260905')) ?>" defer></script>
</body>
</html>
