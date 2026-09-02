<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';

header('Cache-Control: no-store, private');

$error = '';
$postedEmail = strtolower(trim((string)($_POST['email'] ?? '')));
$email = $postedEmail !== ''
    ? $postedEmail
    : strtolower(trim((string)($_SESSION['pending_reset_email'] ?? '')));
$code = trim((string)($_POST['code'] ?? ''));
$flash = (string)($_SESSION['reset_flash'] ?? '');
unset($_SESSION['reset_flash']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = (string)($_POST['mdp'] ?? '');
    $confirmation = (string)($_POST['conf'] ?? '');
    $codeHash = preg_match('/^\d{6}$/', $code) === 1 ? hash('sha256', $code) : '';

    if (mb_strlen($email, 'UTF-8') > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL) || $codeHash === '') {
        $error = 'Saisissez votre adresse e-mail et le code à 6 chiffres reçu.';
    } elseif (!jp_rate_limit('password-reset-submit-ip:' . (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 6, 900)
        || !jp_rate_limit('password-reset-submit-email:' . hash('sha256', $email), 6, 900)) {
        $error = 'Trop de tentatives. Demandez un nouveau code ou réessayez plus tard.';
    } else {
        $userId = null;
        try {
            $lookup = $conn->prepare('SELECT id FROM users WHERE email = :email AND reset_token = :token AND reset_expire > NOW() LIMIT 1');
            $lookup->execute(['email' => $email, 'token' => $codeHash]);
            $userId = $lookup->fetchColumn() ?: null;
        } catch (Throwable) {
            error_log('Password reset: vérification de code indisponible.');
        }

        if (!$userId) {
            $error = 'Ce code est invalide, expiré ou a déjà été utilisé.';
        } elseif (($passwordError = jp_password_policy($password)) !== null) {
            $error = $passwordError;
        } elseif (!hash_equals($password, $confirmation)) {
            $error = 'Les mots de passe ne correspondent pas.';
        } else {
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            if (!is_string($passwordHash)) {
                $error = 'Impossible de préparer ce mot de passe. Veuillez réessayer.';
            } else {
                try {
                    $update = $conn->prepare('UPDATE users SET mot_de_passe = :password, reset_token = NULL, reset_expire = NULL WHERE id = :id AND email = :email AND reset_token = :token AND reset_expire > NOW()');
                    $update->execute(['password' => $passwordHash, 'id' => $userId, 'email' => $email, 'token' => $codeHash]);
                    if ($update->rowCount() !== 1) {
                        $error = 'Ce code est invalide, expiré ou a déjà été utilisé.';
                    } else {
                        // Le nouveau mot de passe ne doit jamais conserver la session qui
                        // a ouvert cette page ; une nouvelle session est exigée.
                        $_SESSION = [];
                        session_regenerate_id(true);
                        $_SESSION['security_flash'] = 'Votre mot de passe a été modifié. Connectez-vous avec le nouveau mot de passe.';
                        redirect('/connexion');
                    }
                } catch (Throwable) {
                    error_log('Password reset: mise à jour indisponible.');
                    $error = 'La réinitialisation est momentanément indisponible. Réessayez plus tard.';
                }
            }
        }
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
<meta name="description" content="Choisissez un nouveau mot de passe pour votre compte JP-Services de manière sécurisée.">
<title>Nouveau mot de passe | JP-Services</title>
<link rel="icon" href="<?= e(url('/images/logo2.png')) ?>" type="image/png">
<link rel="manifest" href="<?= e(url('/manifest.webmanifest')) ?>">
<link rel="canonical" href="<?= e(absolute_url('/mot-de-passe/reinitialiser')) ?>">
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
    <section class="jp-login-showcase jp-recovery-showcase" aria-labelledby="reset-showcase-title">
        <a class="jp-login-showcase-brand" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span>JP-Services</span></a>
        <div class="jp-login-showcase-copy">
            <span class="jp-login-kicker">DERNIÈRE ÉTAPE</span>
            <h1 id="reset-showcase-title">Créez un accès solide, à votre image.</h1>
            <ul>
                <li><i class="fas fa-fingerprint" aria-hidden="true"></i><span>Choisissez un mot de passe unique, que vous n’utilisez sur aucun autre service.</span></li>
                <li><i class="fas fa-lock" aria-hidden="true"></i><span>Le code reçu est personnel et devient inutilisable dès cette opération terminée.</span></li>
                <li><i class="fas fa-circle-check" aria-hidden="true"></i><span>Vous pourrez ensuite vous reconnecter avec votre nouveau mot de passe.</span></li>
            </ul>
        </div>
        <div class="jp-recovery-stage" aria-hidden="true">
            <div class="jp-recovery-stage-icon"><i class="fas fa-lock"></i></div>
            <div><strong>Votre espace reste protégé.</strong><span>Un nouveau départ, sans détour.</span></div>
            <i class="fas fa-shield-halved jp-recovery-stage-shield"></i>
        </div>
    </section>
    <section class="auth-card jp-login-card jp-recovery-card" aria-labelledby="reset-title">
        <div class="brand-header">
            <a class="jp-login-product" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span><small>Plateforme</small>JP-Services</span></a>
            <h1 id="reset-title">Nouveau mot de passe</h1>
            <p>Saisissez le code reçu par e-mail, puis choisissez un mot de passe robuste et unique.</p>
        </div>
        <?php if ($error !== ''): ?>
            <div class="alert alert-danger" role="alert" data-testid="reset-error"><i class="fas fa-triangle-exclamation"></i> <?= e($error) ?></div>
        <?php endif; ?>
        <?php if ($flash !== ''): ?>
            <div class="alert alert-success" role="status" data-testid="reset-success"><i class="fas fa-circle-check" aria-hidden="true"></i> <?= e($flash) ?></div>
        <?php endif; ?>
        <form class="jp-recovery-form" method="post" action="<?= e(url('/mot-de-passe/reinitialiser')) ?>" data-testid="reset-form">
            <?= csrf_field() ?>
            <div class="jp-field">
                <label class="form-label" for="email">Adresse e-mail</label>
                <div class="jp-recovery-input"><i class="fas fa-envelope" aria-hidden="true"></i><input class="form-control" id="email" type="email" name="email" autocomplete="email" maxlength="254" required value="<?= e($email) ?>" data-testid="reset-email" placeholder="votre.email@domaine.com"></div>
            </div>
            <div class="jp-field">
                <label class="form-label" for="code">Code de réinitialisation</label>
                <div class="jp-recovery-input jp-reset-code-input"><i class="fas fa-key" aria-hidden="true"></i><input class="form-control" id="code" type="text" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required autofocus placeholder="000000" value="<?= e($code) ?>" aria-describedby="reset-code-hint" data-verification-code data-testid="reset-code"></div>
                <small id="reset-code-hint" class="jp-reset-code-hint">Le code à 6 chiffres est valable une minute. Vous pouvez le copier-coller depuis votre e-mail.</small>
            </div>
            <div class="jp-field">
                <label class="form-label" for="mdp">Nouveau mot de passe</label>
                <div class="jp-input-wrap jp-auth-input-icon"><i class="fas fa-lock" aria-hidden="true"></i>
                    <input class="form-control" id="mdp" type="password" name="mdp" minlength="10" maxlength="128" autocomplete="new-password" placeholder="••••••••••••" required data-testid="reset-password">
                    <button class="jp-password-toggle" type="button" data-password-toggle="mdp" aria-label="Afficher ou masquer le mot de passe"><i class="fas fa-eye"></i></button>
                </div></div>
            <div class="jp-field">
                <label class="form-label" for="conf">Confirmation du mot de passe</label>
                <div class="jp-input-wrap jp-auth-input-icon"><i class="fas fa-lock" aria-hidden="true"></i>
                    <input class="form-control" id="conf" type="password" name="conf" minlength="10" maxlength="128" autocomplete="new-password" placeholder="••••••••••••" required data-testid="reset-confirm">
                    <button class="jp-password-toggle" type="button" data-password-toggle="conf" aria-label="Afficher ou masquer la confirmation"><i class="fas fa-eye"></i></button>
                </div></div>
            <button class="btn btn-primary jp-login-submit" type="submit" data-testid="reset-submit">Enregistrer le mot de passe <i class="fas fa-check" aria-hidden="true"></i></button>
            <a class="jp-recovery-back auth-footer-link" href="<?= e(url('/mot-de-passe-oublie')) ?>"><i class="fas fa-arrow-left" aria-hidden="true"></i> Demander un nouveau code</a>
        </form>
        <div class="auth-security-note"><i class="fas fa-shield-halved"></i><span>Au moins 10 caractères, comprenant une majuscule, une minuscule et un chiffre. Le code expire après utilisation.</span></div>
    </section>
</main>
<script src="<?= e(url('/js/site-ui.js?v=20260940')) ?>" defer></script>
<script src="<?= e(url('/js/pwa.js?v=20260905')) ?>" defer></script>
</body>
</html>
