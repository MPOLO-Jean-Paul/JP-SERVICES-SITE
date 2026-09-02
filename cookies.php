<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';

include __DIR__ . '/includes/header.php';
?>

<main id="main-content">
    <section class="jp-section jp-cookies-page">
        <div class="home-shell jp-cookies-layout">
            <div class="jp-cookies-content">
                <span class="home-eyebrow"><i class="fas fa-cookie-bite"></i> Vie privée</span>
                <h2 data-testid="cookies-title">Politique de gestion des cookies.</h2>
                <p>Cette page explique quels traceurs sont utilisés sur JP-Services, pourquoi, et comment garder le contrôle sur vos choix.</p>

                <section class="jp-cookies-block reveal">
                    <h3><span>01</span> Qu’est-ce qu’un cookie ?</h3>
                    <p>Un cookie est un petit fichier enregistré sur votre appareil lors de la visite d’un site. Il permet par exemple de maintenir votre connexion, de mémoriser votre langue ou votre thème d’affichage.</p>
                </section>

                <section class="jp-cookies-block reveal">
                    <h3><span>02</span> Les cookies que nous utilisons</h3>
                    <div class="jp-cookies-table" role="region" aria-label="Liste des cookies" tabindex="0">
                        <table>
                            <thead><tr><th>Nom</th><th>Finalité</th><th>Durée</th><th>Type</th></tr></thead>
                            <tbody>
                                <tr><td><code>jp_session</code></td><td>Maintient votre session de connexion et la sécurité de votre compte.</td><td>Session</td><td>Essentiel</td></tr>
                                <tr><td><code>jp_locale</code></td><td>Mémorise la langue d’affichage choisie.</td><td>6 mois</td><td>Essentiel</td></tr>
                                <tr><td><code>jp_consent</code></td><td>Conserve votre choix concernant les cookies facultatifs.</td><td>6 mois</td><td>Essentiel</td></tr>
                                <tr><td><code>jp-theme</code> (stockage local)</td><td>Retient votre préférence de thème clair, sombre ou système.</td><td>Persistant</td><td>Essentiel</td></tr>
                                <tr><td>Mesure d’audience</td><td>Statistiques anonymes de fréquentation pour améliorer les contenus. Déposée uniquement avec votre accord.</td><td>13 mois max</td><td>Facultatif</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="jp-cookies-block reveal">
                    <h3><span>03</span> Gérer vos préférences</h3>
                    <p>Vous pouvez accepter, refuser ou modifier à tout moment les cookies facultatifs. Votre choix est conservé six mois, puis il vous sera redemandé.</p>
                    <button type="button" class="jp-btn jp-btn-primary" data-cookies-open data-testid="cookies-preferences-btn"><i class="fas fa-sliders"></i> Modifier mes préférences</button>
                </section>

                <section class="jp-cookies-block reveal">
                    <h3><span>04</span> Vos autres droits</h3>
                    <p>Pour toute question sur vos données personnelles, consultez la <a href="<?= e(url('/confidentialite')) ?>">politique de confidentialité</a> ou écrivez-nous depuis la <a href="<?= e(url('/contact')) ?>">page contact</a>.</p>
                </section>
            </div>

            <aside class="jp-cookies-aside reveal" aria-label="Résumé">
                <div class="jp-visio-card">
                    <h3><i class="fas fa-shield-halved"></i> En résumé</h3>
                    <ul>
                        <li>Aucun cookie publicitaire n’est utilisé.</li>
                        <li>Les cookies essentiels ne peuvent pas être désactivés : ils font fonctionner le site.</li>
                        <li>La mesure d’audience n’est activée qu’avec votre consentement.</li>
                    </ul>
                    <button type="button" class="jp-btn jp-btn-secondary" data-cookies-open><i class="fas fa-cookie"></i> Gérer les cookies</button>
                </div>
            </aside>
        </div>
    </section>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
