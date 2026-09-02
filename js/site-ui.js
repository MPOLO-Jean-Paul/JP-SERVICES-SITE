(function () {
    'use strict';

    const doc = document;
    const root = doc.documentElement;
    const body = doc.body;
    const uiEn = root.lang === 'en';
    const uiText = (french, english) => uiEn ? english : french;
    const prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    const getThemeChoice = () => {
        try { return localStorage.getItem('jp-theme') || 'system'; } catch (_) { return 'system'; }
    };
    const resolveTheme = (choice) => choice === 'system'
        ? (prefersDark && prefersDark.matches ? 'dark' : 'light')
        : choice;
    const applyTheme = (choice, persist = true) => {
        const safeChoice = ['light', 'dark', 'system'].includes(choice) ? choice : 'system';
        root.dataset.themeChoice = safeChoice;
        root.dataset.theme = resolveTheme(safeChoice);
        const colorScheme = doc.querySelector('meta[name="color-scheme"]');
        if (colorScheme) colorScheme.content = root.dataset.theme;
        const themeColor = doc.querySelector('meta[name="theme-color"]');
        if (themeColor) themeColor.content = root.dataset.theme === 'dark' ? '#09111e' : '#f5f7fc';
        if (persist) { try { localStorage.setItem('jp-theme', safeChoice); } catch (_) {} }
        doc.querySelectorAll('[data-theme-value]').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.themeValue === safeChoice);
            button.setAttribute('aria-checked', button.dataset.themeValue === safeChoice ? 'true' : 'false');
        });
    };
    applyTheme(getThemeChoice(), false);
    if (prefersDark && prefersDark.addEventListener) prefersDark.addEventListener('change', () => { if (getThemeChoice() === 'system') applyTheme('system', false); });

    doc.querySelectorAll('[data-theme-control]').forEach((control) => {
        const trigger = control.querySelector('.jp-theme-button');
        const menu = control.querySelector('.jp-theme-menu');
        if (!trigger || !menu) return;
        const close = () => { control.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); };
        trigger.addEventListener('click', (event) => { event.stopPropagation(); const open = !control.classList.contains('is-open'); closeHeaderPopups(false); doc.querySelectorAll('[data-theme-control].is-open').forEach((other) => other.classList.remove('is-open')); control.classList.toggle('is-open', open); trigger.setAttribute('aria-expanded', open ? 'true' : 'false'); menu.setAttribute('aria-hidden', open ? 'false' : 'true'); });
        control.querySelectorAll('[data-theme-value]').forEach((button) => button.addEventListener('click', () => { applyTheme(button.dataset.themeValue || 'system'); close(); }));
        doc.addEventListener('click', (event) => { if (!control.contains(event.target)) close(); });
    });

    const cycleTheme = () => {
        const order = ['light', 'dark', 'system'];
        const current = getThemeChoice();
        applyTheme(order[(order.indexOf(current) + 1) % order.length]);
    };
    doc.querySelectorAll('[data-mobile-theme]').forEach((button) => button.addEventListener('click', cycleTheme));

    const headerMenus = Array.from(doc.querySelectorAll('[data-header-menu]'));
    const accountControl = doc.querySelector('[data-account-control]');
    const accountTrigger = accountControl?.querySelector('[data-account-trigger]');
    const accountMenu = accountControl?.querySelector('.jp-account-menu');
    const languageControls = Array.from(doc.querySelectorAll('[data-language-control]'));
    const headerBackdrop = doc.querySelector('[data-header-backdrop]');
    let headerPopupTrigger = null;

    const syncHeaderBackdrop = () => {
        const open = headerMenus.some((menu) => menu.classList.contains('is-open')) || Boolean(accountControl?.classList.contains('is-open')) || languageControls.some((control) => control.classList.contains('is-open'));
        headerBackdrop?.classList.toggle('is-visible', open);
        headerBackdrop?.setAttribute('aria-hidden', open ? 'false' : 'true');
    };

    const closeHeaderPopups = (restoreFocus = false) => {
        headerMenus.forEach((menu) => {
            menu.classList.remove('is-open');
            menu.querySelector('[data-header-menu-trigger]')?.setAttribute('aria-expanded', 'false');
            menu.querySelector('[data-header-menu-panel]')?.setAttribute('aria-hidden', 'true');
        });
        if (accountControl) accountControl.classList.remove('is-open');
        accountTrigger?.setAttribute('aria-expanded', 'false');
        accountMenu?.setAttribute('aria-hidden', 'true');
        doc.querySelectorAll('[data-theme-control].is-open').forEach((control) => {
            control.classList.remove('is-open');
            control.querySelector('.jp-theme-button')?.setAttribute('aria-expanded', 'false');
            control.querySelector('.jp-theme-menu')?.setAttribute('aria-hidden', 'true');
        });
        languageControls.forEach((control) => {
            control.classList.remove('is-open');
            control.querySelector('.jp-language-button')?.setAttribute('aria-expanded', 'false');
            control.querySelector('.jp-language-menu')?.setAttribute('aria-hidden', 'true');
        });
        syncHeaderBackdrop();
        if (restoreFocus && headerPopupTrigger && typeof headerPopupTrigger.focus === 'function') headerPopupTrigger.focus();
        headerPopupTrigger = null;
    };

    const canHoverHeaderMenus = () => window.matchMedia && window.matchMedia('(hover: hover) and (min-width: 1081px)').matches;
    let headerMenuCloseTimer = 0;
    const openHeaderMenu = (menu, trigger, panel, openedByHover = false) => {
        if (!menu || !trigger || !panel) return;
        window.clearTimeout(headerMenuCloseTimer);
        const alreadyOpen = menu.classList.contains('is-open');
        if (!alreadyOpen) closeHeaderPopups(false);
        headerPopupTrigger = trigger;
        menu.classList.add('is-open');
        if (openedByHover) menu.dataset.openedByHover = 'true';
        else delete menu.dataset.openedByHover;
        trigger.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        syncHeaderBackdrop();
    };
    const scheduleHeaderMenuClose = (menu) => {
        window.clearTimeout(headerMenuCloseTimer);
        headerMenuCloseTimer = window.setTimeout(() => {
            if (!menu.classList.contains('is-open')) return;
            closeHeaderPopups(false);
        }, 140);
    };

    headerMenus.forEach((menu) => {
        const trigger = menu.querySelector('[data-header-menu-trigger]');
        const panel = menu.querySelector('[data-header-menu-panel]');
        if (!trigger || !panel) return;
        trigger.addEventListener('click', (event) => {
            event.stopPropagation();
            const open = !menu.classList.contains('is-open');
            if (!open && menu.dataset.openedByHover === 'true' && canHoverHeaderMenus()) return;
            closeHeaderPopups(false);
            if (open) openHeaderMenu(menu, trigger, panel);
        });
        trigger.addEventListener('keydown', (event) => {
            if (event.key !== 'ArrowDown') return;
            event.preventDefault();
            if (!menu.classList.contains('is-open')) openHeaderMenu(menu, trigger, panel);
            panel.querySelector('a[href]')?.focus();
        });
        menu.addEventListener('pointerenter', () => {
            if (!canHoverHeaderMenus()) return;
            openHeaderMenu(menu, trigger, panel, true);
        });
        menu.addEventListener('pointerleave', () => {
            if (!canHoverHeaderMenus()) return;
            scheduleHeaderMenuClose(menu);
        });
        menu.addEventListener('focusin', () => window.clearTimeout(headerMenuCloseTimer));
        menu.addEventListener('focusout', () => {
            window.setTimeout(() => {
                if (menu.contains(doc.activeElement)) return;
                delete menu.dataset.openedByHover;
                if (menu.classList.contains('is-open')) closeHeaderPopups(false);
            }, 0);
        });
    });

    if (accountTrigger && accountMenu) {
        accountTrigger.addEventListener('click', (event) => {
            event.stopPropagation();
            const open = !accountControl.classList.contains('is-open');
            closeHeaderPopups(false);
            if (open) {
                headerPopupTrigger = accountTrigger;
                accountControl.classList.add('is-open');
                accountTrigger.setAttribute('aria-expanded', 'true');
                accountMenu.setAttribute('aria-hidden', 'false');
                syncHeaderBackdrop();
            }
        });
        accountTrigger.addEventListener('keydown', (event) => {
            if (event.key !== 'ArrowDown') return;
            event.preventDefault();
            if (!accountControl.classList.contains('is-open')) accountTrigger.click();
            accountMenu.querySelector('a[href],button:not([disabled])')?.focus();
        });
    }

    languageControls.forEach((control) => {
        const trigger = control.querySelector('.jp-language-button');
        const menu = control.querySelector('.jp-language-menu');
        if (!trigger || !menu) return;
        trigger.addEventListener('click', (event) => {
            event.stopPropagation();
            const open = !control.classList.contains('is-open');
            closeHeaderPopups(false);
            if (!open) return;
            headerPopupTrigger = trigger;
            control.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            menu.setAttribute('aria-hidden', 'false');
            syncHeaderBackdrop();
        });
        trigger.addEventListener('keydown', (event) => {
            if (event.key !== 'ArrowDown') return;
            event.preventDefault();
            if (!control.classList.contains('is-open')) trigger.click();
            menu.querySelector('button:not([disabled])')?.focus();
        });
    });

    headerBackdrop?.addEventListener('click', () => closeHeaderPopups(true));
    doc.addEventListener('click', (event) => {
        if (!event.target.closest('[data-header-menu], [data-account-control], [data-theme-control], [data-language-control]')) closeHeaderPopups(false);
    });

    const announcement = doc.querySelector('[data-site-announcement]');
    const dismissAnnouncement = doc.querySelector('[data-dismiss-announcement]');
    if (announcement && root.classList.contains('jp-announcement-was-dismissed')) announcement.hidden = true;
    dismissAnnouncement?.addEventListener('click', () => {
        if (announcement) announcement.hidden = true;
        root.classList.add('jp-announcement-was-dismissed');
        try { localStorage.setItem('jp-announcement-dismissed', '1'); } catch (_) {}
    });

    const loader = doc.getElementById('loader-wrapper');
    const hideLoader = () => { if (!loader) return; loader.classList.add('loader-hidden'); window.setTimeout(() => loader.remove(), 500); };
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', hideLoader, { once: true }); else hideLoader();
    window.setTimeout(hideLoader, 1200);

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
        doc.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
            const target = new URL(link.href, location.href);
            if (target.origin !== location.origin || target.href === location.href || (target.pathname === location.pathname && target.search === location.search && target.hash)) return;
            event.preventDefault();
            body?.classList.add('jp-page-leaving');
            window.setTimeout(() => { location.href = target.href; }, 135);
        });
        window.addEventListener('pageshow', () => body?.classList.remove('jp-page-leaving'));
    }

    const header = doc.getElementById('site-header');
    const overlay = doc.getElementById('oc-overlay');
    const leftPanel = doc.getElementById('panel-left');
    const rightPanel = doc.getElementById('panel-right');
    const searchModal = doc.getElementById('search-modal');
    const searchInput = doc.getElementById('q-input');
    let lastFocus = null;

    const focusableIn = (container) => Array.from(container?.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])') || []).filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
    const visibleSurface = () => doc.querySelector('.jp-confirm-dialog.is-visible') || doc.querySelector('.jp-modal.is-visible') || doc.querySelector('.modal.show') || doc.querySelector('.oc-panel.open');

    const lockPage = (locked) => body && body.classList.toggle('jp-lock-scroll', locked);
    const setExpanded = (id, value) => { const el = doc.getElementById(id); if (el) el.setAttribute('aria-expanded', value ? 'true' : 'false'); };
    const closePanels = (restoreFocus = true) => {
        [leftPanel, rightPanel].forEach((panel) => { if (!panel) return; panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); });
        if (overlay) { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); }
        setExpanded('btn-left', false); setExpanded('btn-right', false); lockPage(false); if (restoreFocus && lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };
    const openPanel = (panel, triggerId) => {
        if (!panel) return; closeHeaderPopups(false); closeSearch(); closePanels(false); lastFocus = doc.activeElement; panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); if (overlay) { overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false'); } setExpanded(triggerId, true); lockPage(true); const focusable = panel.querySelector('a,button,input'); if (focusable) focusable.focus();
    };
    const openSearch = () => {
        closeHeaderPopups(false); closePanels(); if (!searchModal) return; lastFocus = doc.activeElement; searchModal.classList.add('is-visible'); searchModal.setAttribute('aria-hidden', 'false'); lockPage(true); window.setTimeout(() => searchInput && searchInput.focus(), 100);
    };
    const closeSearch = () => { if (!searchModal) return; searchModal.classList.remove('is-visible'); searchModal.setAttribute('aria-hidden', 'true'); lockPage(false); if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus(); };
    const bindClick = (id, fn) => { const el = doc.getElementById(id); if (el) el.addEventListener('click', fn); };
    bindClick('btn-left', () => openPanel(leftPanel, 'btn-left')); bindClick('btn-right', () => openPanel(rightPanel, 'btn-right')); bindClick('profile-btn-desk', () => openPanel(rightPanel, 'btn-right')); bindClick('close-left', closePanels); bindClick('close-right', closePanels); bindClick('search-btn-desk', openSearch); bindClick('search-btn-mob', openSearch); bindClick('close-search-btn', closeSearch);
    if (overlay) overlay.addEventListener('click', closePanels);
    if (searchModal) searchModal.addEventListener('click', (event) => { if (event.target === searchModal) closeSearch(); });

    const notifModal = doc.getElementById('notif-modal');
    doc.querySelectorAll('[data-open-notification]').forEach((button) => button.addEventListener('click', () => { if (!notifModal) return; lastFocus = doc.activeElement; notifModal.classList.add('is-visible'); notifModal.setAttribute('aria-hidden', 'false'); lockPage(true); const target = notifModal.querySelector('button,a,[tabindex]'); if (target) target.focus(); }));
    doc.querySelectorAll('[data-close-notification]').forEach((button) => button.addEventListener('click', () => { if (!notifModal) return; notifModal.classList.remove('is-visible'); notifModal.setAttribute('aria-hidden', 'true'); lockPage(false); if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus(); }));
    doc.querySelectorAll('[data-close-notification-bar]').forEach((button) => button.addEventListener('click', () => { const bar = doc.getElementById('admin-notif-bar'); if (bar) bar.remove(); body && body.classList.remove('has-notif'); }));

    const pageTrainingSearch = doc.querySelector('[data-training-search]');
    doc.addEventListener('keydown', (event) => {
        if (event.key === '/' && !/input|textarea|select/i.test(doc.activeElement && doc.activeElement.tagName || '')) { event.preventDefault(); if (pageTrainingSearch) pageTrainingSearch.focus(); else if (searchModal) openSearch(); return; }
        if (event.key === 'Escape') { closeHeaderPopups(true); closePanels(); closeSearch(); if (notifModal) { notifModal.classList.remove('is-visible'); notifModal.setAttribute('aria-hidden', 'true'); } doc.querySelectorAll('.modal.show').forEach((modal) => { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }); closeAdminSearch(); closeConfirm(); if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus(); }
        if (event.key === 'Tab') {
            const surface = visibleSurface();
            if (!surface) return;
            const items = focusableIn(surface);
            if (!items.length) return;
            const first = items[0]; const last = items[items.length - 1];
            if (event.shiftKey && doc.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && doc.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });

    let ticking = false;
    const updateScrollState = () => { if (header) header.classList.toggle('is-scrolled', window.scrollY > 24); const back = doc.getElementById('backToTop'); if (back) back.classList.toggle('is-visible', window.scrollY > 520); ticking = false; };
    window.addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(updateScrollState); }, { passive: true }); updateScrollState();
    const backToTop = doc.getElementById('backToTop'); if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const readingProgress = doc.querySelector('[data-reading-progress]');
    if (readingProgress) {
        const updateReadingProgress = () => {
            const height = Math.max(1, doc.documentElement.scrollHeight - window.innerHeight);
            readingProgress.style.width = `${Math.min(100, Math.max(0, window.scrollY / height * 100))}%`;
        };
        window.addEventListener('scroll', updateReadingProgress, { passive: true });
        updateReadingProgress();
    }

    doc.querySelectorAll('[data-print-page]').forEach((button) => button.addEventListener('click', () => window.print()));
    doc.querySelectorAll('[data-share-url]').forEach((button) => button.addEventListener('click', async () => {
        const url = new URL(button.dataset.shareUrl || location.href, location.href).href;
        const title = button.dataset.shareTitle || doc.title;
        try {
            if (navigator.share) await navigator.share({ title, url });
            else {
                await navigator.clipboard.writeText(url);
                button.setAttribute('aria-label', uiText('Lien copié', 'Link copied'));
            }
        } catch (_) {}
    }));

    let pendingConfirmForm = null;
    let pendingConfirmSubmitter = null;
    let pendingConfirmFocus = null;
    const confirmDialog = doc.createElement('div');
    confirmDialog.className = 'jp-confirm-dialog';
    confirmDialog.setAttribute('role', 'alertdialog');
    confirmDialog.setAttribute('aria-modal', 'true');
    confirmDialog.setAttribute('aria-hidden', 'true');
    confirmDialog.setAttribute('aria-labelledby', 'jp-confirm-title');
    confirmDialog.setAttribute('aria-describedby', 'jp-confirm-message');
    confirmDialog.innerHTML = uiEn
        ? '<div class="jp-confirm-card"><span class="jp-confirm-icon"><i class="fas fa-shield-halved"></i></span><div><h2 id="jp-confirm-title">Confirm action</h2><p id="jp-confirm-message"></p></div><div class="jp-confirm-actions"><button type="button" class="jp-btn jp-btn-ghost" data-confirm-cancel>Cancel</button><button type="button" class="jp-btn jp-btn-primary" data-confirm-accept>Confirm</button></div></div>'
        : '<div class="jp-confirm-card"><span class="jp-confirm-icon"><i class="fas fa-shield-halved"></i></span><div><h2 id="jp-confirm-title">Confirmer l’action</h2><p id="jp-confirm-message"></p></div><div class="jp-confirm-actions"><button type="button" class="jp-btn jp-btn-ghost" data-confirm-cancel>Annuler</button><button type="button" class="jp-btn jp-btn-primary" data-confirm-accept>Confirmer</button></div></div>';
    body && body.appendChild(confirmDialog);
    const confirmMessage = confirmDialog.querySelector('#jp-confirm-message');
    const confirmCancel = confirmDialog.querySelector('[data-confirm-cancel]');
    const confirmAccept = confirmDialog.querySelector('[data-confirm-accept]');
    const closeConfirm = () => {
        confirmDialog.classList.remove('is-visible');
        confirmDialog.setAttribute('aria-hidden', 'true');
        lockPage(Boolean(doc.querySelector('.jp-modal.is-visible,.modal.show,.oc-panel.open')));
        if (pendingConfirmFocus && typeof pendingConfirmFocus.focus === 'function') pendingConfirmFocus.focus();
        pendingConfirmForm = null;
        pendingConfirmSubmitter = null;
        pendingConfirmFocus = null;
    };
    doc.addEventListener('submit', (event) => {
        const form = event.target.closest('form[data-confirm]');
        if (!form || form.dataset.confirmed === 'true') {
            if (form) delete form.dataset.confirmed;
            return;
        }
        event.preventDefault();
        pendingConfirmForm = form;
        pendingConfirmSubmitter = event.submitter || null;
        pendingConfirmFocus = doc.activeElement;
        if (confirmMessage) confirmMessage.textContent = form.dataset.confirm || uiText('Confirmer cette action ?', 'Confirm this action?');
        confirmDialog.classList.add('is-visible');
        confirmDialog.setAttribute('aria-hidden', 'false');
        lockPage(true);
        window.setTimeout(() => confirmCancel && confirmCancel.focus(), 30);
    });
    if (confirmCancel) confirmCancel.addEventListener('click', closeConfirm);
    if (confirmAccept) confirmAccept.addEventListener('click', () => {
        const form = pendingConfirmForm;
        const submitter = pendingConfirmSubmitter;
        closeConfirm();
        if (!form) return;
        form.dataset.confirmed = 'true';
        if (typeof form.requestSubmit === 'function') form.requestSubmit(submitter || undefined);
        else form.submit();
    });
    confirmDialog.addEventListener('click', (event) => { if (event.target === confirmDialog) closeConfirm(); });

    doc.addEventListener('click', (event) => {
        const reload = event.target.closest('[data-page-reload]');
        if (reload) { window.location.reload(); return; }
        const remove = event.target.closest('[data-remove-parent]');
        if (remove) { remove.parentElement?.remove(); return; }
        const addModule = event.target.closest('[data-add-module]');
        if (addModule) {
            const wrap = doc.getElementById('module-list');
            if (!wrap) return;
            const row = doc.createElement('div');
            row.className = 'd-flex gap-2 mb-2';
            row.innerHTML = `<input type="text" name="modules[]" class="form-control g-input" maxlength="180" placeholder="${uiText('Nom du module', 'Module name')}" required><button type="button" class="btn btn-light border" data-remove-parent aria-label="${uiText('Retirer ce module', 'Remove this module')}"><i class="fas fa-times text-danger"></i></button>`;
            wrap.appendChild(row);
            row.querySelector('input')?.focus();
            return;
        }
        const planningDelete = event.target.closest('[data-delete-planning-id]');
        if (planningDelete) {
            const form = doc.getElementById('delete-planning-form');
            const input = doc.getElementById('delete-planning-id');
            if (!form || !input) return;
            input.value = planningDelete.dataset.deletePlanningId || '';
            form.requestSubmit();
        }
    });
    doc.querySelectorAll('[data-auto-submit]').forEach((control) => control.addEventListener('change', () => control.form?.requestSubmit()));
    doc.querySelectorAll('img[data-fallback-src]').forEach((image) => image.addEventListener('error', () => {
        const fallback = image.dataset.fallbackSrc;
        if (fallback && image.src !== fallback) image.src = fallback;
    }, { once: true }));

    doc.querySelectorAll('.footer-accordion').forEach((button) => {
        const target = doc.getElementById(button.getAttribute('aria-controls') || '');
        if (!target) return;
        const isV3Footer = Boolean(button.closest('.jp-footer-v3'));
        const sync = () => {
            const mobileBreakpoint = isV3Footer ? '(max-width: 640px)' : '(max-width: 600px)';
            const mobile = window.matchMedia && window.matchMedia(mobileBreakpoint).matches;
            if (!mobile) {
                target.hidden = false;
                button.setAttribute('aria-expanded', 'true');
                button.dataset.footerReady = '';
            } else if (button.dataset.footerReady !== 'mobile') {
                target.hidden = true;
                button.setAttribute('aria-expanded', 'false');
                button.dataset.footerReady = 'mobile';
            }
        };
        button.addEventListener('click', () => {
            const mobileBreakpoint = isV3Footer ? '(max-width: 640px)' : '(max-width: 600px)';
            if (window.matchMedia && !window.matchMedia(mobileBreakpoint).matches) return;
            const open = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', open ? 'false' : 'true');
            target.hidden = open;
        });
        window.addEventListener('resize', sync, { passive: true });
        sync();
    });

    // Le sélecteur de langue du footer déclenche une vraie soumission native.
    // Il ne dépend donc pas d'un attribut JavaScript en ligne bloqué par la CSP.
    doc.querySelectorAll('[data-footer-locale]').forEach((select) => {
        select.addEventListener('change', () => {
            const form = select.closest('form');
            if (!form || select.getAttribute('aria-busy') === 'true') return;
            // Ne pas désactiver le <select> : un contrôle désactivé n'est pas
            // inclus dans la requête et la langue choisie serait perdue.
            select.setAttribute('aria-busy', 'true');
            form.requestSubmit();
        });
    });

    const revealElements = doc.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealElements.length) {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }), { threshold: 0.1, rootMargin: '0px 0px -30px' });
        revealElements.forEach((element) => observer.observe(element));
    } else revealElements.forEach((element) => element.classList.add('is-visible'));

    doc.querySelectorAll('[data-rotator]').forEach((rotator) => {
        const items = Array.from(rotator.querySelectorAll('[data-rotator-item]')); if (items.length < 2) return; let index = Math.max(0, items.findIndex((item) => item.classList.contains('is-active'))); const show = (next) => { items.forEach((item, i) => item.classList.toggle('is-active', i === next)); index = next; }; let timer = window.setInterval(() => show((index + 1) % items.length), 5200); rotator.addEventListener('mouseenter', () => clearInterval(timer)); rotator.addEventListener('mouseleave', () => { timer = window.setInterval(() => show((index + 1) % items.length), 5200); });
    });

    // Mot-clé dynamique du héros : animé uniquement si l'utilisateur ne réduit pas les mouvements.
    // Le texte initial reste visible sans JavaScript, pour une lecture et une indexation fiables.
    if (!reduceMotion) {
        doc.querySelectorAll('[data-jp-typewriter]').forEach((element) => {
            const words = String(element.dataset.jpTypewriter || '').split('|').map((word) => word.trim()).filter(Boolean);
            if (words.length < 2) return;
            let wordIndex = 0;
            let characterIndex = words[0].length;
            let timer = 0;
            let stopped = false;
            const render = () => { element.textContent = words[wordIndex].slice(0, characterIndex); };
            const schedule = (callback, delay) => { window.clearTimeout(timer); timer = window.setTimeout(callback, delay); };
            const type = () => {
                if (stopped) return;
                if (characterIndex < words[wordIndex].length) {
                    characterIndex += 1;
                    render();
                    schedule(type, 42);
                    return;
                }
                schedule(erase, 1750);
            };
            const erase = () => {
                if (stopped) return;
                if (characterIndex > 0) {
                    characterIndex -= 1;
                    render();
                    schedule(erase, 26);
                    return;
                }
                wordIndex = (wordIndex + 1) % words.length;
                schedule(type, 190);
            };
            const resume = () => {
                stopped = false;
                window.clearTimeout(timer);
                if (characterIndex === words[wordIndex].length) schedule(erase, 850);
                else schedule(type, 80);
            };
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) { stopped = true; window.clearTimeout(timer); }
                else resume();
            });
            schedule(erase, 1800);
        });
    }

    doc.querySelectorAll('[data-password-toggle]').forEach((button) => button.addEventListener('click', () => { const target = doc.getElementById(button.getAttribute('data-password-toggle')); if (!target) return; const reveal = target.type === 'password'; target.type = reveal ? 'text' : 'password'; button.setAttribute('aria-pressed', reveal ? 'true' : 'false'); const icon = button.querySelector('i'); if (icon) { icon.classList.toggle('fa-eye', !reveal); icon.classList.toggle('fa-eye-slash', reveal); } }));

    doc.querySelectorAll('[data-verification-code]').forEach((input) => input.addEventListener('input', () => {
        const code = input.value.replace(/\D/g, '').slice(0, 6);
        if (input.value !== code) input.value = code;
    }));

    const trainingCatalog = doc.querySelector('[data-training-catalog]');
    if (trainingCatalog) {
        const search = trainingCatalog.querySelector('[data-training-search]');
        const level = trainingCatalog.querySelector('[data-training-level]');
        const price = trainingCatalog.querySelector('[data-training-price]');
        const sort = trainingCatalog.querySelector('[data-training-sort]');
        const grid = trainingCatalog.querySelector('[data-training-grid]');
        const count = trainingCatalog.querySelector('[data-training-count]');
        const countLabel = trainingCatalog.querySelector('[data-training-count-label]');
        const empty = trainingCatalog.querySelector('[data-training-empty]');
        const categoryButtons = Array.from(trainingCatalog.querySelectorAll('[data-training-category]'));
        const resetButtons = Array.from(trainingCatalog.querySelectorAll('[data-training-reset]'));
        const items = Array.from(trainingCatalog.querySelectorAll('[data-training-item]'));
        let category = 'all';
        const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
        const updateUrl = () => {
            if (!window.history?.replaceState) return;
            const params = new URLSearchParams();
            if (search?.value.trim()) params.set('q', search.value.trim());
            if (category !== 'all') params.set('domaine', category);
            if (level?.value && level.value !== 'all') params.set('niveau', level.value);
            if (price?.value && price.value !== 'all') params.set('acces', price.value);
            if (sort?.value && sort.value !== 'title') params.set('tri', sort.value);
            const query = params.toString();
            window.history.replaceState(null, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
        };
        const applyTrainingFilters = () => {
            const query = normalize(search?.value);
            const selectedLevel = level?.value || 'all';
            const selectedPrice = price?.value || 'all';
            let visible = 0;
            items.forEach((item) => {
                const matches = (!query || normalize(item.dataset.search).includes(query))
                    && (category === 'all' || item.dataset.category === category)
                    && (selectedLevel === 'all' || item.dataset.level === selectedLevel)
                    && (selectedPrice === 'all' || item.dataset.priceType === selectedPrice);
                item.hidden = !matches;
                item.setAttribute('aria-hidden', matches ? 'false' : 'true');
                if (matches) visible += 1;
            });
            const sorted = [...items].sort((a, b) => {
                if (sort?.value === 'price-asc') return Number(a.dataset.price) - Number(b.dataset.price);
                if (sort?.value === 'price-desc') return Number(b.dataset.price) - Number(a.dataset.price);
                if (sort?.value === 'date') return Number(a.dataset.date) - Number(b.dataset.date);
                return String(a.dataset.title).localeCompare(String(b.dataset.title), 'fr');
            });
            sorted.forEach((item) => grid?.appendChild(item));
            if (count) count.textContent = String(visible);
            if (countLabel) countLabel.textContent = root.lang === 'en' ? `course${visible === 1 ? '' : 's'} to discover` : `formation${visible > 1 ? 's' : ''} à découvrir`;
            if (empty) empty.hidden = visible !== 0;
            const active = Boolean(query || category !== 'all' || selectedLevel !== 'all' || selectedPrice !== 'all' || (sort?.value && sort.value !== 'title'));
            resetButtons.forEach((button) => { button.hidden = !active; });
            updateUrl();
        };
        const resetTrainingFilters = () => {
            if (search) search.value = '';
            if (level) level.value = 'all';
            if (price) price.value = 'all';
            if (sort) sort.value = 'title';
            category = 'all';
            categoryButtons.forEach((button) => { const active = button.dataset.trainingCategory === 'all'; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', active ? 'true' : 'false'); });
            applyTrainingFilters();
            search?.focus();
        };
        categoryButtons.forEach((button) => button.addEventListener('click', () => {
            category = button.dataset.trainingCategory || 'all';
            categoryButtons.forEach((item) => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', active ? 'true' : 'false'); });
            applyTrainingFilters();
        }));
        search?.addEventListener('input', applyTrainingFilters);
        [level, price, sort].forEach((control) => control?.addEventListener('change', applyTrainingFilters));
        resetButtons.forEach((button) => button.addEventListener('click', resetTrainingFilters));

        const initialParams = new URLSearchParams(location.search);
        if (search && initialParams.get('q')) search.value = initialParams.get('q').slice(0, 120);
        if (level && Array.from(level.options).some((option) => option.value === initialParams.get('niveau'))) level.value = initialParams.get('niveau');
        if (price && ['all', 'free', 'paid'].includes(initialParams.get('acces'))) price.value = initialParams.get('acces');
        if (sort && ['title', 'price-asc', 'price-desc', 'date'].includes(initialParams.get('tri'))) sort.value = initialParams.get('tri');
        const initialCategory = initialParams.get('domaine');
        const initialCategoryButton = categoryButtons.find((button) => button.dataset.trainingCategory === initialCategory);
        if (initialCategoryButton) { category = initialCategory; categoryButtons.forEach((item) => { const active = item === initialCategoryButton; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', active ? 'true' : 'false'); }); }
        applyTrainingFilters();
    }

    const programmeForm = doc.querySelector('[data-programme-form]');
    if (programmeForm) {
        const modules = Array.from(programmeForm.querySelectorAll('[data-programme-module]'));
        const days = Array.from(programmeForm.querySelectorAll('[data-programme-day]'));
        const moduleCount = programmeForm.querySelector('[data-programme-module-count]');
        const dayCount = programmeForm.querySelector('[data-programme-day-count]');
        const summaryDays = programmeForm.querySelector('[data-programme-summary-days]');
        const error = programmeForm.querySelector('[data-programme-error]');
        const showProgrammeError = (message, target) => { if (error) { error.textContent = message; error.hidden = false; } target?.focus(); };
        const clearProgrammeError = () => { if (error) { error.textContent = ''; error.hidden = true; } };
        const updateProgrammeSummary = () => {
            const selectedModules = modules.filter((item) => item.checked);
            const selectedDays = days.filter((item) => item.checked);
            if (moduleCount) moduleCount.textContent = uiEn ? `${selectedModules.length} selected` : `${selectedModules.length} sélectionné${selectedModules.length > 1 ? 's' : ''}`;
            if (dayCount) dayCount.textContent = uiEn ? `${selectedDays.length} / 3 days` : `${selectedDays.length} / 3 jours`;
            if (summaryDays) summaryDays.textContent = selectedDays.length ? selectedDays.map((item) => item.value).join(', ') : uiText('Aucun jour sélectionné', 'No day selected');
            days.forEach((item) => item.closest('[data-programme-day-card]')?.classList.toggle('is-selected', item.checked));
        };
        modules.forEach((item) => item.addEventListener('change', () => { clearProgrammeError(); updateProgrammeSummary(); }));
        days.forEach((item) => item.addEventListener('change', () => {
            const selected = days.filter((day) => day.checked);
            if (selected.length > 3) { item.checked = false; showProgrammeError(uiText('Vous pouvez sélectionner trois jours maximum.', 'You can select up to three days.'), item); }
            else clearProgrammeError();
            updateProgrammeSummary();
        }));
        programmeForm.addEventListener('submit', (event) => {
            clearProgrammeError();
            const selectedModules = modules.filter((item) => item.checked);
            const selectedDays = days.filter((item) => item.checked);
            if (!selectedModules.length) { event.preventDefault(); showProgrammeError(uiText('Sélectionnez au moins un module.', 'Select at least one module.'), modules[0]); return; }
            if (!selectedDays.length) { event.preventDefault(); showProgrammeError(uiText('Sélectionnez au moins un jour de disponibilité.', 'Select at least one available day.'), days[0]); return; }
            for (const day of selectedDays) {
                const card = day.closest('[data-programme-day-card]');
                const times = Array.from(card?.querySelectorAll('input[type="time"]') || []);
                times.forEach((input) => input.removeAttribute('aria-invalid'));
                if (times.length !== 2 || !times[0].value || !times[1].value || times[0].value >= times[1].value) {
                    event.preventDefault();
                    times.forEach((input) => input.setAttribute('aria-invalid', 'true'));
                    showProgrammeError(uiEn ? `Check the time selected for ${day.value}.` : `Vérifiez l’horaire choisi pour ${day.value}.`, times[0]);
                    return;
                }
            }
        });
        updateProgrammeSummary();
    }

    // Service showcase on the homepage: one poster and its matching explanation at a time.
    const reducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    doc.querySelectorAll('[data-service-showcase]').forEach((showcase) => {
        const slides = Array.from(showcase.querySelectorAll('[data-service-slide]'));
        const details = Array.from(showcase.querySelectorAll('[data-service-detail]'));
        const dots = Array.from(showcase.querySelectorAll('[data-service-go]'));
        const previous = showcase.querySelector('[data-service-previous]');
        const next = showcase.querySelector('[data-service-next]');
        const counter = showcase.querySelector('[data-service-current]');
        if (!slides.length || slides.length !== details.length) return;

        let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
        let rotation = null;
        let pointerInside = false;
        let focusInside = false;
        const interval = 4600;

        const stopRotation = () => {
            if (rotation !== null) { window.clearTimeout(rotation); rotation = null; }
        };
        const startRotation = () => {
            stopRotation();
            if (pointerInside || focusInside || doc.hidden || reducedMotion?.matches || slides.length < 2) return;
            rotation = window.setTimeout(() => { setActive(activeIndex + 1); startRotation(); }, interval);
        };
        const setActive = (nextIndex) => {
            activeIndex = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, index) => {
                const active = index === activeIndex;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-current', active ? 'true' : 'false');
                if (active) { slide.removeAttribute('aria-hidden'); slide.removeAttribute('tabindex'); }
                else { slide.setAttribute('aria-hidden', 'true'); slide.setAttribute('tabindex', '-1'); }
            });
            details.forEach((detail, index) => {
                const active = index === activeIndex;
                detail.classList.toggle('is-active', active);
                detail.setAttribute('aria-hidden', active ? 'false' : 'true');
                detail.querySelectorAll('a').forEach((link) => { if (active) link.removeAttribute('tabindex'); else link.setAttribute('tabindex', '-1'); });
            });
            dots.forEach((dot, index) => dot.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false'));
            if (counter) counter.textContent = String(activeIndex + 1).padStart(2, '0');
        };
        const select = (index) => { setActive(index); startRotation(); };

        previous?.addEventListener('click', () => select(activeIndex - 1));
        next?.addEventListener('click', () => select(activeIndex + 1));
        dots.forEach((dot) => dot.addEventListener('click', () => select(Number(dot.dataset.serviceGo || 0))));
        showcase.addEventListener('mouseenter', () => { pointerInside = true; stopRotation(); });
        showcase.addEventListener('mouseleave', () => { pointerInside = false; startRotation(); });
        showcase.addEventListener('focusin', () => { focusInside = true; stopRotation(); });
        showcase.addEventListener('focusout', (event) => { if (!showcase.contains(event.relatedTarget)) { focusInside = false; startRotation(); } });
        doc.addEventListener('visibilitychange', () => { if (doc.hidden) stopRotation(); else startRotation(); });
        reducedMotion?.addEventListener?.('change', startRotation);
        setActive(activeIndex);
        startRotation();
    });

    const adminToggle = doc.querySelector('.jp-admin-toggle');
    const adminMenu = doc.getElementById('jp-admin-links');
    if (adminToggle && adminMenu) {
        adminToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const open = adminMenu.classList.toggle('is-open');
            adminToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        doc.addEventListener('click', (event) => {
            if (adminMenu.classList.contains('is-open') && !adminMenu.contains(event.target) && !adminToggle.contains(event.target)) {
                adminMenu.classList.remove('is-open');
                adminToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    const adminSearchbar = doc.querySelector('[data-admin-searchbar]');
    const adminSearchInput = doc.querySelector('[data-admin-search-input]');
    function openAdminSearch() {
        if (!adminSearchbar) return;
        adminSearchbar.hidden = false;
        adminSearchbar.classList.add('is-open');
        window.setTimeout(() => adminSearchInput && adminSearchInput.focus(), 50);
    }
    function closeAdminSearch() {
        if (!adminSearchbar) return;
        adminSearchbar.classList.remove('is-open');
        adminSearchbar.hidden = true;
        if (adminSearchInput) {
            adminSearchInput.value = '';
            filterAdminNav('');
        }
    }
    function filterAdminNav(value) {
        const q = value.trim().toLowerCase();
        doc.querySelectorAll('[data-admin-search-item]').forEach((item) => {
            item.hidden = q !== '' && !(item.dataset.adminSearchItem || '').includes(q);
        });
    }
    doc.querySelectorAll('[data-admin-search-toggle]').forEach((button) => button.addEventListener('click', openAdminSearch));
    doc.querySelectorAll('[data-admin-search-close]').forEach((button) => button.addEventListener('click', closeAdminSearch));
    if (adminSearchInput) adminSearchInput.addEventListener('input', () => filterAdminNav(adminSearchInput.value));

    doc.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (adminSearchbar && adminSearchbar.classList.contains('is-open')) closeAdminSearch();
            if (adminMenu && adminMenu.classList.contains('is-open')) {
                adminMenu.classList.remove('is-open');
                adminToggle?.setAttribute('aria-expanded', 'false');
            }
        }
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && doc.body.classList.contains('jp-admin')) {
            event.preventDefault();
            openAdminSearch();
        }
    });

    // Native compatibility for legacy tab/pill/modal markup.
    doc.addEventListener('click', (event) => {
        const toggle = event.target.closest('[data-jp-toggle]');
        if (toggle) {
            const type = toggle.getAttribute('data-jp-toggle');
            if (type === 'modal') {
                event.preventDefault();
                const selector = toggle.getAttribute('data-jp-target') || toggle.getAttribute('href');
                const modal = selector ? doc.querySelector(selector) : null;
                if (modal) { lastFocus = doc.activeElement; modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); lockPage(true); const focusable = modal.querySelector('button,input,textarea,select,a'); if (focusable) focusable.focus(); }
            } else if (type === 'tab' || type === 'pill') {
                event.preventDefault();
                const selector = toggle.getAttribute('data-jp-target') || toggle.getAttribute('href');
                const target = selector && selector.startsWith('#') ? doc.querySelector(selector) : null;
                const nav = toggle.closest('.nav');
                if (nav) nav.querySelectorAll('[data-jp-toggle]').forEach((item) => item.classList.remove('active'));
                toggle.classList.add('active');
                if (target && target.parentElement) { target.parentElement.querySelectorAll('.tab-pane').forEach((pane) => pane.classList.remove('active','show')); target.classList.add('active','show'); }
            }
        }
        const dismiss = event.target.closest('[data-jp-dismiss]');
        if (dismiss) {
            const type = dismiss.getAttribute('data-jp-dismiss');
            if (type === 'modal') { const modal = dismiss.closest('.modal'); if (modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); lockPage(false); if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus(); } }
            if (type === 'alert') { const alert = dismiss.closest('.alert'); if (alert) alert.remove(); }
        }
    });
    doc.querySelectorAll('.modal').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); lockPage(false); if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus(); } }));
})();
