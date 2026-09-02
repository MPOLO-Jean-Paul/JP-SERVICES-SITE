/* JP-Services — catalogue Logiciels : recherche, tri, filtres par catégorie */
(function () {
    'use strict';

    var catalog = document.querySelector('[data-soft-catalog]');
    if (!catalog) return;

    var search = catalog.querySelector('[data-soft-search]');
    var os = catalog.querySelector('[data-soft-os]');
    var sort = catalog.querySelector('[data-soft-sort]');
    var grid = catalog.querySelector('[data-soft-grid]');
    var count = catalog.querySelector('[data-soft-count]');
    var countLabel = catalog.querySelector('[data-soft-count-label]');
    var empty = catalog.querySelector('[data-soft-empty]');
    var categoryButtons = Array.from(catalog.querySelectorAll('[data-soft-category]'));
    var resetButtons = Array.from(catalog.querySelectorAll('[data-soft-reset]'));
    var items = Array.from(catalog.querySelectorAll('[data-soft-item]'));
    var category = 'all';

    var normalize = function (value) {
        return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    };

    var updateUrl = function () {
        if (!window.history || !window.history.replaceState) return;
        var params = new URLSearchParams();
        if (search && search.value.trim()) params.set('q', search.value.trim());
        if (category !== 'all') params.set('categorie', category);
        if (os && os.value !== 'all') params.set('plateforme', os.value);
        if (sort && sort.value !== 'recent') params.set('tri', sort.value);
        var query = params.toString();
        window.history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
    };

    var apply = function () {
        var query = normalize(search && search.value);
        var selectedOs = os ? os.value : 'all';
        var visible = 0;
        items.forEach(function (item) {
            var matches = (!query || normalize(item.dataset.search).indexOf(query) !== -1)
                && (category === 'all' || item.dataset.category === category)
                && (selectedOs === 'all' || item.dataset.os === selectedOs);
            item.hidden = !matches;
            item.setAttribute('aria-hidden', matches ? 'false' : 'true');
            if (matches) visible += 1;
        });
        var sorted = items.slice().sort(function (a, b) {
            if (sort && sort.value === 'name') return String(a.dataset.title).localeCompare(String(b.dataset.title), 'fr');
            if (sort && sort.value === 'downloads') return Number(b.dataset.downloads) - Number(a.dataset.downloads);
            return Number(b.dataset.updated) - Number(a.dataset.updated);
        });
        sorted.forEach(function (item) { if (grid) grid.appendChild(item); });
        if (count) count.textContent = String(visible);
        if (countLabel) countLabel.textContent = 'logiciel' + (visible > 1 ? 's' : '') + ' à télécharger';
        if (empty) empty.hidden = visible !== 0;
        var active = Boolean(query || category !== 'all' || selectedOs !== 'all' || (sort && sort.value !== 'recent'));
        resetButtons.forEach(function (button) { button.hidden = !active; });
        updateUrl();
    };

    var reset = function () {
        if (search) search.value = '';
        if (os) os.value = 'all';
        if (sort) sort.value = 'recent';
        category = 'all';
        categoryButtons.forEach(function (button) {
            var isActive = button.dataset.softCategory === 'all';
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        apply();
        if (search) search.focus();
    };

    categoryButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            category = button.dataset.softCategory || 'all';
            categoryButtons.forEach(function (item) {
                var isActive = item === button;
                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
            apply();
        });
    });
    if (search) search.addEventListener('input', apply);
    [os, sort].forEach(function (control) { if (control) control.addEventListener('change', apply); });
    resetButtons.forEach(function (button) { button.addEventListener('click', reset); });

    var params = new URLSearchParams(location.search);
    if (search && params.get('q')) search.value = params.get('q').slice(0, 120);
    if (os && Array.from(os.options).some(function (option) { return option.value === params.get('plateforme'); })) os.value = params.get('plateforme');
    if (sort && ['recent', 'name', 'downloads'].indexOf(params.get('tri')) !== -1) sort.value = params.get('tri');
    var initialCategory = params.get('categorie');
    var initialButton = categoryButtons.find(function (button) { return button.dataset.softCategory === initialCategory; });
    if (initialButton) {
        category = initialCategory;
        categoryButtons.forEach(function (item) {
            var isActive = item === initialButton;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }
    apply();
})();

/* JP-Services — compteurs animés de la page d'accueil */
(function () {
    'use strict';

    var counters = Array.from(document.querySelectorAll('[data-countup]'));
    if (counters.length === 0) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var animate = function (el) {
        var target = parseInt(el.getAttribute('data-countup'), 10) || 0;
        if (reduced || target === 0) {
            el.textContent = String(target);
            return;
        }
        var duration = 1600;
        var start = null;
        var step = function (timestamp) {
            if (!start) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = String(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
        counters.forEach(animate);
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animate(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(function (el) { observer.observe(el); });
})();
