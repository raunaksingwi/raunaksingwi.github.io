(() => {
    const desktop = document.querySelector('.desktop');
    const home = document.querySelector('.application-window');
    const sections = [...document.querySelectorAll('.section')];
    const windows = new Map();
    let layer = 0;
    let drag = null;

    function updateDock() {
        document.querySelectorAll('.dock a').forEach(link => {
            const win = windows.get(link.hash.slice(1));
            link.classList.toggle('is-open', Boolean(win && win.dataset.state !== 'closed'));
        });
    }

    function activate(win, focus = false) {
        windows.forEach(other => other.classList.toggle('is-active', other === win));
        win.style.zIndex = ++layer;
        if (focus) win.focus({ preventScroll: true });
    }

    function openWindow(id, focus = true) {
        const win = windows.get(id);
        if (!win) return;
        win.hidden = false;
        win.dataset.state = 'open';
        activate(win, focus);
        updateDock();
    }

    function dismiss(win, state) {
        win.hidden = true;
        win.dataset.state = state;
        const remaining = [...windows.values()].filter(other => !other.hidden)
            .sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex));
        if (remaining.length) activate(remaining[0], true);
        else document.querySelector('.dock a').focus();
        updateDock();
    }

    function zoom(win) {
        const maximized = win.classList.toggle('is-maximized');
        const button = win.querySelector('[data-action="zoom"]');
        button.setAttribute('aria-label', maximized ? 'Restore window size' : 'Maximize window');
        button.setAttribute('aria-pressed', String(maximized));
        activate(win);
    }

    function prepare(win, id, title, index) {
        win.dataset.window = id;
        win.dataset.state = 'closed';
        win.setAttribute('role', 'region');
        win.setAttribute('aria-label', title + ' window');
        win.tabIndex = -1;
        win.style.setProperty('--cascade', index);
        win.querySelector('.window-title').innerHTML = `
            <span class="traffic-lights">
                <button type="button" data-action="close" aria-label="Close window"><span>×</span></button>
                <button type="button" data-action="minimize" aria-label="Minimize window"><span>−</span></button>
                <button type="button" data-action="zoom" aria-label="Maximize window" aria-pressed="false"><span>+</span></button>
            </span>
            <span class="title-text"></span>`;
        win.querySelector('.title-text').textContent = title;
        win.hidden = true;
        windows.set(id, win);
    }

    sections.forEach((section, index) => {
        const win = document.createElement('div');
        win.className = 'application-window content-window';
        const title = section.querySelector('h2').textContent;
        win.innerHTML = '<div class="window-title"></div><div class="window-document"></div><div class="window-status"><span>Drag the title bar to move this window.</span><span class="resize-grip" aria-hidden="true"></span></div>';
        win.querySelector('.window-document').append(section);
        desktop.append(win);
        prepare(win, section.id, title, index + 1);
    });
    prepare(home, 'hero', 'Raunak’s Mac', 0);
    document.body.classList.add('windows-ready');
    openWindow('hero', false);
    openWindow(location.hash.slice(1), false);

    document.addEventListener('click', event => {
        const control = event.target.closest('[data-action]');
        if (control) {
            const win = control.closest('[data-window]');
            if (control.dataset.action === 'zoom') zoom(win);
            else dismiss(win, control.dataset.action === 'minimize' ? 'minimized' : 'closed');
            return;
        }
        const link = event.target.closest('a[href^="#"]');
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const id = link.hash.slice(1);
        if (!windows.has(id)) return;
        event.preventDefault();
        if (location.hash !== link.hash) history.pushState(null, '', link.hash);
        openWindow(id);
    });
    window.addEventListener('hashchange', () => openWindow(location.hash.slice(1) || 'hero'));
    desktop.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            const win = event.target.closest('[data-window]');
            if (win) dismiss(win, 'closed');
        }
    });
    desktop.addEventListener('dblclick', event => {
        if (event.target.closest('button')) return;
        const title = event.target.closest('.window-title');
        if (title) zoom(title.closest('[data-window]'));
    });
    desktop.addEventListener('pointerdown', event => {
        const win = event.target.closest('[data-window]');
        if (!win) return;
        activate(win);
        const title = event.target.closest('.window-title');
        if (!title || event.target.closest('button') || event.button !== 0 ||
            win.classList.contains('is-maximized') || matchMedia('(max-width: 650px)').matches) return;
        const rect = win.getBoundingClientRect();
        const area = desktop.getBoundingClientRect();
        drag = { win, title, x: event.clientX, y: event.clientY,
            left: rect.left - area.left, top: rect.top - area.top };
        title.setPointerCapture(event.pointerId);
        win.classList.add('is-dragging');
        event.preventDefault();
    });
    desktop.addEventListener('pointermove', event => {
        if (!drag) return;
        const { win } = drag;
        const left = Math.max(0, Math.min(desktop.clientWidth - win.offsetWidth,
            drag.left + event.clientX - drag.x));
        const top = Math.max(0, Math.min(desktop.clientHeight - 35,
            drag.top + event.clientY - drag.y));
        win.style.left = left + 'px';
        win.style.top = top + 'px';
    });
    function endDrag() {
        if (!drag) return;
        drag.win.classList.remove('is-dragging');
        drag = null;
    }
    desktop.addEventListener('pointerup', endDrag);
    desktop.addEventListener('pointercancel', endDrag);
    desktop.addEventListener('lostpointercapture', endDrag);
    window.addEventListener('resize', () => {
        windows.forEach(win => {
            if (!win.style.left) return;
            win.style.left = Math.max(0, Math.min(parseFloat(win.style.left), desktop.clientWidth - win.offsetWidth)) + 'px';
            win.style.top = Math.max(0, Math.min(parseFloat(win.style.top), desktop.clientHeight - 35)) + 'px';
        });
    });
})();
