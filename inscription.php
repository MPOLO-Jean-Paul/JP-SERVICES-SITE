<?php

declare(strict_types=1);
require_once __DIR__ . '/includes/connexion_db.php';
require_once __DIR__ . '/app/auth_mailer.php';
require_once __DIR__ . '/app/google_identity.php';
require_once __DIR__ . '/app/site_settings.php';

header('Cache-Control: no-store, private');

$message = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // L’inscription reste volontairement légère : l’identité peut être
    // complétée ultérieurement dans le profil, sans la demander ici.
    $nom = '';
    $prenom = '';
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    $password = (string)($_POST['mot_de_passe'] ?? '');
    $confirmation = (string)($_POST['confirmer_mot_de_passe'] ?? '');

    if ($email === '' || $password === '') {
        $message = 'Tous les champs obligatoires doivent être renseignés.';
    } elseif (mb_strlen($email, 'UTF-8') > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'L’adresse e-mail n’est pas valide.';
    } elseif (($passwordError = jp_password_policy($password)) !== null) {
        $message = $passwordError;
    } elseif ($password !== $confirmation) {
        $message = 'Les mots de passe ne correspondent pas.';
    } elseif (!jp_rate_limit('register:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 5, 3600)) {
        $message = 'Trop de demandes ont été effectuées. Réessayez plus tard.';
    } else {
        $uploadedPhoto = null;
        $pendingTokenHash = null;
        try {
            // Les demandes d’activation vieilles de plus de 30 minutes ne doivent
            // pas empêcher une nouvelle inscription avec la même adresse.
            $stmt = $conn->prepare('SELECT 1 FROM users WHERE email = :email_users UNION SELECT 1 FROM temp_users WHERE email = :email_temp AND date_demande >= (NOW() - INTERVAL 30 MINUTE) LIMIT 1');
            $stmt->execute(['email_users' => $email, 'email_temp' => $email]);
            if ($stmt->fetchColumn()) {
                throw new RuntimeException('Cette adresse e-mail est déjà utilisée ou en attente d’activation.');
            }

            $expiredPhotosQuery = $conn->prepare('SELECT photo_profil FROM temp_users WHERE email = :email AND date_demande < (NOW() - INTERVAL 30 MINUTE)');
            $expiredPhotosQuery->execute(['email' => $email]);
            $expiredPhotos = $expiredPhotosQuery->fetchAll(PDO::FETCH_COLUMN);
            $removeExpiredPending = $conn->prepare('DELETE FROM temp_users WHERE email = :email AND date_demande < (NOW() - INTERVAL 30 MINUTE)');
            $removeExpiredPending->execute(['email' => $email]);
            foreach ($expiredPhotos as $expiredPhoto) {
                jp_safe_delete_media(is_string($expiredPhoto) ? $expiredPhoto : null);
            }

            $photo = 'images/default-avatar.svg';

            $rawToken = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $tokenHash = hash('sha256', $rawToken);
            $pendingTokenHash = $tokenHash;
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);

            $insert = $conn->prepare('INSERT INTO temp_users (nom, prenom, email, mot_de_passe, photo_profil, token, date_demande) VALUES (:nom, :prenom, :email, :password, :photo, :token, NOW())');
            $insert->execute([
                'nom' => $nom,
                'prenom' => $prenom,
                'email' => $email,
                'password' => $passwordHash,
                'photo' => $photo,
                'token' => $tokenHash,
            ]);

            $_SESSION['pending_activation_email'] = $email;
            try {
                jp_send_activation_email($email, $prenom, $rawToken);
                $_SESSION['activation_flash'] = 'Un e-mail d’activation vient de vous être envoyé. Vérifiez aussi vos courriers indésirables.';
            } catch (Throwable $mailException) {
                error_log('Activation e-mail: ' . $mailException->getMessage());
                $_SESSION['activation_flash'] = 'Votre demande est enregistrée. L’e-mail n’a pas encore pu être envoyé ; vous pouvez demander un nouvel envoi ci-dessous.';
            }
            redirect('/activation/attente');
        } catch (PDOException $exception) {
            // PDOException hérite de RuntimeException : ne jamais exposer le message SQL brut
            if ($pendingTokenHash !== null) {
                try { $conn->prepare('DELETE FROM temp_users WHERE email = :email AND token = :token')->execute(['email' => $email, 'token' => $pendingTokenHash]); } catch (Throwable $cleanupException) { error_log($cleanupException->getMessage()); }
            }
            if ($uploadedPhoto !== null) jp_safe_delete_media($uploadedPhoto);
            error_log('Inscription DB: ' . $exception->getMessage());
            $message = 'L’inscription n’a pas pu aboutir. Réessayez dans quelques instants ou contactez le support.';
        } catch (RuntimeException $exception) {
            if ($pendingTokenHash !== null) {
                try { $conn->prepare('DELETE FROM temp_users WHERE email = :email AND token = :token')->execute(['email' => $email, 'token' => $pendingTokenHash]); } catch (Throwable $cleanupException) { error_log($cleanupException->getMessage()); }
            }
            if ($uploadedPhoto !== null) jp_safe_delete_media($uploadedPhoto);
            $message = $exception->getMessage();
        } catch (Throwable $exception) {
            if ($pendingTokenHash !== null) {
                try { $conn->prepare('DELETE FROM temp_users WHERE email = :email AND token = :token')->execute(['email' => $email, 'token' => $pendingTokenHash]); } catch (Throwable $cleanupException) { error_log($cleanupException->getMessage()); }
            }
            if ($uploadedPhoto !== null) jp_safe_delete_media($uploadedPhoto);
            error_log($exception->getMessage());
            $message = 'L’inscription n’a pas pu aboutir. Réessayez dans quelques instants ou contactez le support.';
        }
    }
}

$authShowcaseBadge = jp_setting($conn, 'auth_showcase_badge', 'ESPACE MEMBRE');
$authShowcaseTitle = jp_setting($conn, 'auth_showcase_title', 'Votre parcours numérique, au même endroit.');
$authRegisterTitle = jp_setting($conn, 'auth_register_title', 'Créer votre compte');
$authRegisterIntro = jp_setting($conn, 'auth_register_intro', 'Rejoignez les formations, les outils et la communauté JP‑Services.');
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
<meta name="description" content="Créez votre compte JP-Services pour accéder aux formations, projets et à la communauté d’apprentissage.">
<meta property="og:title" content="Créer un compte | JP-Services">
<meta property="og:description" content="Rejoignez la communauté JP-Services : formations, logiciels, projets digitaux.">
<meta property="og:type" content="website">
<meta property="og:site_name" content="JP-Services">
<title>Créer un compte | JP-Services</title>
<link rel="icon" href="<?= e(url('/images/logo2.png')) ?>" type="image/png">
<link rel="apple-touch-icon" href="<?= e(url('/images/pwa-192.png')) ?>">
<link rel="manifest" href="<?= e(url('/manifest.webmanifest')) ?>">
<link rel="canonical" href="<?= e(absolute_url('/inscription')) ?>">
<script>(function(){try{var t=localStorage.getItem('jp-theme')||'system';var q=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var d=t==='system'?(q?'dark':'light'):t;document.documentElement.dataset.theme=d;document.documentElement.dataset.themeChoice=t;document.querySelector('meta[name="color-scheme"]').content=d}catch(e){document.documentElement.dataset.theme='light';document.documentElement.dataset.themeChoice='system'}})();</script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">
<link rel="stylesheet" href="<?= e(url('/css/app.css?v=20260904')) ?>">
<link rel="stylesheet" href="<?= e(url('/css/pro-polish.css?v=20260920')) ?>">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","name":"JP-Services","url":"<?= e(absolute_url('/')) ?>","logo":"<?= e(absolute_url('/images/logo2.png')) ?>","sameAs":["https://www.facebook.com/groups/1236192878705291/","https://www.linkedin.com/in/jp-services-b51940381","https://www.youtube.com/@jp-services-v8d"]}
</script>
</head>
<body class="jp-app">
<main class="auth-wrapper jp-login-layout jp-register-layout">
    <section class="jp-login-showcase" aria-labelledby="register-showcase-title">
        <a class="jp-login-showcase-brand" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span>JP-Services</span></a>
        <div class="jp-login-showcase-copy">
            <span class="jp-login-kicker"><?= e($authShowcaseBadge) ?></span>
            <h1 id="register-showcase-title"><?= e($authShowcaseTitle) ?></h1>
            <ul>
                <li><i class="fas fa-graduation-cap" aria-hidden="true"></i><span>Suivez vos formations et leurs prochaines sessions.</span></li>
                <li><i class="fas fa-download" aria-hidden="true"></i><span>Retrouvez les logiciels et ressources utiles à votre parcours.</span></li>
                <li><i class="fas fa-comments" aria-hidden="true"></i><span>Participez à la communauté et développez vos projets.</span></li>
                <li><i class="fas fa-shield-halved" aria-hidden="true"></i><span>Activez votre compte par e-mail avant sa première utilisation.</span></li>
            </ul>
        </div>
        <div class="jp-login-showcase-visual" aria-hidden="true"><span class="jp-login-visual-orb is-one"></span><span class="jp-login-visual-orb is-two"></span><img src="<?= e(url('/images/hero-dashboard.jpg')) ?>" alt=""><span class="jp-login-visual-chip"><i class="fas fa-circle-check"></i> Commencez à votre rythme</span></div>
    </section>
    <section class="auth-card jp-login-card jp-register-card" aria-labelledby="register-title">
        <div class="brand-header"><a class="jp-login-product" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span><small>Plateforme</small>JP-Services</span></a><h1 id="register-title"><?= e($authRegisterTitle) ?></h1><p><?= e($authRegisterIntro) ?></p></div>
        <?php if ($message !== ''): ?><div class="alert alert-danger" role="alert" data-testid="register-error"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> <?= e($message) ?></div><?php endif; ?>
        <?php if ($success !== ''): ?><div class="alert alert-success" role="status" data-testid="register-success"><i class="fas fa-circle-check" aria-hidden="true"></i> <?= e($success) ?></div><?php endif; ?>
        <?php $googleClientId = jp_google_is_configured() ? jp_google_client_id() : ''; if ($googleClientId !== ''): ?>
        <div class="jp-social-auth" data-testid="google-signup-section"><span class="jp-auth-social-label">Inscription rapide</span><div class="jp-google-signin" data-google-client-id="<?= e($googleClientId) ?>" data-google-endpoint="<?= e(url('/auth/google')) ?>" data-google-csrf="<?= e(csrf_token()) ?>" data-google-context="signup"><button class="jp-google-fallback-button" type="button" data-google-fallback><i class="fa-brands fa-google" aria-hidden="true"></i><span>Continuer avec Google</span></button></div><p class="jp-google-auth-status" data-google-auth-status role="status" hidden></p><div class="jp-auth-divider" aria-hidden="true"><span>ou avec votre e-mail</span></div></div>
        <script src="https://accounts.google.com/gsi/client" async defer></script><script src="<?= e(url('/js/google-auth.js?v=20260905')) ?>" defer></script>
        <?php endif; ?>
        <form class="jp-register-form" action="<?= e(url('/inscription')) ?>" method="post" novalidate data-testid="register-form">
            <?= csrf_field() ?>
            <div class="jp-field"><label for="email" class="form-label">Adresse e-mail</label><div class="jp-auth-input-icon"><i class="fas fa-envelope" aria-hidden="true"></i><input class="form-control" id="email" type="email" name="email" maxlength="254" required autocomplete="email" value="<?= e($_POST['email'] ?? '') ?>" data-testid="register-email"></div></div>
            <div class="jp-field"><label for="password" class="form-label">Mot de passe</label><div class="jp-input-wrap jp-auth-input-icon"><i class="fas fa-lock" aria-hidden="true"></i><input class="form-control" id="password" type="password" name="mot_de_passe" required minlength="10" maxlength="128" autocomplete="new-password" data-testid="register-password"><button class="jp-password-toggle" type="button" data-password-toggle="password" aria-label="Afficher ou masquer le mot de passe"><i class="fas fa-eye"></i></button></div></div>
            <div class="jp-field"><label for="confirm" class="form-label">Confirmation du mot de passe</label><div class="jp-input-wrap jp-auth-input-icon"><i class="fas fa-lock" aria-hidden="true"></i><input class="form-control" id="confirm" type="password" name="confirmer_mot_de_passe" required minlength="10" maxlength="128" autocomplete="new-password" data-testid="register-confirm"><button class="jp-password-toggle" type="button" data-password-toggle="confirm" aria-label="Afficher ou masquer la confirmation"><i class="fas fa-eye"></i></button></div></div>
            <div class="auth-security-note"><i class="fas fa-shield-halved" aria-hidden="true"></i><span>10 à 128 caractères, avec une majuscule, une minuscule et un chiffre. Le lien d’activation est valable 15 minutes.</span></div>
            <button class="btn btn-primary jp-login-submit" type="submit" data-testid="register-submit">Créer mon compte <i class="fas fa-arrow-right" aria-hidden="true"></i></button>
            <p class="jp-login-signup">Vous avez déjà un compte ? <a class="auth-footer-link" href="<?= e(url('/connexion')) ?>">Se connecter</a></p>
            <p class="jp-register-terms">En créant votre compte, vous acceptez nos <a href="<?= e(url('/conditions')) ?>">conditions d’utilisation</a> et notre <a href="<?= e(url('/confidentialite')) ?>">politique de confidentialité</a>.</p>
        </form>
    </section>
</main>
<script src="<?= e(url('/js/site-ui.js?v=20260904')) ?>" defer></script>
<script src="<?= e(url('/js/pwa.js?v=20260905')) ?>" defer></script>
</body>
</html>
