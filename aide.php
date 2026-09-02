<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';

$message = '';
$messageType = '';
$name = trim((string)($_POST['nom_complet'] ?? ''));
$email = strtolower(trim((string)($_POST['email_contact'] ?? '')));
$subject = trim((string)($_POST['sujet'] ?? 'Connexion'));
$description = trim((string)($_POST['description_probleme'] ?? ''));
$subjects = [
    'Connexion' => 'Problème de connexion',
    'Bug' => 'Signaler un dysfonctionnement',
    'Securite' => 'Question sur la sécurité',
    'Formation' => 'Accès à une formation',
    'Autre' => 'Autre demande',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!array_key_exists($subject, $subjects)) {
        $subject = 'Autre';
    }

    if ($name === '' || $email === '' || $description === '') {
        $message = 'Veuillez remplir tous les champs obligatoires.';
        $messageType = 'danger';
    } elseif (mb_strlen($email, 'UTF-8') > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'L’adresse e-mail renseignée n’est pas valide.';
        $messageType = 'danger';
    } elseif (mb_strlen($name, 'UTF-8') > 120 || mb_strlen($description, 'UTF-8') < 20 || mb_strlen($description, 'UTF-8') > 8000) {
        $message = 'Vérifiez la longueur du nom et de la description (20 à 8 000 caractères).';
        $messageType = 'danger';
    } elseif (!jp_rate_limit('support:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 5, 3600)) {
        $message = 'Trop de demandes ont été envoyées. Réessayez dans une heure.';
        $messageType = 'danger';
    } else {
        try {
            $statement = $conn->prepare('INSERT INTO support_tickets (nom, email, sujet, message) VALUES (:nom, :email, :sujet, :message)');
            $statement->execute(['nom' => $name, 'email' => $email, 'sujet' => $subjects[$subject], 'message' => $description]);
            $message = 'Votre demande a bien été enregistrée. Notre équipe reviendra vers vous rapidement.';
            $messageType = 'success';
            $name = $email = $description = '';
            $subject = 'Connexion';
        } catch (Throwable $exception) {
            error_log('Demande support : ' . $exception->getMessage());
            $message = 'Votre demande n’a pas pu être enregistrée. Veuillez réessayer.';
            $messageType = 'danger';
        }
    }
}

include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-help-page">
    <section class="jp-help-hero">
        <div class="home-shell">
            <span class="home-eyebrow"><i class="fas fa-life-ring"></i> Centre d’aide</span>
            <h2>Une réponse claire, au bon moment.</h2>
            <p>Retrouvez les sujets essentiels ou transmettez une demande détaillée à notre équipe.</p>
            <div class="jp-hero-illustration reveal" aria-hidden="true"><img src="<?= e(url('/images/hero-aide.jpg')) ?>" alt=""></div>
        </div>
    </section>

    <section class="home-section">
        <div class="home-shell">
            <div class="jp-help-topics">
                <article><i class="fas fa-user-shield"></i><div><h3>Compte et sécurité</h3><p>Connexion, mot de passe, activation et protection de vos informations personnelles.</p></div></article>
                <article><i class="fas fa-graduation-cap"></i><div><h3>Formations</h3><p>Inscription, programme, horaires et accès aux contenus pédagogiques.</p></div></article>
                <article><i class="fas fa-diagram-project"></i><div><h3>Projets et communauté</h3><p>Soumission d’un projet, suivi de validation et participation au forum.</p></div></article>
            </div>

            <div class="jp-support-layout">
                <div class="jp-support-copy">
                    <span class="jp-thread-label">Assistance humaine</span>
                    <h3>Vous n’avez pas trouvé votre réponse&nbsp;?</h3>
                    <p>Décrivez précisément la situation, l’action effectuée et le résultat observé. Ne transmettez jamais votre mot de passe.</p>
                    <div class="jp-security-tip"><i class="fas fa-lock"></i><span><strong>Votre sécurité compte.</strong> L’équipe JP-Services ne vous demandera jamais votre mot de passe ni un code de validation.</span></div>
                </div>
                <section class="jp-support-form">
                    <?php if ($message !== ''): ?><div class="alert alert-<?= e($messageType) ?>" role="status"><?= e($message) ?></div><?php endif; ?>
                    <form action="<?= e(url('/aide')) ?>" method="post">
                        <?= csrf_field() ?>
                        <div class="row g-3">
                            <div class="col-md-6"><label class="form-label" for="support-name">Votre nom</label><input class="form-control" id="support-name" name="nom_complet" maxlength="120" autocomplete="name" value="<?= e($name) ?>" required></div>
                            <div class="col-md-6"><label class="form-label" for="support-email">Adresse e-mail</label><input class="form-control" id="support-email" type="email" name="email_contact" maxlength="254" autocomplete="email" value="<?= e($email) ?>" required></div>
                            <div class="col-12"><label class="form-label" for="support-subject">Sujet</label><select class="form-control" id="support-subject" name="sujet"><?php foreach ($subjects as $value => $label): ?><option value="<?= e($value) ?>"<?= $subject === $value ? ' selected' : '' ?>><?= e($label) ?></option><?php endforeach; ?></select></div>
                            <div class="col-12"><label class="form-label" for="support-description">Description du problème</label><textarea class="form-control" id="support-description" name="description_probleme" rows="7" minlength="20" maxlength="8000" placeholder="Expliquez ce qui s’est passé, sans inclure d’information confidentielle…" required><?= e($description) ?></textarea></div>
                        </div>
                        <button class="jp-btn jp-btn-primary" type="submit">Envoyer la demande <i class="fas fa-arrow-right"></i></button>
                    </form>
                </section>
            </div>
        </div>
    </section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
