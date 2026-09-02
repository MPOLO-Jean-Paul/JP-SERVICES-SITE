<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';

try {
    $stmt = $conn->query(
        'SELECT s.*, f.titre AS formation_titre
         FROM live_sessions s
         LEFT JOIN formations f ON f.id = s.formation_id
         WHERE s.statut IN ("planifiee", "en_cours")
         ORDER BY (s.statut = "en_cours") DESC, s.date_debut ASC'
    );
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Sessions en ligne: ' . $exception->getMessage());
    $sessions = [];
}

$now = new DateTimeImmutable('now');

function jp_live_date_label(string $value): string
{
    $timestamp = strtotime($value);
    if ($timestamp === false) {
        return 'Date à confirmer';
    }
    $months = [1 => 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return (int)date('j', $timestamp) . ' ' . $months[(int)date('n', $timestamp)] . ' ' . date('Y', $timestamp) . ' · ' . date('H\hi', $timestamp);
}

include __DIR__ . '/includes/header.php';
?>

<main id="main-content" class="jp-live-page">
    <section class="jp-training-hero jp-live-hero">
        <div class="home-shell jp-training-hero-grid">
            <div class="reveal">
                <span class="home-eyebrow"><i class="fas fa-video"></i> Formations en ligne</span>
                <h2 data-testid="live-title">Rejoignez une formation en direct, où que vous soyez.</h2>
                <p>Participez à nos sessions de visioconférence depuis votre ordinateur ou votre téléphone, sans rien installer. Le lien de la salle peut être partagé par WhatsApp ou Telegram.</p>
                <div class="jp-training-hero-actions">
                    <a class="jp-btn jp-btn-primary" href="#sessions-en-ligne" data-testid="live-browse-btn">Voir les sessions <i class="fas fa-arrow-down"></i></a>
                    <a class="jp-text-link" href="<?= e(url('/formations')) ?>">Explorer le catalogue <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
            <aside class="jp-training-overview reveal" aria-label="Les sessions en bref">
                <div><strong data-testid="live-stat-count"><?= count($sessions) ?></strong><span>session<?= count($sessions) > 1 ? 's' : '' ?> à venir</span></div>
                <div><strong><?= count(array_filter($sessions, static fn(array $s) => $s['statut'] === 'en_cours')) ?></strong><span>en direct maintenant</span></div>
                <div><strong>100%</strong><span>depuis le navigateur</span></div>
            </aside>
        </div>
    </section>

    <section class="jp-section" id="sessions-en-ligne">
        <div class="home-shell">
            <div class="jp-section-heading reveal"><span class="home-eyebrow">Programme en ligne</span><h2>Les prochaines sessions en visioconférence.</h2><p>Rejoignez une salle quelques minutes avant le début. Un compte membre peut être demandé selon la session.</p></div>

            <?php if ($sessions !== []): ?>
            <div class="jp-live-grid">
                <?php foreach ($sessions as $session):
                    $isLive = $session['statut'] === 'en_cours';
                    $start = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', (string)$session['date_debut']) ?: $now;
                    $end = $start->modify('+' . max(15, (int)$session['duree_minutes']) . ' minutes');
                ?>
                <article class="jp-live-card reveal <?= $isLive ? 'is-live' : '' ?>" data-testid="live-card-<?= (int)$session['id'] ?>">
                    <div class="jp-live-card-head">
                        <span class="jp-live-status"><?= $isLive ? '<i class="fas fa-circle"></i> En direct' : '<i class="far fa-calendar"></i> ' . e(jp_live_date_label((string)$session['date_debut'])) ?></span>
                        <span class="jp-live-access"><?= $session['acces'] === 'public' ? 'Accès libre' : 'Membres' ?></span>
                    </div>
                    <h3 data-no-translate><?= e($session['titre']) ?></h3>
                    <?php if (!empty($session['formation_titre'])): ?><span class="jp-live-formation"><i class="fas fa-graduation-cap"></i> <?= e($session['formation_titre']) ?></span><?php endif; ?>
                    <?php if (!empty($session['description'])): ?><p data-no-translate><?= e(mb_strimwidth(trim((string)$session['description']), 0, 180, '…')) ?></p><?php endif; ?>
                    <dl class="jp-training-card-facts">
                        <div><dt><i class="fas fa-chalkboard-user"></i> Hôte</dt><dd><?= e($session['formateur'] !== '' ? $session['formateur'] : 'Équipe JP-Services') ?></dd></div>
                        <div><dt><i class="far fa-clock"></i> Durée</dt><dd><?= (int)$session['duree_minutes'] ?> min</dd></div>
                        <div><dt><i class="fas fa-hourglass-end"></i> Fin prévue</dt><dd><?= e($end->format('H\hi')) ?></dd></div>
                    </dl>
                    <div class="jp-live-card-actions">
                        <a class="jp-btn jp-btn-primary" href="<?= e(app_route('/visio', ['id' => (int)$session['id']])) ?>" data-testid="live-join-btn-<?= (int)$session['id'] ?>"><i class="fas fa-video"></i> Rejoindre la salle</a>
                        <a class="jp-btn jp-btn-ghost" href="<?= e('https://wa.me/?text=' . rawurlencode('Rejoignez la formation en ligne « ' . $session['titre'] . ' » : ' . absolute_url(app_route('/visio', ['id' => (int)$session['id']])))) ?>" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> Partager</a>
                    </div>
                </article>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <div class="jp-training-empty is-static reveal" data-testid="live-empty">
                <span><i class="fas fa-video"></i></span>
                <h3>Aucune session en ligne programmée</h3>
                <p>Les prochaines visioconférences seront annoncées ici. Inscrivez-vous à une formation pour être notifié.</p>
                <a class="jp-btn jp-btn-primary" href="<?= e(url('/formations')) ?>">Voir les formations</a>
            </div>
            <?php endif; ?>
        </div>
    </section>

    <section class="jp-section jp-training-guidance">
        <div class="home-shell">
            <div class="jp-section-heading reveal"><span class="home-eyebrow">Bien participer</span><h2>Une connexion, un navigateur, et c’est parti.</h2><p>Nos salles de visioconférence fonctionnent sans installation, sur ordinateur comme sur téléphone.</p></div>
            <div class="jp-training-steps">
                <article class="reveal"><span>01</span><i class="fas fa-laptop"></i><h3>Depuis n’importe quel appareil</h3><p>Ordinateur, tablette ou téléphone : la salle s’ouvre dans le navigateur. Sur mobile, l’application gratuite Jitsi Meet est proposée automatiquement si besoin.</p></article>
                <article class="reveal"><span>02</span><i class="fas fa-microphone-lines"></i><h3>Caméra et micro maîtrisés</h3><p>Vous choisissez votre nom d’affichage, votre micro et votre caméra avant d’entrer. Le micro est coupé par défaut à l’arrivée.</p></article>
                <article class="reveal"><span>03</span><i class="fas fa-share-nodes"></i><h3>Invitation facile</h3><p>Chaque salle possède un lien unique à copier ou à partager directement par WhatsApp ou Telegram.</p></article>
            </div>
        </div>
    </section>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
