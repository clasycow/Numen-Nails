/* Progressive enhancement: the original artwork, photos and links work without this file. */
(async () => {
    'use strict';
    if (window.numenCatalogReady) await window.numenCatalogReady;
    const body = document.body;
    const hero = document.querySelector('.masthead');
    if (!body.classList.contains('page-enchanted') || !hero) return;
    const scene = hero.querySelector('.hero-fairy-scene');
    const fairy = hero.querySelector('.hero-fairy-position');
    const fairyFloat = hero.querySelector('.hero-fairy-float');
    const gallery = document.querySelector('#projects');
    const modal = document.querySelector('#nailModal');
    const chapters = document.querySelector('.forest-chapters');
    const motionToggle = hero.querySelector('.hero-motion-toggle');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    let motion = window.numenMotion || { paused: matchMedia('(prefers-reduced-motion: reduce)').matches, heroPaused: false };
    let viewport = { width: innerWidth, height: innerHeight, dpr: 1 };
    let heroHeight = hero.offsetHeight;
    let scroll = scrollY;
    let sectionPositions = [];
    let chapter = 'forest';
    let forest = null;
    let frameID = null;
    let lastFrame = 0;
    let elapsed = 0;
    let chosenWorld = 'forest';
    let activeWorld = 'forest';
    let pointer = { x: 0, y: 0, targetX: 0, targetY: 0, lastX: -100, lastY: -100 };
    const trails = [];
    const rings = [];
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const worlds = {
        forest: { label: 'Moonlit Forest', copy: 'Moonlight, wildflowers & a little wonder.', rgb: [216, 189, 240] },
        blossom: { label: 'Cherry Blossom', copy: 'Soft petals. Blush skies. Beautiful little details.', rgb: [247, 176, 204] },
        midnight: { label: 'Midnight Muse', copy: 'Dark romance, violet light & a bolder kind of magic.', rgb: [205, 162, 241] },
        ocean: { label: 'Ocean Dreams', copy: 'Sea-glass light & the quiet shimmer of the tide.', rgb: [151, 228, 232] },
        starlight: { label: 'Starlight', copy: 'Golden wishes against an endless evening sky.', rgb: [248, 215, 155] },
    };
    const worldArt = Object.fromEntries(Object.keys(worlds).map(name => [name, new URL(name === 'forest' ? 'assets/img/forest-distant.webp' : `assets/img/realm-${name}.webp`, document.baseURI).href]));
    const artRequests = new Map();
    function ensureWorldArt(name) {
        if (artRequests.has(name)) return artRequests.get(name);
        const request = loadImage(worldArt[name]).then(() => {
            const layer = gallery?.querySelector(`.collection-world-${name}`);
            if (layer && !layer.querySelector('.collection-world-art')) {
                const artwork = document.createElement('div');
                artwork.className = 'collection-world-art';
                artwork.style.backgroundImage = `url("${worldArt[name]}")`;
                layer.prepend(artwork);
            }
            return true;
        }).catch(() => false);
        artRequests.set(name, request);
        return request;
    }
    const setWorlds = {
        'hello-kitty-kuromi': 'midnight', 'pink-horror': 'midnight',
        'pink-petals': 'blossom', 'stars-stripes': 'starlight',
        'gothic-y2k-details': 'midnight', 'chinese-press-ons': 'blossom',
        'little-monsters': 'forest', 'blue-blooms': 'ocean', 'pastel-picnic': 'starlight',
    };

    // Keep motion control reachable throughout the page, outside the hero's stacking context.
    if (motionToggle) body.append(motionToggle);
    if (chapters) chapters.hidden = false;

    const imageLoaded = (img) => new Promise((resolve, reject) => {
        const done = () => {
            if (!img.naturalWidth) return reject(new Error('Artwork unavailable'));
            if (img.decode) img.decode().then(() => resolve(img), reject);
            else resolve(img);
        };
        if (img.complete) done();
        else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', reject, { once: true }); }
    });
    const loadImage = (src) => { const image = new Image(); image.decoding = 'async'; image.src = src; return imageLoaded(image); };
    const rigImages = Array.from(hero.querySelectorAll('.hero-fairy-rig img'));
    if (rigImages.length === 2) Promise.all(rigImages.map(imageLoaded)).then(() => fairyFloat?.classList.add('has-wing-rig')).catch(() => {});

    function selectWorld(name) {
        if (!worlds[name] || !gallery) return;
        activeWorld = name;
        gallery.dataset.world = name;
        ensureWorldArt(name);
        const description = document.querySelector('#worldDescription');
        if (description) description.textContent = worlds[name].copy;
        document.querySelectorAll('[data-select-world]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.selectWorld === name)));
    }
    const selector = document.querySelector('.world-selector');
    if (selector) selector.hidden = false;
    document.querySelectorAll('[data-select-world]').forEach(button => {
        button.addEventListener('click', () => { chosenWorld = button.dataset.selectWorld; selectWorld(chosenWorld); });
    });
    document.querySelectorAll('.nail-card[data-set-id]').forEach(card => {
        const world = card.dataset.world || setWorlds[card.dataset.setId] || 'forest';
        card.dataset.world = world;
        const inner = card.querySelector('.nail-card-inner');
        const label = document.createElement('span');
        label.className = 'set-world-label';
        label.textContent = worlds[world].label;
        card.querySelector('.nail-card__content > div')?.append(label);
        card.addEventListener('pointerenter', () => { if (finePointer.matches) selectWorld(world); });
        card.addEventListener('focusin', () => selectWorld(world));
        card.addEventListener('pointermove', event => {
            if (!inner || motion.paused || !finePointer.matches) return;
            const bounds = card.getBoundingClientRect();
            const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
            const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
            inner.style.setProperty('--crystal-x', `${(0.5 - y) * 5}deg`);
            inner.style.setProperty('--crystal-y', `${(x - 0.5) * 6}deg`);
            inner.style.setProperty('--crystal-light-x', `${x * 100}%`);
            inner.style.setProperty('--crystal-light-y', `${y * 100}%`);
        });
        card.addEventListener('pointerleave', () => {
            inner?.style.setProperty('--crystal-x', '0deg');
            inner?.style.setProperty('--crystal-y', '0deg');
            if (!card.contains(document.activeElement)) selectWorld(chosenWorld);
        });
        card.addEventListener('focusout', event => { if (!card.contains(event.relatedTarget)) selectWorld(chosenWorld); });
        card.addEventListener('click', event => {
            if (!event.target.closest('[data-open-set]') || !modal) return;
            modal.dataset.world = world;
            ensureWorldArt(world).then(loaded => {
                if (loaded && modal.dataset.world === world) modal.style.setProperty('--collection-art', `url("${worldArt[world]}")`);
            });
            modal.style.removeProperty('--collection-art');
            const worldLabel = modal.querySelector('.collection-modal-world');
            if (worldLabel) worldLabel.textContent = worlds[world].label;
        });
    });

    // These particles stay outside the photo stage, so nail colors remain accurate.
    const modalAtmosphere = modal?.querySelector('.collection-modal-atmosphere');
    if (modalAtmosphere) {
        for (let index = 0; index < 20; index++) {
            const mote = document.createElement('span');
            mote.className = 'collection-mote';
            mote.style.setProperty('--mote-x', `${(index * 37) % 100}%`);
            mote.style.setProperty('--mote-size', `${2 + index % 3}px`);
            mote.style.setProperty('--mote-duration', `${11 + index % 9}s`);
            mote.style.setProperty('--mote-delay', `${-index * 1.3}s`);
            modalAtmosphere.append(mote);
        }
    }
    document.querySelector('#nailModalPhoto')?.addEventListener('load', () => {
        if (motion.paused) return;
        const stage = document.querySelector('#nailPhotoStage');
        stage?.getAnimations().forEach(animation => animation.cancel());
        stage?.animate([{ transform: 'scale(.985)' }, { transform: 'scale(1)' }], { duration: 330, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });

    // If the external menu library is unavailable, the native navigation still opens.
    const menuButton = document.querySelector('.navbar-toggler');
    const menu = document.querySelector('#navbarResponsive');
    if (menuButton && menu && !window.bootstrap) menuButton.addEventListener('click', () => {
        const open = menu.classList.toggle('show');
        menuButton.setAttribute('aria-expanded', String(open));
    });

    let seed = 17;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const ambient = Array.from({ length: 34 }, () => ({ x: random(), y: random(), size: .8 + random() * 1.6, speed: .008 + random() * .013, phase: random() * Math.PI * 2 }));
    const touchCanvas = document.createElement('canvas');
    touchCanvas.className = 'magic-touch-canvas';
    touchCanvas.setAttribute('aria-hidden', 'true');
    const ink = touchCanvas.getContext('2d');
    if (ink) body.append(touchCanvas);

    function measure() {
        viewport = { width: innerWidth, height: innerHeight, dpr: Math.min(devicePixelRatio || 1, 1.5) };
        heroHeight = Math.max(hero.offsetHeight, 1);
        sectionPositions = [['about', '#about'], ['gallery', '#projects'], ['contact', '#contact']].map(([name, selector]) => ({ name, top: document.querySelector(selector)?.getBoundingClientRect().top + scrollY }));
        if (ink) { touchCanvas.width = Math.round(viewport.width * viewport.dpr); touchCanvas.height = Math.round(viewport.height * viewport.dpr); ink.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0); }
        forest?.resize();
        updateChapter();
    }
    function updateChapter() {
        let next = 'forest';
        for (const section of sectionPositions) if (scroll + viewport.height * .38 >= section.top) next = section.name;
        if (next !== chapter) { chapter = next; body.dataset.chapter = chapter; }
        chapters?.classList.toggle('is-visible', scroll > heroHeight * .74);
        const chapterIndex = Math.max(0, ['about', 'gallery', 'contact'].indexOf(chapter));
        chapters?.style.setProperty('--chapter-flight', `${chapterIndex * 50}px`);
        chapters?.querySelectorAll('[data-chapter-link]').forEach(link => {
            if (link.dataset.chapterLink === chapter) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }

    function addDust(x, y, amount = 2, burst = false) {
        if (motion.paused || !ink || modal?.open) return;
        const color = (chapter === 'gallery' ? worlds[activeWorld] : worlds.forest).rgb.join(',');
        for (let i = 0; i < amount && trails.length < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = burst ? 18 + Math.random() * 44 : 6 + Math.random() * 13;
            trails.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, size: 1 + Math.random() * 2, color });
        }
    }
    document.addEventListener('pointermove', event => {
        pointer.targetX = clamp(event.clientX / viewport.width * 2 - 1, -1, 1);
        pointer.targetY = clamp(event.clientY / viewport.height * 2 - 1, -1, 1);
        if (!finePointer.matches || event.target.closest('input,textarea,select,.hero-motion-toggle')) return;
        if (Math.hypot(event.clientX - pointer.lastX, event.clientY - pointer.lastY) > 13) {
            addDust(event.clientX, event.clientY);
            pointer.lastX = event.clientX; pointer.lastY = event.clientY;
        }
    }, { passive: true });
    document.addEventListener('pointerdown', event => {
        if (event.target.closest('input,textarea,select,.hero-motion-toggle') || motion.paused || modal?.open) return;
        addDust(event.clientX, event.clientY, 14, true);
        if (rings.length < 5) rings.push({ x: event.clientX, y: event.clientY, age: 0 });
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer.targetX = 0; pointer.targetY = 0; });
    addEventListener('scroll', () => { scroll = scrollY; updateChapter(); }, { passive: true });
    addEventListener('resize', measure, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(body);

    function star(x, y, size) {
        ink.beginPath(); ink.moveTo(x, y - size); ink.lineTo(x + size * .24, y - size * .24); ink.lineTo(x + size, y); ink.lineTo(x + size * .24, y + size * .24); ink.lineTo(x, y + size); ink.lineTo(x - size * .24, y + size * .24); ink.lineTo(x - size, y); ink.lineTo(x - size * .24, y - size * .24); ink.closePath(); ink.fill();
    }
    function paintParticles(dt) {
        if (!ink) return;
        ink.clearRect(0, 0, viewport.width, viewport.height);
        if (modal?.open) return;
        const world = chapter === 'gallery' ? activeWorld : 'forest';
        const rgb = worlds[world].rgb.join(',');
        const count = viewport.width < 768 ? 16 : 30;
        for (let i = 0; i < count; i++) {
            const p = ambient[i];
            const x = p.x * viewport.width + Math.sin(elapsed * .22 + p.phase) * 22;
            const y = ((p.y + elapsed * p.speed * (world === 'ocean' ? -.32 : .32)) % 1 + 1) % 1 * viewport.height;
            const alpha = .08 + (Math.sin(elapsed * .7 + p.phase) + 1) * .07;
            ink.fillStyle = `rgba(${rgb},${alpha})`;
            if (world === 'blossom') {
                ink.save(); ink.translate(x, y); ink.rotate(elapsed * .3 + p.phase);
                ink.beginPath(); ink.ellipse(0, 0, p.size * 1.6, p.size * 3, .4, 0, Math.PI * 2); ink.fill(); ink.restore();
            } else if (world === 'ocean') {
                ink.strokeStyle = `rgba(${rgb},${alpha})`; ink.lineWidth = .65;
                ink.beginPath(); ink.arc(x, y, p.size * 2, 0, Math.PI * 2); ink.stroke();
            } else if (world === 'starlight' && i % 3 === 0) star(x, y, p.size * 2.5);
            else { ink.beginPath(); ink.arc(x, y, p.size, 0, Math.PI * 2); ink.fill(); }
        }
        for (let i = trails.length - 1; i >= 0; i--) {
            const p = trails[i]; p.life -= dt * .85; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += dt * 9;
            if (p.life <= 0) { trails.splice(i, 1); continue; }
            ink.fillStyle = `rgba(${p.color},${p.life * .7})`;
            star(p.x, p.y, p.size * (p.life + .3));
        }
        for (let i = rings.length - 1; i >= 0; i--) {
            const ring = rings[i]; ring.age += dt;
            if (ring.age >= .9) { rings.splice(i, 1); continue; }
            ink.strokeStyle = `rgba(${rgb},${(1 - ring.age / .9) * .3})`; ink.lineWidth = 1;
            ink.beginPath(); ink.arc(ring.x, ring.y, 6 + ring.age * 42, 0, Math.PI * 2); ink.stroke();
        }
    }

    // Two textured planes at different depths and a 3D field of fireflies.
    // Native WebGL keeps the scene small and avoids a runtime framework/CDN dependency.
    async function createForest() {
        if (!scene) return null;
        const canvas = document.createElement('canvas');
        canvas.className = 'forest-depth-canvas'; canvas.setAttribute('aria-hidden', 'true');
        const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
        if (!gl) { hero.dataset.forestRenderer = 'fallback'; return null; }
        const images = await Promise.all([loadImage('assets/img/forest-distant.webp'), loadImage('assets/img/forest-canopy.webp')]);
        if (!scene.isConnected) return null;
        scene.prepend(canvas);
        const focal = 1 / Math.tan(Math.PI / 8);
        let planeProgram, pointProgram, quad, pointBuffer, textures, planeLocations, pointLocations;
        let ready = false;
        let width = 1, height = 1, aspect = 1, dpr = 1;
        const pointCount = innerWidth < 768 ? 35 : 70;
        const pointData = new Float32Array(pointCount * 4);
        for (let i = 0; i < pointCount; i++) pointData.set([(random() * 2 - 1) * 1.2, random() * 2 - 1, 3.5 + random() * 5, random() * Math.PI * 2], i * 4);
        function shader(type, source) {
            const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('Forest shader unavailable'); }
            return shader;
        }
        function program(vertex, fragment) {
            const p = gl.createProgram(); const v = shader(gl.VERTEX_SHADER, vertex); const f = shader(gl.FRAGMENT_SHADER, fragment);
            gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p); gl.deleteShader(v); gl.deleteShader(f);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { gl.deleteProgram(p); throw new Error('Forest program unavailable'); }
            return p;
        }
        function locations(p, names) { return Object.fromEntries(names.map(name => [name, gl.getUniformLocation(p, name)])); }
        function initialize() {
            ready = false;
            planeProgram = program(`
                attribute vec2 aPosition;
                uniform vec2 uHalfSize;
                uniform vec3 uCamera;
                uniform float uDepth, uAspect, uFocal;
                varying vec2 vUV;
                void main() {
                    vec2 p = aPosition * uHalfSize - uCamera.xy;
                    gl_Position = vec4(p.x * uFocal / uAspect, p.y * uFocal, 0.0, uDepth - uCamera.z);
                    vUV = (aPosition + 1.0) * 0.5;
                }`, `
                precision mediump float;
                varying vec2 vUV;
                uniform sampler2D uImage;
                uniform vec2 uLight;
                uniform float uGlow;
                void main() {
                    vec4 image = texture2D(uImage, vUV);
                    float light = max(0.0, 1.0 - length(vUV - uLight) * 1.5);
                    gl_FragColor = vec4(image.rgb * (1.0 + light * uGlow), image.a);
                }`);
            pointProgram = program(`
                attribute vec4 aParticle;
                uniform vec3 uCamera;
                uniform float uTime, uAspect, uFocal, uDPR;
                varying float vAlpha;
                void main() {
                    float phase = aParticle.w;
                    vec3 p = vec3(aParticle.x * uAspect * 3.0 + sin(uTime * .22 + phase) * .12,
                        aParticle.y * 3.1 + sin(uTime * .18 + phase * 1.7) * .18, aParticle.z);
                    float distance = p.z - uCamera.z;
                    gl_Position = vec4((p.x-uCamera.x)*uFocal/uAspect, (p.y-uCamera.y)*uFocal, 0.0, distance);
                    gl_PointSize = clamp(uDPR * (6.0 + sin(phase)*2.0) * uFocal / distance, 1.0, 9.0);
                    vAlpha = .25 + .3 * (sin(uTime * .65 + phase) * .5 + .5);
                }`, `
                precision mediump float;
                varying float vAlpha;
                void main() {
                    float radius = length(gl_PointCoord - .5) * 2.0;
                    float glow = pow(max(0.0, 1.0 - radius), 2.0);
                    gl_FragColor = vec4(1.0, .83, .53, glow * vAlpha);
                }`);
            planeLocations = locations(planeProgram, ['uHalfSize', 'uCamera', 'uDepth', 'uAspect', 'uFocal', 'uImage', 'uLight', 'uGlow']);
            pointLocations = locations(pointProgram, ['uCamera', 'uTime', 'uAspect', 'uFocal', 'uDPR']);
            planeLocations.position = gl.getAttribLocation(planeProgram, 'aPosition');
            pointLocations.position = gl.getAttribLocation(pointProgram, 'aParticle');
            quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
            pointBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer); gl.bufferData(gl.ARRAY_BUFFER, pointData, gl.STATIC_DRAW);
            textures = images.map(image => {
                const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); return texture;
            });
            gl.disable(gl.DEPTH_TEST); gl.clearColor(.065, .035, .10, 1);
            ready = true; resize(); hero.dataset.forestRenderer = 'webgl'; hero.classList.add('has-forest-depth');
        }
        function resize() {
            width = Math.max(hero.clientWidth, 1); height = Math.max(hero.clientHeight, 1); aspect = width / height;
            dpr = Math.min(devicePixelRatio || 1, 1.5);
            canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        function drawPlane(index, depth, camera, px, py) {
            gl.useProgram(planeProgram); gl.bindBuffer(gl.ARRAY_BUFFER, quad);
            gl.enableVertexAttribArray(planeLocations.position); gl.vertexAttribPointer(planeLocations.position, 2, gl.FLOAT, false, 0, 0);
            const halfHeight = depth / focal * Math.max(1, aspect / 1.5) * 1.045;
            gl.uniform2f(planeLocations.uHalfSize, halfHeight * 1.5, halfHeight);
            gl.uniform3fv(planeLocations.uCamera, camera); gl.uniform1f(planeLocations.uDepth, depth); gl.uniform1f(planeLocations.uAspect, aspect); gl.uniform1f(planeLocations.uFocal, focal);
            gl.uniform2f(planeLocations.uLight, .5 + px * .12, .55 - py * .12); gl.uniform1f(planeLocations.uGlow, index ? .075 : .035);
            gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, textures[index]); gl.uniform1i(planeLocations.uImage, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6); gl.disableVertexAttribArray(planeLocations.position);
        }
        function render(time, progress, px, py) {
            if (!ready || !scene.isConnected) return;
            const camera = [px * .19, -py * .11 + progress * .08, progress * .7];
            gl.clear(gl.COLOR_BUFFER_BIT); gl.disable(gl.BLEND); drawPlane(0, 8, camera, px, py);
            gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            gl.useProgram(pointProgram); gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
            gl.enableVertexAttribArray(pointLocations.position); gl.vertexAttribPointer(pointLocations.position, 4, gl.FLOAT, false, 0, 0);
            gl.uniform3fv(pointLocations.uCamera, camera); gl.uniform1f(pointLocations.uTime, time); gl.uniform1f(pointLocations.uAspect, aspect); gl.uniform1f(pointLocations.uFocal, focal); gl.uniform1f(pointLocations.uDPR, dpr);
            gl.drawArrays(gl.POINTS, 0, pointCount); gl.disableVertexAttribArray(pointLocations.position);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); drawPlane(1, 4.8, camera, px, py);
        }
        canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); ready = false; hero.classList.remove('has-forest-depth'); hero.dataset.forestRenderer = 'fallback'; });
        canvas.addEventListener('webglcontextrestored', () => { try { initialize(); render(elapsed, 0, 0, 0); } catch (_) { hero.classList.remove('has-forest-depth'); } });
        initialize(); render(0, 0, 0, 0);
        return { render, resize };
    }

    function tick(now) {
        frameID = null;
        if (motion.paused) return;
        if (now - lastFrame < 32) { frameID = requestAnimationFrame(tick); return; }
        const dt = Math.min((now - lastFrame) / 1000 || .033, .08); lastFrame = now; elapsed += dt;
        pointer.x += (pointer.targetX - pointer.x) * .09; pointer.y += (pointer.targetY - pointer.y) * .09;
        const progress = clamp(scroll / heroHeight, 0, 1.2);
        if (!motion.heroPaused) {
            const px = finePointer.matches ? pointer.x : 0;
            const py = finePointer.matches ? pointer.y : 0;
            forest?.render(elapsed, progress, px, py);
            fairy?.style.setProperty('--fairy-x', `${px * 15 + progress * (viewport.width < 768 ? 38 : 115)}px`);
            fairy?.style.setProperty('--fairy-y', `${py * 8 - progress * 43}px`);
            fairy?.style.setProperty('--fairy-lean', `${px * 2}deg`);
        }
        paintParticles(dt);
        frameID = requestAnimationFrame(tick);
    }
    function syncMotion(event) {
        motion = event?.detail || window.numenMotion || motion;
        if (motion.paused) {
            if (frameID !== null) cancelAnimationFrame(frameID);
            frameID = null;
            ink?.clearRect(0, 0, viewport.width, viewport.height);
            trails.length = 0; rings.length = 0;
            document.querySelector('#nailPhotoStage')?.getAnimations().forEach(animation => animation.finish());
            if (motion.reduced) forest?.render(0, 0, 0, 0);
        } else if (frameID === null) { lastFrame = performance.now(); frameID = requestAnimationFrame(tick); }
    }
    document.addEventListener('numen:motionchange', syncMotion);
    measure(); selectWorld('forest'); syncMotion();
    createForest().then(result => { forest = result; if (forest) { forest.resize(); forest.render(0, 0, 0, 0); } }).catch(() => { hero.dataset.forestRenderer = 'fallback'; hero.classList.remove('has-forest-depth'); });
})();
