/* JP-Services — bandeau et préférences cookies */
(function () {
    'use strict';

    var STORAGE_KEY = 'jp-consent';
    var COOKIE_NAME = 'jp_consent';
    var banner = document.querySelector('[data-cookie-banner]');
    var modal = document.querySelector('[data-cookie-modal]');
    var uiEn = document.documentElement.lang === 'en';

    var readConsent = function () {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    };

    var writeConsent = function (consent) {
        consent.date = new Date().toISOString();
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); } catch (_) {}
        var expires = new Date(Date.now() + 15552000000).toUTCString(); /* 6 mois */
        document.cookie = COOKIE_NAME + '=' + encodeURIComponent(consent.analytics ? 'all' : 'essential') + '; expires=' + expires + '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
        window.jpConsent = consent;
    };

    var hideBanner = function () {
        if (!banner) return;
        banner.classList.remove('is-visible');
        window.setTimeout(function () { banner.hidden = true; }, 350);
    };

    var showBanner = function () {
        if (!banner) return;
        banner.hidden = false;
        requestAnimationFrame(function () { banner.classList.add('is-visible'); });
    };

    var openModal = function () {
        if (!modal) return;
        var consent = readConsent();
        var analyticsToggle = modal.querySelector('[data-cookie-analytics]');
        if (analyticsToggle && consent) analyticsToggle.checked = Boolean(consent.analytics);
        modal.classList.add('is-visible');
        modal.setAttribute('aria-hidden', 'false');
    };

    var closeModal = function () {
        if (!modal) return;
        modal.classList.remove('is-visible');
        modal.setAttribute('aria-hidden', 'true');
    };

    document.querySelectorAll('[data-cookie-accept]').forEach(function (button) {
        button.addEventListener('click', function () { writeConsent({ necessary: true, analytics: true }); hideBanner(); closeModal(); });
    });
    document.querySelectorAll('[data-cookie-refuse]').forEach(function (button) {
        button.addEventListener('click', function () { writeConsent({ necessary: true, analytics: false }); hideBanner(); closeModal(); });
    });
    document.querySelectorAll('[data-cookie-customize]').forEach(function (button) {
        button.addEventListener('click', openModal);
    });
    document.querySelectorAll('[data-cookies-open]').forEach(function (button) {
        button.addEventListener('click', openModal);
    });
    document.querySelectorAll('[data-cookie-close]').forEach(function (button) {
        button.addEventListener('click', closeModal);
    });
    if (modal) {
        modal.addEventListener('click', function (event) { if (event.target === modal) closeModal(); });
        var saveButton = modal.querySelector('[data-cookie-save]');
        if (saveButton) {
            saveButton.addEventListener('click', function () {
                var analyticsToggle = modal.querySelector('[data-cookie-analytics]');
                writeConsent({ necessary: true, analytics: analyticsToggle ? analyticsToggle.checked : false });
                hideBanner();
                closeModal();
            });
        }
    }

    window.jpConsent = readConsent();
    if (!window.jpConsent) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { window.setTimeout(showBanner, 1200); });
        } else {
            window.setTimeout(showBanner, 1200);
        }
    }
})();
