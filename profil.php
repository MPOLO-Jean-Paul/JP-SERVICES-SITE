<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';
require_login();

$statement = $conn->prepare('SELECT nom, prenom, email, role, photo_profil FROM users WHERE id = :id LIMIT 1');
$statement->execute(['id' => (int)$_SESSION['user_id']]);
$user = $statement->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    $_SESSION = [];
    session_regenerate_id(true);
    redirect('/connexion');
}

$photo = trim((string)($user['photo_profil'] ?? '')) ?: 'images/default-avatar.svg';
$roleLabel = (string)$user['role'] === 'admin' ? 'Administrateur' : 'Membre';
$displayName = trim((string)($user['prenom'] ?? '') . ' ' . (string)($user['nom'] ?? ''));
if ($displayName === '') {
    $displayName = 'Membre JP-Services';
}

include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-profile-page">
    <section class="jp-profile-hero">
        <div class="home-shell jp-profile-identity">
            <div class="jp-profile-avatar-wrap"><img src="<?= e(url('/' . ltrim($photo, '/'))) ?>" data-fallback-src="<?= e(url('/images/default-avatar.svg')) ?>" alt="Photo de profil de <?= e($displayName) ?>"></div>
            <div><span class="home-eyebrow"><i class="fas fa-user-shield"></i> Espace personnel</span><h2><?= e($displayName) ?></h2><p><?= e($roleLabel) ?> JP-Services</p></div>
            <a class="jp-btn jp-btn-primary" href="<?= e(url('/profil/modifier')) ?>"><i class="fas fa-pen"></i> Modifier mon profil</a>
        </div>
    </section>

    <section class="home-section">
        <div class="home-shell jp-profile-layout">
            <section class="jp-profile-card">
                <div class="jp-section-heading"><div><span>Informations</span><h3>Mon compte</h3></div></div>
                <dl class="jp-profile-details">
                    <div><dt><i class="fas fa-user"></i> Nom complet</dt><dd><?= e($displayName) ?></dd></div>
                    <div><dt><i class="fas fa-envelope"></i> Adresse e-mail</dt><dd><?= e($user['email']) ?></dd></div>
                    <div><dt><i class="fas fa-shield-halved"></i> Type de compte</dt><dd><?= e($roleLabel) ?></dd></div>
                </dl>
            </section>
            <aside class="jp-profile-card jp-profile-shortcuts">
                <span class="jp-thread-label">Raccourcis</span>
                <h3>Continuer votre parcours</h3>
                <a href="<?= e(url('/abonnements')) ?>"><span><i class="fas fa-book-open"></i> Mes formations</span><i class="fas fa-chevron-right"></i></a>
                <a href="<?= e(url('/mes-projets')) ?>"><span><i class="fas fa-diagram-project"></i> Mes projets</span><i class="fas fa-chevron-right"></i></a>
                <a href="<?= e(url('/forum')) ?>"><span><i class="fas fa-comments"></i> Forum</span><i class="fas fa-chevron-right"></i></a>
                <?php if ((string)$user['role'] === 'admin'): ?><a href="<?= e(url('/admin')) ?>"><span><i class="fas fa-gauge-high"></i> Administration</span><i class="fas fa-chevron-right"></i></a><?php endif; ?>
            </aside>
        </div>
    </section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
