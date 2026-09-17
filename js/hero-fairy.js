(() => {
    const hero = document.querySelector('.masthead');
    const scene = hero?.querySelector('.hero-fairy-scene');
    const toggle = hero?.querySelector('.hero-motion-toggle');
    if (!hero || !scene || !toggle) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const label = toggle.querySelector('.hero-motion-label');
    let userPaused = false;
    let inView = true;
    let ready = false;

    const updateMotion = () => {
        const paused = userPaused || reducedMotion.matches || !inView || document.hidden;
        hero.classList.toggle('is-hero-paused', paused);
        toggle.hidden = reducedMotion.matches;
        toggle.classList.toggle('is-paused', userPaused);
        const action = userPaused ? 'Play animation' : 'Pause animation';
        toggle.setAttribute('aria-label', action);
        label.textContent = action;
        document.documentElement.classList.toggle('is-magic-paused', userPaused || reducedMotion.matches || document.hidden);
        window.numenMotion = {
            paused: userPaused || reducedMotion.matches || document.hidden,
            heroPaused: paused,
            reduced: reducedMotion.matches,
            ready,
        };
        document.dispatchEvent(new CustomEvent('numen:motionchange', { detail: window.numenMotion }));
    };

    toggle.addEventListener('click', () => {
        userPaused = !userPaused;
        updateMotion();
    });

    const imageReady = (img) => new Promise((resolve, reject) => {
        const loaded = () => {
            if (!img.naturalWidth) {
                reject(new Error('Fairy artwork could not be loaded.'));
                return;
            }
            // Decode both layers before hiding the original fairy illustration.
            if (typeof img.decode === 'function') img.decode().then(resolve, reject);
            else resolve();
        };
        if (img.complete) loaded();
        else {
            img.addEventListener('load', loaded, { once: true });
            img.addEventListener('error', reject, { once: true });
        }
    });

    Promise.all(Array.from(scene.querySelectorAll('.hero-forest, .hero-fairy-sprite'), imageReady))
        .then(() => {
            ready = true;
            hero.classList.add('is-fairy-ready');
            updateMotion();
        })
        .catch(() => {
            // The existing background and navigation stay usable if an asset fails.
            scene.remove();
        });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            updateMotion();
        });
        observer.observe(hero);
    }

    document.addEventListener('visibilitychange', updateMotion);
    if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', updateMotion);
    } else if (typeof reducedMotion.addListener === 'function') {
        reducedMotion.addListener(updateMotion);
    }
    updateMotion();
})();
