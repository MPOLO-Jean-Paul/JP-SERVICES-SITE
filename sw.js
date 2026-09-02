/* JP-Services — service worker (PWA) */
(function () {
    'use strict';

    var VERSION = 'jps-pwa-v6';
    var scope = self.registration.scope;
    var CORE = [
        scope,
        scope + 'offline.html',
        scope + 'manifest.webmanifest',
        scope + 'css/app.css',
        scope + 'images/logo2.png',
        scope + 'images/pwa-192.png',
        scope + 'images/pwa-512.png'
    ];
    // Les parcours d'authentification ne doivent jamais être servis depuis le
    // cache ni basculer vers la page hors connexion.
    var AUTH_PATH = /\/(?:connexion|inscription|deconnexion|google_auth|mot_de_passe_oublie|reinitialiser[-_]?mdp|reinitialiser_mot_de_passe|verifier|attente_activation|renvoyer_activation|check_activation)(?:\.php|\/|$)|\/auth(?:\/|$)|\/mot-de-passe(?:[^/]*|\/.*)?$|\/activation(?:\/|$)/;

    self.addEventListener('install', function (event) {
        event.waitUntil(
            caches.open(VERSION)
                // Une image ou une ressource temporairement indisponible ne doit pas
                // empêcher l'installation de la nouvelle version du worker.
                .then(function (cache) {
                    return Promise.all(CORE.map(function (resource) {
                        return cache.add(resource).catch(function () { return undefined; });
                    }));
                })
                .then(function () { return self.skipWaiting(); })
        );
    });

    self.addEventListener('activate', function (event) {
        event.waitUntil(
            caches.keys().then(function (keys) {
                return Promise.all(keys.filter(function (key) { return key !== VERSION; }).map(function (key) { return caches.delete(key); }));
            }).then(function () { return self.clients.claim(); })
        );
    });

    self.addEventListener('fetch', function (event) {
        var request = event.request;
        if (request.method !== 'GET') return;
        var url = new URL(request.url);
        if (url.origin !== location.origin) return;
        if (AUTH_PATH.test(url.pathname)) return;
        if (url.pathname.indexOf('/admin') !== -1 || url.pathname.indexOf('/visio') !== -1 || url.pathname.indexOf('/telecharger') !== -1) return;

        if (request.mode === 'navigate') {
            event.respondWith(
                fetch(request).then(function (response) {
                    var copy = response.clone();
                    caches.open(VERSION).then(function (cache) { cache.put(request, copy); });
                    return response;
                }).catch(function () {
                    return caches.match(request).then(function (cached) { return cached || caches.match(scope + 'offline.html'); });
                })
            );
            return;
        }

        event.respondWith(
            caches.match(request).then(function (cached) {
                return cached || fetch(request).then(function (response) {
                    if (response.ok && /\/(?:css|js|images)\//.test(url.pathname)) {
                        var copy = response.clone();
                        caches.open(VERSION).then(function (cache) { cache.put(request, copy); });
                    }
                    return response;
                });
            })
        );
    });
})();
