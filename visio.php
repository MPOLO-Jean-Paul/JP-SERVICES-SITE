<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';

$sessionId = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$sessionId) {
    redirect('/formations-en-ligne');
}

try {
    $stmt = $conn->prepare(
        'SELECT s.*, f.titre AS formation_titre
         FROM live_sessions s
         LEFT JOIN formations f ON f.id = s.formation_id
         WHERE s.id = :id LIMIT 1'
    );
    $stmt->execute([':id' => $sessionId]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Salle visio: ' . $exception->getMessage());
    jp_abort(503, 'La salle de visioconférence est momentanément indisponible.');
}

if (!$session || $session['statut'] === 'annulee') {
    jp_abort(404, 'Cette session de formation en ligne est introuvable ou a été annulée.');
}

if ($session['acces'] === 'membres') {
    require_login();
}

$isHost = !empty($_SESSION['user_id']) && ($_SESSION['role'] ?? '') === 'admin';
$isLoggedIn = !empty($_SESSION['user_id']);
$displayName = trim((string)($_SESSION['user_prenom'] ?? '') . ' ' . (string)($_SESSION['user_nom'] ?? ''));

$start = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', (string)$session['date_debut']);
$end = $start ? $start->modify('+' . max(15, (int)$session['duree_minutes']) . ' minutes') : null;
$isLive = $session['statut'] === 'en_cours';
$isOver = $session['statut'] === 'terminee';

$inviteUrl = absolute_url(app_route('/visio', ['id' => $sessionId]));
$shareText = 'Rejoignez la formation en ligne « ' . (string)$session['titre'] . ' » organisée par JP-Services';
$whatsAppUrl = 'https://wa.me/?text=' . rawurlencode($shareText . ' : ' . $inviteUrl);
$telegramUrl = 'https://t.me/share/url?url=' . rawurlencode($inviteUrl) . '&text=' . rawurlencode($shareText);

$jitsiConfig = [
    'roomName' => (string)$session['room_name'],
    'parentNode' => '__PARENT__',
    'width' => '100%',
    'height' => '100%',
    'lang' => jp_is_english() ? 'en' : 'fr',
    'userInfo' => ['displayName' => $displayName !== '' ? $displayName : ($isLoggedIn ? 'Membre JP-Services' : '')],
    'configOverwrite' => [
        'prejoinPageEnabled' => true,
        'startWithAudioMuted' => true,
        'startWithVideoMuted' => !$isHost,
        'disableDeepLinking' => true,
        'enableWelcomePage' => false,
        'requireDisplayName' => true,
        'readOnlyName' => $displayName !== '',
        'defaultLanguage' => jp_is_english() ? 'en' : 'fr',
    ],
    'interfaceConfigOverwrite' => [
        'SHOW_JITSI_WATERMARK' => false,
        'SHOW_BRAND_WATERMARK' => false,
        'MOBILE_APP_PROMO' => false,
        'TOOLBAR_ALWAYS_VISIBLE' => false,
    ],
];
if ($isHost) {
    $jitsiConfig['userInfo']['moderator'] = true;
}

include __DIR__ . '/includes/header.php';
?>

<main id="main-content" class="jp-visio-page">
    <section class="jp-section jp-visio-section">
        <div class="home-shell">
            <div class="jp-visio-head reveal">
                <div>
                    <span class="home-eyebrow"><i class="fas fa-video"></i> <?= $isLive ? 'Session en direct' : ($isOver ? 'Session terminée' : 'Salle de visioconférence') ?></span>
                    <h2 data-testid="visio-title"><?= e($session['titre']) ?></h2>
                    <p>
                        <?php if ($start): ?><i class="far fa-calendar"></i> <?= e($start->format('d/m/Y · H\hi')) ?><?php if ($end): ?> → <?= e($end->format('H\hi')) ?><?php endif; ?><?php endif; ?>
                        <?php if (!empty($session['formateur'])): ?> · <i class="fas fa-chalkboard-user"></i> <?= e($session['formateur']) ?><?php endif; ?>
                        <?php if (!empty($session['formation_titre'])): ?> · <i class="fas fa-graduation-cap"></i> <?= e($session['formation_titre']) ?><?php endif; ?>
                    </p>
                </div>
                <a class="jp-text-link" href="<?= e(url('/formations-en-ligne')) ?>"><i class="fas fa-arrow-left"></i> Toutes les sessions</a>
            </div>

            <div class="jp-visio-layout">
                <div class="jp-visio-stage reveal" data-testid="visio-stage">
                    <?php if ($isOver): ?>
                        <div class="jp-visio-ended">
                            <span><i class="fas fa-circle-check"></i></span>
                            <h3>Cette session est terminée</h3>
                            <p>Merci d’avoir participé. Consultez le programme pour rejoindre la prochaine session en direct.</p>
                            <a class="jp-btn jp-btn-primary" href="<?= e(url('/formations-en-ligne')) ?>">Voir les prochaines sessions</a>
                        </div>
                    <?php else: ?>
                        <div id="jitsi-frame" class="jp-jitsi-frame" data-testid="jitsi-frame"></div>
                    <?php endif; ?>
                </div>

                <aside class="jp-visio-side reveal" aria-label="Informations et partage">
                    <div class="jp-visio-card">
                        <h3><i class="fas fa-circle-info"></i> Avant de rejoindre</h3>
                        <ul>
                            <li>Autorisez le micro et la caméra si vous souhaitez intervenir.</li>
                            <li>Le micro est coupé par défaut à l’entrée dans la salle.</li>
                            <li>Sur téléphone, l’application gratuite Jitsi Meet peut être proposée pour plus de confort.</li>
                            <?php if ($isHost): ?><li><strong>Vous êtes l’hôte :</strong> entrez en premier dans la salle pour obtenir les droits de modération (muet général, admission, partage).</li><?php endif; ?>
                        </ul>
                    </div>

                    <div class="jp-visio-card jp-visio-share">
                        <h3><i class="fas fa-share-nodes"></i> Inviter des participants</h3>
                        <label for="visio-invite-link">Lien de la salle</label>
                        <div class="jp-visio-copy">
                            <input id="visio-invite-link" type="text" readonly value="<?= e($inviteUrl) ?>" data-testid="visio-invite-link">
                            <button type="button" class="jp-btn jp-btn-secondary" data-copy-invite data-testid="visio-copy-btn"><i class="far fa-copy"></i> Copier</button>
                        </div>
                        <div class="jp-visio-share-actions">
                            <a class="jp-btn jp-btn-whatsapp" href="<?= e($whatsAppUrl) ?>" target="_blank" rel="noopener noreferrer" data-testid="visio-whatsapp-btn"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                            <a class="jp-btn jp-btn-telegram" href="<?= e($telegramUrl) ?>" target="_blank" rel="noopener noreferrer" data-testid="visio-telegram-btn"><i class="fab fa-telegram"></i> Telegram</a>
                        </div>
                    </div>

                    <?php if (!empty($session['description'])): ?>
                    <div class="jp-visio-card">
                        <h3><i class="fas fa-align-left"></i> À propos de la session</h3>
                        <p data-no-translate><?= nl2br(e((string)$session['description'])) ?></p>
                    </div>
                    <?php endif; ?>
                </aside>
            </div>
        </div>
    </section>
</main>

<?php if (!$isOver): ?>
<script src="https://meet.jit.si/external_api.js" defer></script>
<script>
window.addEventListener('load', function () {
    if (typeof JitsiMeetExternalAPI === 'undefined') {
        var frame = document.getElementById('jitsi-frame');
        if (frame) {
            frame.innerHTML = '<div class="jp-visio-ended"><span><i class="fas fa-triangle-exclamation"></i></span><h3>La visioconférence n’a pas pu se charger</h3><p>Vérifiez votre connexion puis rechargez la page.</p></div>';
        }
        return;
    }
    var config = <?= json_encode($jitsiConfig, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) ?>;
    config.parentNode = document.getElementById('jitsi-frame');
    new JitsiMeetExternalAPI('meet.jit.si', config);
});
</script>
<?php endif; ?>
<script>
document.querySelectorAll('[data-copy-invite]').forEach(function (button) {
    button.addEventListener('click', async function () {
        var input = document.getElementById('visio-invite-link');
        if (!input) return;
        try {
            await navigator.clipboard.writeText(input.value);
            button.classList.add('is-copied');
            button.innerHTML = '<i class="fas fa-check"></i> Copié';
            setTimeout(function () { button.classList.remove('is-copied'); button.innerHTML = '<i class="far fa-copy"></i> Copier'; }, 2400);
        } catch (error) {
            input.select();
            document.execCommand('copy');
        }
    });
});
</script>

<?php include __DIR__ . '/includes/footer.php'; ?>
