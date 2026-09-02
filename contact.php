<?php

declare(strict_types=1);
require_once __DIR__ . '/includes/connexion_db.php';

$message = '';
$messageType = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nom = trim((string)($_POST['nom'] ?? ''));
    $email = trim((string)($_POST['email'] ?? ''));
    $sujet = trim((string)($_POST['sujet'] ?? ''));
    $contenu = trim((string)($_POST['message'] ?? ''));

    if ($nom === '' || $email === '' || $sujet === '' || $contenu === '') {
        $message = 'Tous les champs sont obligatoires.';
        $messageType = 'danger';
    } elseif (mb_strlen($nom, 'UTF-8') > 120 || mb_strlen($sujet, 'UTF-8') > 180) {
        $message = 'Le nom ou le sujet dépasse la longueur autorisée.';
        $messageType = 'danger';
    } elseif (mb_strlen($contenu, 'UTF-8') < 20 || mb_strlen($contenu, 'UTF-8') > 10000) {
        $message = 'Le message doit contenir entre 20 et 10 000 caractères.';
        $messageType = 'danger';
    } elseif (mb_strlen($email, 'UTF-8') > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'L’adresse e-mail n’est pas valide.';
        $messageType = 'danger';
    } elseif (!jp_rate_limit('contact:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 6, 3600)) {
        $message = 'Trop de messages ont été envoyés. Réessayez plus tard.';
        $messageType = 'danger';
    } else {
        try {
            $stmt = $conn->prepare('INSERT INTO messages (nom, email, sujet, message) VALUES (:nom, :email, :sujet, :message)');
            $stmt->execute(['nom'=>$nom,'email'=>$email,'sujet'=>$sujet,'message'=>$contenu]);
            $message = 'Votre message a bien été transmis. Notre équipe vous répondra rapidement.';
            $messageType = 'success';
            $_POST = [];
        } catch (Throwable $exception) {
            error_log($exception->getMessage());
            $message = 'Votre message n’a pas pu être enregistré. Veuillez réessayer.';
            $messageType = 'danger';
        }
    }
}
include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-contact-page">
<section class="home-section jp-contact-hero" style="background:linear-gradient(135deg,#fff7f9,#f3f1ff)"><div class="home-shell jp-contact-hero-inner text-center"><span class="home-eyebrow"><i class="fas fa-envelope"></i> Parlons de votre projet</span><h2 class="display-5 fw-bold mt-3">Contactez JP-Services</h2><p class="lead text-muted mx-auto" style="max-width:720px">Une question, une proposition ou un besoin d’accompagnement ? Présentez-nous votre objectif.</p><div class="jp-hero-illustration reveal" aria-hidden="true"><img src="<?= e(url('/images/hero-contact.jpg')) ?>" alt=""></div></div></section>
<section class="home-section"><div class="home-shell"><div class="row g-5 align-items-start jp-contact-layout">
<div class="col-lg-7"><div class="card p-4 p-md-5">
<?php if ($message !== ''): ?><div class="alert alert-<?= e($messageType) ?>"><?= e($message) ?></div><?php endif; ?>
<form class="jp-contact-form" action="<?= e(url('/contact')) ?>" method="post"><div class="row g-3"><div class="col-md-6"><label class="form-label" for="nom">Nom complet</label><input class="form-control" id="nom" name="nom" maxlength="120" autocomplete="name" required value="<?= e($_POST['nom'] ?? '') ?>"></div><div class="col-md-6"><label class="form-label" for="email">Adresse e-mail</label><input class="form-control" id="email" type="email" name="email" maxlength="254" autocomplete="email" required value="<?= e($_POST['email'] ?? '') ?>"></div><div class="col-12"><label class="form-label" for="sujet">Sujet</label><input class="form-control" id="sujet" name="sujet" maxlength="180" required value="<?= e($_POST['sujet'] ?? '') ?>"></div><div class="col-12"><label class="form-label" for="message">Message</label><textarea class="form-control" id="message" name="message" rows="7" minlength="20" maxlength="10000" required><?= e($_POST['message'] ?? '') ?></textarea></div></div><div class="text-end mt-4"><button class="jp-btn jp-btn-primary" type="submit">Envoyer le message <i class="fas fa-arrow-right"></i></button></div></form>
</div></div>
<div class="col-lg-5"><div class="card p-4"><h3 class="h4">Coordonnées</h3><p class="text-muted">Notre équipe est basée à Lubumbashi et intervient sur des projets de formation et de transformation digitale.</p><div class="d-grid gap-3"><a href="tel:+243977152825"><i class="fas fa-phone me-2 text-primary"></i>+243 977 152 825</a><a href="mailto:contact@jp-services.com"><i class="fas fa-envelope me-2 text-primary"></i>contact@jp-services.com</a><a href="https://wa.me/243860951131" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp me-2 text-primary"></i>WhatsApp</a><span><i class="fas fa-location-dot me-2 text-primary"></i>Lubumbashi, RDC</span></div></div></div>
</div></div></section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
