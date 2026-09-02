<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';
require_login();

$userId = (int)$_SESSION['user_id'];
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'mark_all_read') {
    try {
        $markRead = $conn->prepare(
            'INSERT IGNORE INTO notifications_lues (user_id, notification_id)
             SELECT :user_id, n.id FROM notifications n
             JOIN abonnements a ON a.formation_id = n.formation_id
             WHERE a.user_id = :subscription_user AND a.notifications_active = 1'
        );
        $markRead->execute(['user_id' => $userId, 'subscription_user' => $userId]);
        $_SESSION['notification_flash'] = 'Toutes les notifications ont été marquées comme lues.';
    } catch (Throwable $exception) {
        error_log('Lecture notifications : ' . $exception->getMessage());
        $_SESSION['notification_flash'] = 'La mise à jour n’a pas pu être effectuée.';
    }
    redirect('/notifications');
}

$notifications = [];
$error = '';
try {
    $statement = $conn->prepare(
        'SELECT n.id, n.titre, n.message, n.date_envoi, f.titre AS formation,
                CASE WHEN nl.notification_id IS NULL THEN 0 ELSE 1 END AS est_lue
         FROM notifications n
         JOIN abonnements a ON a.formation_id = n.formation_id
         JOIN formations f ON f.id = n.formation_id
         LEFT JOIN notifications_lues nl ON nl.notification_id = n.id AND nl.user_id = :reader_id
         WHERE a.user_id = :user_id AND a.notifications_active = 1
         ORDER BY n.date_envoi DESC, n.id DESC'
    );
    $statement->execute(['reader_id' => $userId, 'user_id' => $userId]);
    $notifications = $statement->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Notifications membre : ' . $exception->getMessage());
    $error = 'Vos notifications sont momentanément indisponibles.';
}
$unreadCount = count(array_filter($notifications, static fn(array $notification): bool => empty($notification['est_lue'])));
$flash = (string)($_SESSION['notification_flash'] ?? '');
unset($_SESSION['notification_flash']);

include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-member-page">
    <section class="jp-member-hero"><div class="home-shell jp-member-hero-inner"><div><span class="home-eyebrow"><i class="fas fa-bell"></i> Centre de notifications</span><h2>Les informations utiles, sans bruit.</h2><p><?= $unreadCount ?> notification<?= $unreadCount > 1 ? 's' : '' ?> non lue<?= $unreadCount > 1 ? 's' : '' ?> liée<?= $unreadCount > 1 ? 's' : '' ?> à vos formations.</p></div><?php if ($unreadCount > 0): ?><form method="post" action="<?= e(url('/notifications')) ?>"><?= csrf_field() ?><input type="hidden" name="action" value="mark_all_read"><button class="jp-btn jp-btn-primary" type="submit"><i class="fas fa-check-double"></i> Tout marquer comme lu</button></form><?php endif; ?></div></section>
    <section class="home-section"><div class="home-shell jp-notification-shell">
        <?php if ($flash !== ''): ?><div class="alert alert-info" role="status"><?= e($flash) ?></div><?php endif; ?>
        <?php if ($error !== ''): ?><div class="alert alert-danger"><?= e($error) ?></div>
        <?php elseif (!$notifications): ?><div class="jp-empty-state jp-member-empty"><i class="far fa-bell"></i><h3>Vous êtes à jour</h3><p>Les prochaines informations de vos formations apparaîtront ici.</p></div>
        <?php else: ?><div class="jp-notification-list">
            <?php foreach ($notifications as $notification): ?><article class="jp-notification-item<?= empty($notification['est_lue']) ? ' is-unread' : '' ?> reveal"><span class="jp-notification-icon"><i class="fas <?= empty($notification['est_lue']) ? 'fa-bell' : 'fa-check' ?>"></i></span><div><div class="jp-notification-meta"><span><?= e($notification['formation']) ?></span><time datetime="<?= e(date(DATE_ATOM, strtotime((string)$notification['date_envoi']))) ?>"><?= e(date('d/m/Y à H:i', strtotime((string)$notification['date_envoi']))) ?></time></div><h3><?= e($notification['titre']) ?></h3><p><?= nl2br(e($notification['message'])) ?></p></div></article><?php endforeach; ?>
        </div><?php endif; ?>
    </div></section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
