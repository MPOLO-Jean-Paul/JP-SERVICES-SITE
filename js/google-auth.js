/* global google */
(function () {
    'use strict';

    var controls = Array.prototype.slice.call(document.querySelectorAll('.jp-google-signin'));
    if (!controls.length) {
        return;
    }

    var submitting = false;
    var initialized = false;
    var gsiInitialized = false;

    function setStatus(message) {
        controls.forEach(function (control) {
            var container = control.closest('.jp-social-auth');
            var status = container ? container.querySelector('[data-google-auth-status]') : null;
            if (status) {
                status.textContent = message || '';
                status.hidden = !message;
            }
        });
    }

    function submitCredential(response) {
        var source = controls[0];
        var credential = response && typeof response.credential === 'string' ? response.credential : '';
        if (submitting || credential === '') {
            setStatus('Google n’a pas renvoyé de preuve de connexion. Veuillez réessayer.');
            return;
        }

        var endpoint = source.getAttribute('data-google-endpoint') || '/auth/google';
        var csrf = source.getAttribute('data-google-csrf') || '';
        if (csrf === '') {
            setStatus('La session de sécurité a expiré. Rechargez la page puis recommencez.');
            return;
        }

        submitting = true;
        setStatus('Vérification de votre identité Google…');
        var form = document.createElement('form');
        form.method = 'post';
        form.action = endpoint;
        form.style.display = 'none';

        [
            ['credential', credential],
            ['google_callback', '1'],
            ['_csrf', csrf]
        ].forEach(function (entry) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = entry[0];
            input.value = entry[1];
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    }

    function renderButtons() {
        if (initialized || !window.google || !google.accounts || !google.accounts.id) {
            return false;
        }

        var first = controls[0];
        var clientId = first.getAttribute('data-google-client-id') || '';
        if (!/^[0-9]+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId)) {
            setStatus('La connexion Google n’est pas disponible pour le moment.');
            return true;
        }

        try {
            if (!gsiInitialized) {
                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: submitCredential,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    context: first.getAttribute('data-google-context') || 'signin'
                });
                gsiInitialized = true;
            }

            var renderedButtons = controls.map(function (control) {
                var staging = document.createElement('div');
                var width = Math.max(220, Math.min(320, Math.floor(control.getBoundingClientRect().width || 320)));
                google.accounts.id.renderButton(staging, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    shape: 'pill',
                    text: control.getAttribute('data-google-context') === 'signup' ? 'signup_with' : 'signin_with',
                    locale: 'fr',
                    logo_alignment: 'left',
                    width: width
                });
                if (!staging.childNodes.length) {
                    throw new Error('Google button did not render');
                }
                return { control: control, nodes: Array.prototype.slice.call(staging.childNodes) };
            });
            renderedButtons.forEach(function (rendered) {
                rendered.control.replaceChildren.apply(rendered.control, rendered.nodes);
            });
            initialized = true;
            setStatus('');
            return true;
        } catch (error) {
            setStatus('Le bouton Google ne s’est pas chargé. Vérifiez l’origine autorisée dans Google Cloud Console, puis rechargez la page.');
            return false;
        }
    }

    var attempts = 0;
    function waitForGoogle() {
        if (renderButtons()) {
            return;
        }
        attempts += 1;
        if (attempts >= 80) {
            setStatus('Le bouton Google ne s’est pas chargé. Vérifiez l’origine autorisée dans Google Cloud Console, puis rechargez la page.');
            return;
        }
        window.setTimeout(waitForGoogle, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForGoogle, { once: true });
    } else {
        waitForGoogle();
    }

    controls.forEach(function (control) {
        var fallback = control.querySelector('[data-google-fallback]');
        if (!fallback) {
            return;
        }
        fallback.addEventListener('click', function () {
            if (initialized) {
                return;
            }
            attempts = 0;
            setStatus('Chargement du service Google…');
            waitForGoogle();
        });
    });
}());
