<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-legal-page">
    <section class="jp-legal-hero"><div class="home-shell"><span class="home-eyebrow"><i class="fas fa-file-contract"></i> Informations légales</span><h2>Conditions d’utilisation</h2><p>Un cadre simple pour utiliser les services et espaces JP-Services de manière responsable.</p></div></section>
    <section class="home-section"><div class="home-shell"><article class="jp-legal-document">
        <p class="jp-legal-updated">Version mise à jour en août 2026</p>
        <section><span>01</span><div><h3>Acceptation des conditions</h3><p>En utilisant les services de JP-Services, vous acceptez les présentes conditions. Si vous n’êtes pas en mesure de les accepter, vous devez cesser d’utiliser les espaces concernés.</p></div></section>
        <section><span>02</span><div><h3>Utilisation des services</h3><p>Les plateformes, formations et outils doivent être utilisés de manière légale, respectueuse et conforme à leur finalité. Toute tentative d’accès non autorisé, d’altération ou de perturbation est interdite.</p></div></section>
        <section><span>03</span><div><h3>Comptes utilisateurs</h3><p>Vous êtes responsable de la confidentialité de vos identifiants et de l’exactitude des informations transmises. Signalez rapidement toute activité inhabituelle via le centre d’aide.</p></div></section>
        <section><span>04</span><div><h3>Contenus et communauté</h3><p>Les contributions publiées sur le forum doivent rester courtoises, utiles et licites. JP-Services peut retirer un contenu manifestement abusif, trompeur ou portant atteinte aux droits d’autrui.</p></div></section>
        <section><span>05</span><div><h3>Propriété intellectuelle</h3><p>Les logiciels, identités visuelles, supports et contenus produits par JP-Services restent protégés. Leur consultation ne constitue pas un transfert de droits de propriété.</p></div></section>
        <section><span>06</span><div><h3>Assistance</h3><p>Pour toute question concernant ces conditions, utilisez le <a href="<?= e(url('/aide')) ?>">centre d’aide</a> ou la <a href="<?= e(url('/contact')) ?>">page de contact</a>.</p></div></section>
    </article></div></section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
