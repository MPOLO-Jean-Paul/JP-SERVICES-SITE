<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';

header('Cache-Control: no-store, private');

$email = (string)($_SESSION['pending_activation_email'] ?? '');
if ($email === '') {
    redirect('/inscription');
}
$flash = (string)($_SESSION['activation_flash'] ?? '');
unset($_SESSION['activation_flash']);
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
    <title>Confirmer votre e-mail | JP-Services</title>
    <link rel="icon" href="<?= e(url('/images/logo2.png')) ?>">
    <link rel="manifest" href="<?= e(url('/manifest.webmanifest')) ?>">
    <script>(function(){try{var t=localStorage.getItem('jp-theme')||'system';var q=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var d=t==='system'?(q?'dark':'light'):t;document.documentElement.dataset.theme=d;document.documentElement.dataset.themeChoice=t;document.querySelector('meta[name="color-scheme"]').content=d}catch(e){document.documentElement.dataset.theme='light';document.documentElement.dataset.themeChoice='system'}})();</script>
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
<main class="auth-wrapper jp-login-layout jp-recovery-layout jp-activation-layout" id="main-content">
    <section class="jp-login-showcase jp-recovery-showcase" aria-labelledby="waiting-showcase-title">
        <a class="jp-login-showcase-brand" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span>JP-Services</span></a>
        <div class="jp-login-showcase-copy">
            <span class="jp-login-kicker">CONFIRMATION D’INSCRIPTION</span>
            <h1 id="waiting-showcase-title">Votre espace est prêt à être activé.</h1>
            <ul>
                <li><i class="fas fa-envelope" aria-hidden="true"></i><span>Un code personnel à 6 chiffres vient d’être envoyé à votre adresse e-mail.</span></li>
                <li><i class="fas fa-clock" aria-hidden="true"></i><span>Il reste disponible pendant 15 minutes pour sécuriser la création du compte.</span></li>
                <li><i class="fas fa-circle-check" aria-hidden="true"></i><span>Une fois confirmé, vous pourrez vous connecter immédiatement.</span></li>
            </ul>
        </div>
        <div class="jp-recovery-stage" aria-hidden="true"><div class="jp-recovery-stage-icon"><i class="fas fa-user-check"></i></div><div><strong>Une dernière vérification.</strong><span>Et votre parcours peut commencer.</span></div><i class="fas fa-shield-halved jp-recovery-stage-shield"></i></div>
    </section>
    <section class="auth-card jp-login-card jp-recovery-card" aria-labelledby="waiting-title">
        <div class="brand-header">
            <a class="jp-login-product" href="<?= e(url('/')) ?>" aria-label="JP-Services — Accueil"><img src="<?= e(url('/images/logo2.png')) ?>" alt=""><span><small>Plateforme</small>JP-Services</span></a>
            <h1 id="waiting-title">Confirmez votre adresse e-mail</h1>
            <p>Nous avons envoyé un code à 6 chiffres à <span class="jp-activation-email-chip"><i class="fas fa-envelope"></i> <?= e($email) ?></span></p>
        </div>
        <?php if ($flash !== ''): ?>
            <div class="alert alert-info" role="status"><i class="fas fa-circle-info"></i> <?= e($flash) ?></div>
        <?php endif; ?>
        <form method="post" action="<?= e(url('/activation')) ?>" class="jp-recovery-form" data-testid="activation-code-form">
            <?= csrf_field() ?>
            <input type="hidden" name="email" value="<?= e($email) ?>">
            <div class="jp-field">
                <label class="form-label" for="activation-code">Code d’activation à 6 chiffres</label>
                <div class="jp-recovery-input jp-reset-code-input"><i class="fas fa-key" aria-hidden="true"></i><input class="form-control" id="activation-code" type="text" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required autofocus placeholder="000000" aria-describedby="activation-code-hint" data-verification-code data-testid="activation-code"></div>
                <small id="activation-code-hint" class="jp-reset-code-hint">Valable 15 minutes. Vous pouvez le copier-coller depuis votre e-mail.</small>
            </div>
            <button class="btn btn-primary jp-login-submit" type="submit" data-testid="activation-confirm">Confirmer mon compte <i class="fas fa-check" aria-hidden="true"></i></button>
        </form>
        <div id="activation-status" class="jp-activation-live-status" role="status"><span class="jp-live-pulse" aria-hidden="true"></span><span>Vérification automatique en cours…</span></div>
        <div class="jp-recovery-actions">
            <form method="post" action="<?= e(url('/activation/renvoyer')) ?>">
                <?= csrf_field() ?>
                <button class="btn btn-outline-primary w-100" type="submit"><i class="fas fa-rotate-right"></i> Renvoyer l’e-mail d’activation</button>
            </form>
            <a href="<?= e(url('/inscription')) ?>" class="auth-footer-link"><i class="fas fa-arrow-left"></i> Modifier l’adresse e-mail</a>
        </div>
    </section>
</main>
<script>
(function () {
  var status = document.getElementById('activation-status');
  var timer = window.setInterval(async function () {
    try {
      var response = await fetch('<?= e(url('/activation/statut')) ?>', {headers:{'Accept':'application/json'}, credentials:'same-origin'});
      var data = await response.json();
      if (data.active) {
        window.clearInterval(timer);
        if (status) status.innerHTML = '<span class="jp-live-pulse is-active" aria-hidden="true"></span><strong style="color:var(--jp-success)">Compte activé ! Redirection…</strong>';
        window.location.assign('<?= e(url('/connexion')) ?>');
      }
    } catch (error) {
      // La saisie manuelle du code reste opérationnelle.
    }
  }, 3000);
  window.addEventListener('beforeunload', function () { window.clearInterval(timer); }, {once:true});
}());
</script>
<script src="<?= e(url('/js/site-ui.js?v=20260940')) ?>" defer></script>
<script src="<?= e(url('/js/pwa.js?v=20260905')) ?>" defer></script>
</body>
</html>
