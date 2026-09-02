<?php

declare(strict_types=1);
require_once __DIR__ . '/includes/connexion_db.php';
require_once __DIR__ . '/app/google_identity.php';
header('Cache-Control: no-store, private');

$message = '';
$successMessage = '';
if (isset($_GET['active_success'])) $successMessage = 'Votre compte est actif. Vous pouvez maintenant vous connecter.';
elseif (isset($_GET['reg_success'])) $successMessage = 'Votre compte a été créé avec succès.';
elseif (isset($_GET['reset_success'])) $successMessage = 'Votre mot de passe a été modifié.';
elseif (!empty($_SESSION['security_flash'])) {
    $successMessage = (string)$_SESSION['security_flash'];
    unset($_SESSION['security_flash']);
}

$requestedRedirect = (string)($_GET['redirect_to'] ?? $_SESSION['redirect_after_login'] ?? '/');
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    jp_remember_login_destination(isset($_GET['redirect_to']) ? (string)$_GET['redirect_to'] : null);
}
$redirectPath = jp_safe_local_redirect($requestedRedirect);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identity = strtolower(trim((string)($_POST['email'] ?? '')));
    $password = (string)($_POST['mot_de_passe'] ?? '');
    $rateKey = 'login:' . strtolower($identity) . ':' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');

    if (!jp_rate_limit($rateKey, 8, 900)) {
        $message = 'Trop de tentatives. Réessayez dans quelques minutes.';
    } elseif (mb_strlen($identity, 'UTF-8') > 254 || !filter_var($identity, FILTER_VALIDATE_EMAIL) || $password === '' || strlen($password) > 512) {
        $message = 'Renseignez une adresse e-mail valide et votre mot de passe.';
    } else {
        $recaptchaSecret = trim((string)env('RECAPTCHA_SECRET_KEY', ''));
        $recaptchaValid = true;
        if ($recaptchaSecret !== '') {
            $responseToken = (string)($_POST['g-recaptcha-response'] ?? '');
            $payload = http_build_query(['secret'=>$recaptchaSecret,'response'=>$responseToken,'remoteip'=>$_SERVER['REMOTE_ADDR'] ?? '']);
            $context = stream_context_create(['http'=>['method'=>'POST','header'=>"Content-Type: application/x-www-form-urlencoded\r\n",'content'=>$payload,'timeout'=>5]]);
            $raw = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
            $verification = is_string($raw) ? json_decode($raw, true) : null;
            $recaptchaValid = is_array($verification)
                && !empty($verification['success'])
                && (string)($verification['action'] ?? '') === 'login'
                && (float)($verification['score'] ?? 0) >= 0.5;
        }
        if (!$recaptchaValid) {
            $message = 'La vérification de sécurité a échoué. Rechargez la page puis recommencez.';
        } else {
            try {
                $stmt = $conn->prepare('SELECT id, nom, prenom, email, mot_de_passe, role, is_active FROM users WHERE email = :identity LIMIT 1');
                $stmt->execute(['identity'=>$identity]);
                $user = $stmt->fetch();
                if (!$user || !password_verify($password, (string)$user['mot_de_passe'])) {
                    usleep(350000);
                    $message = 'Identifiant ou mot de passe incorrect.';
                } elseif ((int)$user['is_active'] !== 1) {
                    $message = 'Ce compte n’est pas disponible pour le moment.';
                } else {
                    if (password_needs_rehash((string)$user['mot_de_passe'], PASSWORD_DEFAULT)) {
                        $rehash = $conn->prepare('UPDATE users SET mot_de_passe = :password WHERE id = :id');
                        $rehash->execute(['password' => password_hash($password, PASSWORD_DEFAULT), 'id' => (int)$user['id']]);
                    }
                    jp_start_user_session(
                        (int)$user['id'],
                        (string)$user['nom'],
                        (string)($user['prenom'] ?? ''),
                        (string)$user['role']
                    );
                    redirect(jp_take_login_destination((string)$user['role']));
                }
            } catch (Throwable $exception) {
                error_log($exception->getMessage());
                $message = 'La connexion est momentanément indisponible.';
            }
        }
    }
}

try { $conn->exec('DELETE FROM temp_users WHERE date_demande < (NOW() - INTERVAL 30 MINUTE)'); } catch (Throwable $exception) { error_log($exception->getMessage()); }
$recaptchaSiteKey = trim((string)env('RECAPTCHA_SITE_KEY', ''));
$googleClientId = jp_google_is_configured() ? jp_google_client_id() : '';
?>
<!doctype html><html lang="fr" data-auth-use-preferences><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#1F72F1"><meta name="color-scheme" content="light dark"><meta name="robots" content="noindex,follow"><meta name="referrer" content="strict-origin-when-cross-origin"><meta name="description" content="Connectez-vous à votre espace JP-Services pour accéder aux formations et à la communauté."><title>Connexion | JP-Services</title><link rel="icon" href="<?= e(url('/images/logo2.png')) ?>"><link rel="manifest" href="<?= e(url('/manifest.webmanifest')) ?>"><link rel="canonical" href="<?= e(absolute_url('/connexion')) ?>"><script>(function(){try{var t=localStorage.getItem('jp-theme')||'system';var q=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var d=t==='system'?(q?'dark':'light'):t;document.documentElement.dataset.theme=d;document.documentElement.dataset.themeChoice=t;document.querySelector('meta[name="color-scheme"]').content=d}catch(e){document.documentElement.dataset.theme='light';document.documentElement.dataset.themeChoice='system'}})();</script><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet"><link rel="stylesheet" href="<?= e(url('/css/app.css?v=20260904')) ?>"><link rel="stylesheet" href="<?= e(url('/css/pro-polish.css?v=20260920')) ?>"><?php if($recaptchaSiteKey!==''): ?><script src="https://www.google.com/recaptcha/api.js?render=<?= e($recaptchaSiteKey) ?>"></script><?php endif; ?></head><body class="jp-app">
<main class="auth-wrapper jp-login-layout" id="main-content">
<section class="jp-login-showcase" aria-labelledby="login-showcase-title">
    <a class="jp-login-showcase-brand" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span>JP-Services</span></a>
    <div class="jp-login-showcase-copy">
        <span class="jp-login-kicker">ESPACE MEMBRE</span>
        <h1 id="login-showcase-title">Votre parcours numérique, au même endroit.</h1>
        <ul>
            <li><i class="fas fa-graduation-cap" aria-hidden="true"></i><span>Retrouvez vos formations et vos prochaines sessions.</span></li>
            <li><i class="fas fa-download" aria-hidden="true"></i><span>Accédez aux logiciels et ressources recommandés.</span></li>
            <li><i class="fas fa-comments" aria-hidden="true"></i><span>Échangez avec la communauté et l’équipe JP‑Services.</span></li>
            <li><i class="fas fa-shield-halved" aria-hidden="true"></i><span>Un espace personnel simple, protégé et facile à utiliser.</span></li>
        </ul>
    </div>
    <div class="jp-login-showcase-visual" aria-hidden="true">
        <span class="jp-login-visual-orb is-one"></span><span class="jp-login-visual-orb is-two"></span>
        <img src="<?= e(url('/images/hero-dashboard.jpg')) ?>" alt="">
        <span class="jp-login-visual-chip"><i class="fas fa-circle-check"></i> Votre espace, en un seul endroit</span>
    </div>
</section>
<section class="auth-card jp-login-card"><div class="brand-header"><a class="jp-login-product" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span><small>Plateforme</small>JP-Services</span></a><h1>Connexion à votre espace</h1><p>Accédez à vos formations, outils et projets.</p></div>
<?php if($successMessage!==''): ?><div class="alert alert-success" role="status" data-testid="login-success"><?= e($successMessage) ?></div><?php endif; ?><?php if($message!==''): ?><div class="alert alert-danger" role="alert" data-testid="login-error"><?= e($message) ?></div><?php endif; ?>
<?php if ($googleClientId !== ''): ?>
<div class="jp-social-auth" data-testid="google-signin-section"><span class="jp-auth-social-label">Connexion rapide</span>
    <div class="jp-google-signin"
         data-google-client-id="<?= e($googleClientId) ?>"
         data-google-endpoint="<?= e(url('/auth/google')) ?>"
         data-google-csrf="<?= e(csrf_token()) ?>"
         data-google-context="signin"><button class="jp-google-fallback-button" type="button" data-google-fallback><i class="fa-brands fa-google" aria-hidden="true"></i><span>Continuer avec Google</span></button></div>
    <p class="jp-google-auth-status" data-google-auth-status role="status" hidden></p>
    <div class="jp-auth-divider" aria-hidden="true"><span>ou avec votre e-mail</span></div>
</div>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<script src="<?= e(url('/js/google-auth.js?v=20260905')) ?>" defer></script>
<?php endif; ?>
<form method="post" action="<?= e(url('/connexion')) ?>" id="login-form" data-testid="login-form"><?= csrf_field() ?><input type="hidden" name="g-recaptcha-response" id="g-recaptcha-response"><div class="jp-field mb-3"><label class="form-label" for="identity">Adresse e-mail</label><div class="jp-auth-input-icon"><i class="fas fa-envelope" aria-hidden="true"></i><input class="form-control" id="identity" name="email" type="email" maxlength="254" autocomplete="username" required value="<?= e($_POST['email'] ?? '') ?>" data-testid="login-email"></div></div><div class="jp-field mb-3"><label class="form-label" for="password">Mot de passe</label><div class="jp-input-wrap jp-auth-input-icon"><i class="fas fa-lock" aria-hidden="true"></i><input class="form-control" id="password" name="mot_de_passe" type="password" maxlength="512" autocomplete="current-password" required data-testid="login-password"><button class="jp-password-toggle" type="button" data-password-toggle="password" aria-label="Afficher ou masquer le mot de passe"><i class="fas fa-eye"></i></button></div></div><button class="btn btn-primary jp-login-submit" type="submit" data-testid="login-submit">Se connecter <i class="fas fa-arrow-right" aria-hidden="true"></i></button><p class="jp-login-signup">Pas encore de compte ? <a class="auth-footer-link" href="<?= e(url('/inscription')) ?>">Créer un compte</a></p><a class="jp-login-recovery auth-footer-link" href="<?= e(url('/mot-de-passe-oublie')) ?>">Mot de passe oublié ?</a></form><div class="auth-security-note"><i class="fas fa-shield-halved" aria-hidden="true"></i><span>Connexion protégée par session sécurisée, limitation des tentatives et contrôle CSRF.</span></div></section></main>
<script src="<?= e(url('/js/site-ui.js?v=20260904')) ?>" defer></script><script src="<?= e(url('/js/pwa.js?v=20260905')) ?>" defer></script><?php if($recaptchaSiteKey!==''): ?><script>grecaptcha.ready(()=>grecaptcha.execute(<?= json_encode($recaptchaSiteKey) ?>,{action:'login'}).then(token=>{document.getElementById('g-recaptcha-response').value=token;}));</script><?php endif; ?></body></html>
