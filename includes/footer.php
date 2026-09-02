<footer class="footer-ultra jp-classroom-footer jp-drfone-footer jp-footer-v3">
    <div class="jp-footer-cta-band">
        <div class="jp-footer-cta-card reveal">
            <img src="<?= e(url('/images/logo2.png')) ?>" alt="" class="jp-footer-cta-logo">
            <h2>Apprendre. Créer. Progresser.</h2>
            <p>JP‑Services réunit formations, logiciels et communauté pour transformer vos ambitions numériques en résultats concrets.</p>
            <div class="jp-footer-cta-actions">
                <?php if (!empty($_SESSION['user_id'])): ?>
                    <a class="jp-footer-cta-btn" href="<?= e(url('/formations')) ?>">Explorer les formations <i class="fas fa-arrow-right"></i></a>
                <?php else: ?>
                    <a class="jp-footer-cta-btn" href="<?= e(url('/inscription')) ?>" data-testid="footer-cta-btn">Créer mon compte gratuitement <i class="fas fa-arrow-right"></i></a>
                <?php endif; ?>
                <a class="jp-footer-cta-ghost" href="<?= e(url('/contact')) ?>">Nous contacter</a>
            </div>
        </div>
    </div>
    <div class="jp-footer-main">
        <div class="jp-footer-brand-column">
            <a href="<?= e(url('/')) ?>" class="footer-brand" aria-label="JP‑Services — Accueil">
                <img src="<?= e(url('/images/logo2.png')) ?>" alt="">
                <span>JP‑SERVICES</span>
            </a>
            <p>Formation, accompagnement digital et communauté pour transformer les ambitions en compétences et en projets utiles.</p>
            <a class="jp-footer-contact-link" href="<?= e(url('/contact')) ?>">Nous contacter <i class="fas fa-arrow-right"></i></a>
            <button type="button" class="jp-footer-contact-link jp-footer-install" data-pwa-install hidden data-testid="pwa-install-footer-btn" style="border:0;background:none;padding:0;font:inherit;cursor:pointer"><i class="fas fa-arrow-down-to-bracket"></i> Installer l’application</button>
        </div>

        <nav class="jp-footer-navigation" aria-label="Navigation du pied de page">
            <div class="footer-col">
                <button class="footer-accordion" type="button" aria-expanded="true" aria-controls="footer-learning"><span>Pour apprendre</span><i class="fas fa-chevron-down" aria-hidden="true"></i></button>
                <ul id="footer-learning">
                    <li><a href="<?= e(url('/formations')) ?>">Toutes les formations</a></li>
                    <li><a href="<?= e(url('/formations-en-ligne')) ?>">Formations en ligne</a></li>
                    <li><a href="<?= e(url('/logiciels')) ?>">Logiciels à télécharger</a></li>
                    <li><a href="<?= e(url('/programme')) ?>">Créer mon programme</a></li>
                    <?php if (!empty($_SESSION['user_id'])): ?><li><a href="<?= e(url('/abonnements')) ?>">Mes formations</a></li><?php endif; ?>
                    <li><a href="<?= e(url('/forum')) ?>">Forum d’entraide</a></li>
                    <li><a href="<?= e(url('/aide')) ?>">Centre d’aide</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <button class="footer-accordion" type="button" aria-expanded="true" aria-controls="footer-services"><span>Services et communauté</span><i class="fas fa-chevron-down" aria-hidden="true"></i></button>
                <ul id="footer-services">
                    <li><a href="<?= e(url('/projets')) ?>">Projets digitaux</a></li>
                    <li><a href="<?= e(url('/actualites')) ?>">Actualités</a></li>
                    <li><a href="<?= e(url('/partenariat')) ?>">Partenariat</a></li>
                    <li><a href="<?= e(url('/contact')) ?>">Présenter un projet</a></li>
                    <li><a href="<?= e(url('/a-propos')) ?>">Notre mission</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <button class="footer-accordion" type="button" aria-expanded="true" aria-controls="footer-account"><span>Mon espace</span><i class="fas fa-chevron-down" aria-hidden="true"></i></button>
                <ul id="footer-account">
                    <?php if (!empty($_SESSION['user_id'])): ?>
                        <li><a href="<?= e(url('/profil')) ?>">Mon profil</a></li>
                        <li><a href="<?= e(url('/profil/modifier')) ?>">Paramètres du compte</a></li>
                        <li><a href="<?= e(url('/notifications')) ?>">Notifications</a></li>
                        <li><a href="<?= e(url('/mes-projets')) ?>">Mes projets</a></li>
                    <?php else: ?>
                        <li><a href="<?= e(url('/inscription')) ?>">Créer un compte</a></li>
                        <li><a href="<?= e(url('/connexion')) ?>">Se connecter</a></li>
                        <li><a href="<?= e(url('/mot-de-passe-oublie')) ?>">Compte inaccessible</a></li>
                    <?php endif; ?>
                    <li><a href="<?= e(url('/confidentialite')) ?>">Confidentialité</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <button class="footer-accordion" type="button" aria-expanded="true" aria-controls="footer-follow"><span>Suivez-nous</span><i class="fas fa-chevron-down" aria-hidden="true"></i></button>
                <div id="footer-follow">
                    <div class="footer-socials" aria-label="Réseaux sociaux">
                        <a href="https://www.facebook.com/groups/1236192878705291/permalink/1259571929700719/?app=fbl" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.linkedin.com/in/jp-services-b51940381?trk=contact-info" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                        <a href="https://www.youtube.com/@jp-services-v8d" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                        <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>
                    </div>
                    <p class="jp-footer-follow-note">Actualités, coulisses des formations et réussites de la communauté.</p>
                </div>
            </div>
        </nav>
    </div>

    <section class="jp-footer-newsletter" id="newsletter" data-newsletter aria-labelledby="newsletter-title">
        <?php require_once JP_ROOT . '/app/newsletter_helpers.php'; ?>
        <div>
            <span>Rester informé</span>
            <h2 id="newsletter-title">Recevez les nouvelles formations et opportunités.</h2>
        </div>
        <div>
            <?php $newsletterFlashOpen = false; if (!empty($_SESSION['newsletter_flash'])): $newsletterFlash = $_SESSION['newsletter_flash']; unset($_SESSION['newsletter_flash']); $newsletterFlashOpen = true; ?><div class="alert alert-<?= e($newsletterFlash['type'] ?? 'info') ?>" role="status" style="margin-bottom:10px;max-width:480px"><?= e($newsletterFlash['message'] ?? '') ?><?php if (!empty($newsletterFlash['link'])): ?> <a href="<?= e($newsletterFlash['link']) ?>" style="color:inherit;font-weight:800;text-decoration:underline" data-testid="footer-newsletter-prefs-link"><?= e($newsletterFlash['link_label'] ?? 'Gérer mes préférences') ?></a><?php endif; ?></div><?php endif; ?>
            <button type="button" class="jp-footer-newsletter-open" data-newsletter-open data-testid="footer-newsletter-open-btn" aria-expanded="false" aria-controls="footer-newsletter-form">
                <i class="fas fa-envelope-open-text" aria-hidden="true"></i> S’abonner à la newsletter
            </button>
            <div class="jp-newsletter-themes" role="group" aria-label="Thèmes de la newsletter" data-testid="footer-newsletter-themes">
                <?php foreach (jp_newsletter_themes() as $themeKey => $themeLabel): ?>
                <label class="jp-newsletter-chip">
                    <input type="checkbox" name="themes[]" value="<?= e($themeKey) ?>" form="footer-newsletter-form" checked data-testid="footer-newsletter-theme-<?= e($themeKey) ?>">
                    <span><?= e($themeLabel) ?></span>
                </label>
                <?php endforeach; ?>
            </div>
            <form id="footer-newsletter-form" action="<?= e(app_route('/newsletter')) ?>" method="post" data-testid="footer-newsletter-form">
                <?= csrf_field() ?>
                <label class="visually-hidden" for="footer-email">Votre adresse e-mail</label>
                <input id="footer-email" type="email" name="email" maxlength="254" autocomplete="email" placeholder="Votre adresse e-mail" required data-testid="footer-newsletter-email">
                <button type="submit" data-testid="footer-newsletter-submit">S’abonner <i class="fas fa-arrow-right"></i></button>
            </form>
            <small>Un message utile, sans surcharge. Choisissez vos thèmes — désinscription possible à tout moment.</small>
        </div>
    </section>
    <script>
    (function(){
        var section = document.querySelector('[data-newsletter]');
        if (!section) return;
        var opener = section.querySelector('[data-newsletter-open]');
        var form = section.querySelector('form');
        if (!opener || !form) return;
        <?php if ($newsletterFlashOpen): ?>section.setAttribute('data-open','true');opener.setAttribute('aria-expanded','true');<?php endif; ?>
        opener.addEventListener('click', function(){
            section.setAttribute('data-open','true');
            opener.setAttribute('aria-expanded','true');
            var cookieBanner = document.querySelector('[data-cookie-banner]');
            if (cookieBanner) { cookieBanner.classList.add('is-dodged'); }
            var input = form.querySelector('input[type="email"]');
            if (input) { setTimeout(function(){ input.focus(); }, 220); }
        });
        document.addEventListener('click', function(evt){
            if (section.getAttribute('data-open') !== 'true') return;
            if (section.contains(evt.target)) return;
            var input = form.querySelector('input[type="email"]');
            if (input && input.value.trim() !== '') return;
            section.removeAttribute('data-open');
            opener.setAttribute('aria-expanded','false');
        });
    })();
    </script>

    <div class="footer-bottom-bar">
        <div class="footer-bottom-inner">
            <span>&copy; <?= date('Y') ?> JP‑SERVICES. Tous droits réservés.</span>
            <div class="footer-legal-links">
                <a href="<?= e(url('/conditions')) ?>">Conditions d’utilisation</a>
                <a href="<?= e(url('/confidentialite')) ?>">Protection des données</a>
                <a href="<?= e(url('/cookies')) ?>">Politique de cookies</a>
                <button type="button" data-cookies-open data-testid="footer-cookies-btn" style="border:0;background:none;padding:0;font:inherit;color:inherit;cursor:pointer;text-decoration:inherit">Gérer les cookies</button>
                <a href="<?= e(url('/aide')) ?>">Accessibilité et aide</a>
                <a href="<?= e(url('/contact')) ?>">Contact</a>
            </div>
            <div class="jp-footer-bottom-language" aria-label="Langue du site">
                <i class="fas fa-globe" aria-hidden="true"></i>
                <form class="jp-footer-language-select" action="<?= e(url('/langue')) ?>" method="post">
                    <label class="visually-hidden" for="footer-locale">Langue du site</label>
                    <input type="hidden" name="return_to" value="<?= e((string)($_SERVER['REQUEST_URI'] ?? url('/'))) ?>">
                    <select id="footer-locale" name="locale" data-footer-locale>
                        <?php foreach (jp_supported_locales() as $localeCode => $localeData): ?>
                        <option value="<?= e($localeCode) ?>"<?= jp_locale() === $localeCode ? ' selected' : '' ?>><?= e($localeData['label']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </form>
            </div>
        </div>
    </div>
    <button id="backToTop" type="button" aria-label="Retour en haut"><i class="fas fa-arrow-up"></i></button>
</footer>
</body>
</html>
