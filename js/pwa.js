/* JP-Services — installation PWA et service worker */
(function () {
    'use strict';

    var manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) return;

    var base = '';
    try {
        base = new URL(manifest.href).pathname.replace(/\/manifest\.webmanifest$/, '');
    } catch (_) {}

    if ('serviceWorker' in navigator && location.protocol === 'https:') {
        window.addEventListener('load', function () {
            // L'URL versionnée et updateViaCache empêchent un ancien worker de
            // conserver ses règles de navigation après une mise à jour.
            navigator.serviceWorker.register(base + '/sw.js?v=20260908', { updateViaCache: 'none' })
                .then(function (registration) { return registration.update(); })
                .catch(function () {});
        });
    }

    var installButtons = Array.from(document.querySelectorAll('[data-pwa-install]'));
    if (installButtons.length === 0) return;

    var deferredPrompt = null;
    var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

    var showButtons = function (show) {
        installButtons.forEach(function (button) { button.hidden = !show; });
    };

    if (isStandalone) {
        showButtons(false);
        return;
    }

    window.addEventListener('beforeinstallprompt', function (event) {
        event.preventDefault();
        deferredPrompt = event;
        showButtons(true);
    });

    window.addEventListener('appinstalled', function () {
        deferredPrompt = null;
        showButtons(false);
    });

    /* iOS ne déclenche pas beforeinstallprompt : on affiche le bouton avec des instructions. */
    if (isIos && !isStandalone) {
        showButtons(true);
    }

    installButtons.forEach(function (button) {
        button.addEventListener('click', async function () {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                try { await deferredPrompt.userChoice; } catch (_) {}
                deferredPrompt = null;
                showButtons(false);
                return;
            }
            var modal = document.querySelector('[data-pwa-ios-modal]');
            if (modal) {
                modal.classList.add('is-visible');
                modal.setAttribute('aria-hidden', 'false');
            }
        });
    });

    document.querySelectorAll('[data-pwa-ios-close]').forEach(function (button) {
        button.addEventListener('click', function () {
            var modal = button.closest('[data-pwa-ios-modal]');
            if (modal) {
                modal.classList.remove('is-visible');
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    });
})();
