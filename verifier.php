<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';

header('Cache-Control: no-store, private');

$error = '';
$postedEmail = strtolower(trim((string)($_POST['email'] ?? '')));
$email = $postedEmail !== ''
    ? $postedEmail
    : strtolower(trim((string)($_SESSION['pending_activation_email'] ?? '')));
$code = trim((string)($_POST['code'] ?? ''));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $codeHash = preg_match('/^\d{6}$/', $code) === 1 ? hash('sha256', $code) : '';
    if (mb_strlen($email, 'UTF-8') > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL) || $codeHash === '') {
        $error = 'Saisissez votre adresse e-mail et le code à 6 chiffres reçu.';
    } elseif (!jp_rate_limit('activation-submit-ip:' . (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 6, 900)
        || !jp_rate_limit('activation-submit-email:' . hash('sha256', $email), 6, 900)) {
        $error = 'Trop de tentatives. Demandez un nouveau code ou réessayez plus tard.';
    } else {
        try {
            $conn->beginTransaction();
            $lock = $conn->prepare('SELECT * FROM temp_users WHERE email = :email AND token = :token AND date_demande >= (NOW() - INTERVAL 15 MINUTE) LIMIT 1 FOR UPDATE');
            $lock->execute(['email' => $email, 'token' => $codeHash]);
            $pendingLocked = $lock->fetch(PDO::FETCH_ASSOC);
            if (!is_array($pendingLocked)) {
                $conn->rollBack();
                $error = 'Ce code est invalide, expiré ou a déjà été utilisé.';
            } else {
                $exists = $conn->prepare('SELECT id, is_active FROM users WHERE email = :email LIMIT 1 FOR UPDATE');
                $exists->execute(['email' => (string)$pendingLocked['email']]);
                $existing = $exists->fetch(PDO::FETCH_ASSOC);

                if (is_array($existing) && (int)$existing['is_active'] !== 1) {
                    $conn->rollBack();
                    $error = 'Ce compte n’est pas disponible pour le moment.';
                } else {
                    if (!is_array($existing)) {
                        $insert = $conn->prepare("INSERT INTO users (nom, prenom, email, mot_de_passe, photo_profil, role, is_active, date_inscription) VALUES (:nom, :prenom, :email, :password, :photo, 'utilisateur', 1, NOW())");
                        $insert->execute([
                            'nom' => (string)$pendingLocked['nom'],
                            'prenom' => (string)$pendingLocked['prenom'],
                            'email' => (string)$pendingLocked['email'],
                            'password' => (string)$pendingLocked['mot_de_passe'],
                            'photo' => (string)$pendingLocked['photo_profil'],
                        ]);
                    }

                    $delete = $conn->prepare('DELETE FROM temp_users WHERE id = :id');
                    $delete->execute(['id' => (int)$pendingLocked['id']]);
                    $conn->commit();
                    $_SESSION['pending_activation_email'] = (string)$pendingLocked['email'];
                    $_SESSION['security_flash'] = is_array($existing)
                        ? 'Votre compte est déjà actif. Vous pouvez vous connecter.'
                        : 'Votre compte est maintenant actif. Vous pouvez vous connecter.';
                    redirect('/connexion');
                }
            }
        } catch (Throwable $exception) {
            if ($conn->inTransaction()) {
                $conn->rollBack();
            }
            error_log('Activation: finalisation impossible - ' . $exception->getMessage());
            $error = 'L’activation n’a pas pu être finalisée. Veuillez réessayer.';
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
    <meta name="description" content="Confirmez et activez votre compte JP-Services avec votre code de vérification.">
    <link rel="icon" href="<?= e(url('/images/logo2.png')) ?>">
    <link rel="manifest" href="<?= e(url('/manifest.webmanifest')) ?>">
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
    <section class="jp-login-showcase jp-recovery-showcase" aria-labelledby="activation-showcase-title">
        <a class="jp-login-showcase-brand" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span>JP-Services</span></a>
        <div class="jp-login-showcase-copy"><span class="jp-login-kicker">ACTIVATION DU COMPTE</span><h1 id="activation-showcase-title">Votre compte est presque prêt.</h1><ul><li><i class="fas fa-envelope" aria-hidden="true"></i><span>Retrouvez le code envoyé à votre adresse e-mail.</span></li><li><i class="fas fa-shield-halved" aria-hidden="true"></i><span>Chaque code est personnel et utilisable une seule fois.</span></li><li><i class="fas fa-circle-check" aria-hidden="true"></i><span>Après activation, votre espace vous attend.</span></li></ul></div>
        <div class="jp-recovery-stage" aria-hidden="true"><div class="jp-recovery-stage-icon"><i class="fas fa-user-check"></i></div><div><strong>Une dernière confirmation.</strong><span>Et votre parcours peut commencer.</span></div><i class="fas fa-shield-halved jp-recovery-stage-shield"></i></div>
    </section>
    <section class="auth-card jp-login-card jp-recovery-card" aria-labelledby="activation-title">
        <div class="brand-header">
            <a class="jp-login-product" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span><small>Plateforme</small>JP-Services</span></a>
            <h1 id="activation-title">Confirmer votre inscription</h1>
            <p>Saisissez l’adresse utilisée lors de l’inscription et le code reçu par e-mail.</p>
        </div>
        <?php if ($error !== ''): ?><div class="alert alert-danger mt-3" role="alert" data-testid="activation-error"><i class="fas fa-triangle-exclamation"></i> <?= e($error) ?></div><?php endif; ?>
        <form class="jp-recovery-form text-start" method="post" action="<?= e(url('/activation')) ?>">
            <?= csrf_field() ?>
            <div class="jp-field"><label class="form-label" for="email">Adresse e-mail</label><div class="jp-recovery-input"><i class="fas fa-envelope" aria-hidden="true"></i><input class="form-control" id="email" type="email" name="email" maxlength="254" autocomplete="email" required value="<?= e($email) ?>" placeholder="votre.email@domaine.com"></div></div>
            <div class="jp-field"><label class="form-label" for="code">Code d’activation à 6 chiffres</label><div class="jp-recovery-input jp-reset-code-input"><i class="fas fa-key" aria-hidden="true"></i><input class="form-control" id="code" type="text" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required autofocus placeholder="000000" value="<?= e($code) ?>" aria-describedby="activation-code-hint" data-verification-code></div><small id="activation-code-hint" class="jp-reset-code-hint">Le code à 6 chiffres est valable 15 minutes. Vous pouvez le copier-coller depuis votre e-mail.</small></div>
            <button class="btn btn-primary jp-login-submit" type="submit" data-testid="activation-confirm">Activer mon compte <i class="fas fa-check" aria-hidden="true"></i></button>
            <a class="jp-recovery-back auth-footer-link" href="<?= e(url('/inscription')) ?>"><i class="fas fa-arrow-left" aria-hidden="true"></i> Recommencer l’inscription</a>
        </form>
        <div class="auth-security-note"><i class="fas fa-user-shield"></i><span>Cette confirmation protège votre compte contre les ouvertures automatiques de liens.</span></div>
    </section>
</main>
<script src="<?= e(url('/js/site-ui.js?v=20260940')) ?>" defer></script>
<script src="<?= e(url('/js/pwa.js?v=20260905')) ?>" defer></script>
</body>
</html>
