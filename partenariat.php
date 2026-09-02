<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';

$partnershipTypes = [
    ['slug' => 'education', 'icon' => 'fa-graduation-cap', 'label' => 'Formation et éducation', 'text' => 'Co-construire des parcours de formation, ateliers ou programmes de mentorat.'],
    ['slug' => 'technologie', 'icon' => 'fa-microchip', 'label' => 'Technologie', 'text' => 'Mettre à disposition des outils, licences, infrastructures ou expertise technique.'],
    ['slug' => 'sponsoring', 'icon' => 'fa-hand-holding-heart', 'label' => 'Sponsoring et mécénat', 'text' => 'Soutenir financièrement ou matériellement les apprenants et les projets.'],
    ['slug' => 'communautaire', 'icon' => 'fa-people-group', 'label' => 'Communautaire', 'text' => 'Relayer les initiatives, co-organiser des événements et élargir la communauté.'],
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $organisation = trim((string)($_POST['organisation'] ?? ''));
    $contactNom = trim((string)($_POST['contact_nom'] ?? ''));
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    $telephone = trim((string)($_POST['telephone'] ?? ''));
    $type = trim((string)($_POST['type_partenariat'] ?? ''));
    $messageText = trim((string)($_POST['message'] ?? ''));
    $website = trim((string)($_POST['site_web_honeypot'] ?? ''));

    $validTypes = array_column($partnershipTypes, 'label');
    $ip = substr((string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 0, 45);

    if ($website !== '') {
        $_SESSION['partenariat_flash'] = ['type' => 'success', 'message' => 'Votre demande a bien été envoyée.'];
        redirect('/partenariat#demande');
    }
    if (!jp_rate_limit('partenariat:' . $ip, 5, 600)) {
        $_SESSION['partenariat_flash'] = ['type' => 'warning', 'message' => 'Vous avez envoyé plusieurs demandes récemment. Patientez quelques minutes.'];
        redirect('/partenariat#demande');
    }
    if (mb_strlen($organisation, 'UTF-8') < 2 || mb_strlen($organisation, 'UTF-8') > 180
        || mb_strlen($contactNom, 'UTF-8') < 2 || mb_strlen($contactNom, 'UTF-8') > 160
        || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email, 'UTF-8') > 190
        || mb_strlen($telephone, 'UTF-8') > 40
        || !in_array($type, $validTypes, true)
        || mb_strlen($messageText, 'UTF-8') < 20 || mb_strlen($messageText, 'UTF-8') > 5000) {
        $_SESSION['partenariat_flash'] = ['type' => 'danger', 'message' => 'Vérifiez les champs du formulaire : le message doit contenir au moins 20 caractères.'];
        redirect('/partenariat#demande');
    }

    try {
        $stmt = $conn->prepare('INSERT INTO partenariat_demandes (organisation, contact_nom, email, telephone, type_partenariat, message) VALUES (:org, :contact, :email, :tel, :type, :message)');
        $stmt->execute([
            ':org' => $organisation,
            ':contact' => $contactNom,
            ':email' => $email,
            ':tel' => $telephone,
            ':type' => $type,
            ':message' => $messageText,
        ]);
        $_SESSION['partenariat_flash'] = ['type' => 'success', 'message' => 'Votre demande de partenariat a bien été envoyée. Notre équipe vous répondra sous quelques jours.'];
    } catch (Throwable $exception) {
        error_log('Demande partenariat: ' . $exception->getMessage());
        $_SESSION['partenariat_flash'] = ['type' => 'danger', 'message' => 'Votre demande n’a pas pu être enregistrée. Réessayez plus tard ou écrivez-nous via la page contact.'];
    }
    redirect('/partenariat#demande');
}

try {
    $partenaires = $conn->query('SELECT * FROM partenaires WHERE actif = 1 ORDER BY ordre ASC, nom ASC')->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Partenaires: ' . $exception->getMessage());
    $partenaires = [];
}

$intro = jp_setting($conn, 'partenariat_intro', 'Construisons ensemble des opportunités de formation et de progrès numérique.');
$flash = $_SESSION['partenariat_flash'] ?? null;
unset($_SESSION['partenariat_flash']);

include __DIR__ . '/includes/header.php';
?>

<main id="main-content" class="jp-partner-page">
    <section class="jp-training-hero jp-partner-hero">
        <div class="home-shell jp-training-hero-grid">
            <div class="reveal">
                <span class="home-eyebrow"><i class="fas fa-handshake"></i> Partenariats JP-Services</span>
                <h2 data-testid="partenariat-title">Grandissons ensemble, autour de compétences utiles.</h2>
                <p data-testid="partenariat-intro"><?= e($intro) ?></p>
                <div class="jp-training-hero-actions">
                    <a class="jp-btn jp-btn-primary" href="#demande" data-testid="partenariat-cta-btn">Proposer un partenariat <i class="fas fa-arrow-down"></i></a>
                    <a class="jp-text-link" href="#partenaires">Découvrir nos partenaires <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
            <aside class="jp-training-overview reveal" aria-label="Le partenariat en bref">
                <div><strong><?= count($partenaires) ?></strong><span>partenaire<?= count($partenaires) > 1 ? 's' : '' ?> actif<?= count($partenaires) > 1 ? 's' : '' ?></span></div>
                <div><strong><?= count($partnershipTypes) ?></strong><span>formes de collaboration</span></div>
                <div><strong>72 h</strong><span>délai moyen de réponse</span></div>
            </aside>
        </div>
    </section>

    <section class="jp-section">
        <div class="home-shell">
            <div class="jp-section-heading reveal"><span class="home-eyebrow">Formes de collaboration</span><h2>Quatre manières de travailler avec JP-Services.</h2><p>Choisissez le cadre qui correspond à votre structure ; chaque partenariat est ensuite personnalisé.</p></div>
            <div class="jp-training-steps jp-partner-types">
                <?php foreach ($partnershipTypes as $index => $type): ?>
                <article class="reveal"><span><?= str_pad((string)($index + 1), 2, '0', STR_PAD_LEFT) ?></span><i class="fas <?= e($type['icon']) ?>"></i><h3><?= e($type['label']) ?></h3><p><?= e($type['text']) ?></p></article>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <section class="jp-section jp-partner-list-section" id="partenaires">
        <div class="home-shell">
            <div class="jp-section-heading reveal"><span class="home-eyebrow">Ils nous accompagnent</span><h2>Nos partenaires.</h2><p>Des organisations qui soutiennent la formation, les projets et la communauté JP-Services.</p></div>
            <?php if ($partenaires !== []): ?>
            <div class="jp-partner-grid" data-testid="partenaires-grid">
                <?php foreach ($partenaires as $partenaire): ?>
                <article class="jp-partner-card reveal" data-testid="partenaire-card-<?= (int)$partenaire['id'] ?>">
                    <div class="jp-partner-logo">
                        <?php if (!empty($partenaire['logo'])): ?>
                            <img src="<?= e(url('/' . ltrim((string)$partenaire['logo'], '/'))) ?>" alt="Logo de <?= e($partenaire['nom']) ?>" loading="lazy" decoding="async">
                        <?php else: ?>
                            <span><?= e(mb_strtoupper(mb_substr((string)$partenaire['nom'], 0, 1, 'UTF-8'), 'UTF-8')) ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="jp-partner-body">
                        <?php if (!empty($partenaire['type_partenariat'])): ?><span class="jp-partner-type"><?= e($partenaire['type_partenariat']) ?></span><?php endif; ?>
                        <h3 data-no-translate><?= e($partenaire['nom']) ?></h3>
                        <?php if (!empty($partenaire['description'])): ?><p data-no-translate><?= e($partenaire['description']) ?></p><?php endif; ?>
                        <?php if (!empty($partenaire['site_web']) && filter_var($partenaire['site_web'], FILTER_VALIDATE_URL)): ?>
                            <a class="jp-card-link" href="<?= e($partenaire['site_web']) ?>" target="_blank" rel="noopener noreferrer">Visiter le site <i class="fas fa-arrow-up-right-from-square"></i></a>
                        <?php endif; ?>
                    </div>
                </article>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <div class="jp-training-empty is-static reveal" data-testid="partenaires-empty">
                <span><i class="fas fa-handshake"></i></span>
                <h3>Les premiers partenaires seront bientôt présentés</h3>
                <p>Votre organisation souhaite apparaître ici ? Envoyez-nous une demande ci-dessous.</p>
                <a class="jp-btn jp-btn-primary" href="#demande">Proposer un partenariat</a>
            </div>
            <?php endif; ?>
        </div>
    </section>

    <section class="jp-section jp-partner-process">
        <div class="home-shell">
            <div class="jp-section-heading reveal"><span class="home-eyebrow">Comment ça se passe</span><h2>Un partenariat en trois étapes.</h2></div>
            <ol class="jp-course-method jp-partner-steps">
                <li class="reveal"><span>1</span><div><h3>Vous proposez</h3><p>Remplissez le formulaire ci-dessous avec votre organisation et votre idée de collaboration.</p></div></li>
                <li class="reveal"><span>2</span><div><h3>Nous échangeons</h3><p>Notre équipe étudie la demande et vous recontacte pour cadrer ensemble les objectifs.</p></div></li>
                <li class="reveal"><span>3</span><div><h3>Nous lançons</h3><p>Le partenariat est formalisé, suivi dans le temps et présenté sur cette page.</p></div></li>
            </ol>
        </div>
    </section>

    <section class="jp-section jp-partner-form-section" id="demande">
        <div class="home-shell jp-partner-form-grid">
            <div class="reveal">
                <span class="home-eyebrow">Proposer un partenariat</span>
                <h2>Parlez-nous de votre organisation.</h2>
                <p>Décrivez votre structure et la forme de collaboration envisagée. Votre demande est transmise directement à l’équipe JP-Services.</p>
                <ul class="jp-partner-form-points">
                    <li><i class="fas fa-check"></i> Réponse personnalisée sous quelques jours</li>
                    <li><i class="fas fa-check"></i> Échange sans engagement</li>
                    <li><i class="fas fa-check"></i> Vos données restent confidentielles</li>
                </ul>
            </div>
            <form class="jp-surface jp-partner-form reveal" method="post" action="<?= e(url('/partenariat')) ?>#demande" data-testid="partenariat-form">
                <?php if (is_array($flash)): ?>
                    <div class="alert alert-<?= e($flash['type'] ?? 'info') ?>" role="status" data-testid="partenariat-flash"><i class="fas fa-circle-info"></i> <?= e($flash['message'] ?? '') ?></div>
                <?php endif; ?>
                <div class="jp-form-row">
                    <label>Organisation ou structure
                        <input type="text" name="organisation" minlength="2" maxlength="180" required data-testid="partenariat-organisation-input">
                    </label>
                    <label>Nom du contact
                        <input type="text" name="contact_nom" minlength="2" maxlength="160" required data-testid="partenariat-contact-input">
                    </label>
                </div>
                <div class="jp-form-row">
                    <label>Adresse e-mail
                        <input type="email" name="email" maxlength="190" required data-testid="partenariat-email-input">
                    </label>
                    <label>Téléphone (facultatif)
                        <input type="tel" name="telephone" maxlength="40" data-testid="partenariat-telephone-input">
                    </label>
                </div>
                <label>Type de partenariat envisagé
                    <select name="type_partenariat" required data-testid="partenariat-type-select">
                        <option value="">Sélectionnez…</option>
                        <?php foreach ($partnershipTypes as $type): ?><option value="<?= e($type['label']) ?>"><?= e($type['label']) ?></option><?php endforeach; ?>
                    </select>
                </label>
                <label>Votre proposition
                    <textarea name="message" rows="5" minlength="20" maxlength="5000" required placeholder="Présentez votre organisation, vos objectifs et la collaboration imaginée…" data-testid="partenariat-message-input"></textarea>
                </label>
                <div class="visually-hidden" aria-hidden="true"><label>Ne pas remplir<input type="text" name="site_web_honeypot" tabindex="-1" autocomplete="off"></label></div>
                <button class="jp-btn jp-btn-primary" type="submit" data-testid="partenariat-submit-btn">Envoyer la demande <i class="fas fa-paper-plane"></i></button>
                <small>En envoyant ce formulaire, vous acceptez notre <a href="<?= e(url('/confidentialite')) ?>">politique de confidentialité</a>.</small>
            </form>
        </div>
    </section>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
