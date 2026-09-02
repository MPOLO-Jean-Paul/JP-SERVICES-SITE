<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
include __DIR__ . '/includes/header.php';
?>
<main id="main-content" class="jp-legal-page">
    <section class="jp-legal-hero"><div class="home-shell"><span class="home-eyebrow"><i class="fas fa-user-shield"></i> Protection des données</span><h2>Politique de confidentialité</h2><p>Nous expliquons quelles informations sont utilisées et les mesures prévues pour les protéger.</p></div></section>
    <section class="home-section"><div class="home-shell"><article class="jp-legal-document">
        <p class="jp-legal-updated">Dernière mise à jour : août 2026</p>
        <section><span>01</span><div><h3>Données collectées</h3><p>JP-Services traite les informations nécessaires à la création des comptes, aux inscriptions, aux projets, aux échanges communautaires et aux demandes d’assistance. Certaines données techniques limitées, comme l’adresse IP et le navigateur, peuvent contribuer à la sécurité du service.</p></div></section>
        <section><span>02</span><div><h3>Finalités d’utilisation</h3><p>Ces données servent à fournir les fonctionnalités demandées, sécuriser les accès, répondre aux messages, organiser les formations et améliorer le fonctionnement du site. Elles ne sont pas vendues à des tiers.</p></div></section>
        <section><span>03</span><div><h3>Sécurité</h3><p>Les mots de passe sont hachés, les formulaires sensibles sont protégés contre les requêtes non autorisées, les tentatives abusives sont limitées et les sessions authentifiées ne sont pas mises en cache.</p></div></section>
        <section><span>04</span><div><h3>Conservation</h3><p>Les informations sont conservées pendant la durée utile aux services concernés, puis supprimées ou rendues anonymes lorsqu’elles ne sont plus nécessaires, sous réserve des obligations applicables.</p></div></section>
        <section><span>05</span><div><h3>Vos demandes</h3><p>Vous pouvez demander la correction de votre profil depuis votre espace personnel. Pour une question relative à vos données ou à votre compte, contactez l’équipe via le <a href="<?= e(url('/aide')) ?>">centre d’aide</a>.</p></div></section>
        <aside class="jp-legal-note"><i class="fas fa-shield-halved"></i><p>JP-Services ne vous demandera jamais votre mot de passe ou un code de validation par e-mail, téléphone ou messagerie.</p></aside>
    </article></div></section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
