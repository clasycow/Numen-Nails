(() => {
    const preloader = document.querySelector('#enchantedPreloader');
    const progressBar = document.querySelector('#preloaderProgress');
    const progressTrack = preloader?.querySelector('.preloader-progress');
    const progressPercent = document.querySelector('#preloaderPercent');
    const progressCopy = document.querySelector('#preloaderCopy');

    if (!preloader || !progressBar) {
        document.body.classList.remove('is-loading');
        return;
    }

    const loadingPhrases = [
        'Awakening the forest',
        'Gathering moonlight',
        'Waking the fireflies',
        'Opening the enchanted forest',
    ];
    let visualProgress = 0;
    let hasFinished = false;

    const paintProgress = (value) => {
        const safeValue = Math.min(Math.max(Math.round(value), 0), 100);
        progressBar.style.width = `${safeValue}%`;
        progressTrack?.setAttribute('aria-valuenow', String(safeValue));
        if (progressPercent) progressPercent.textContent = `${safeValue}%`;

        if (progressCopy) {
            const phraseIndex = Math.min(
                Math.floor(safeValue / 26),
                loadingPhrases.length - 1
            );
            progressCopy.textContent = loadingPhrases[phraseIndex];
        }
    };

    const loadingInterval = window.setInterval(() => {
        if (visualProgress >= 88 || hasFinished) return;
        visualProgress += Math.max(1, (88 - visualProgress) * 0.075);
        paintProgress(visualProgress);
    }, 90);

    const finishPreloader = () => {
        if (hasFinished) return;
        hasFinished = true;
        window.clearInterval(loadingInterval);
        paintProgress(100);

        window.setTimeout(() => {
            preloader.classList.add('is-complete');
            preloader.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('is-loading');
        }, 360);
    };

    if (document.readyState === 'complete') {
        finishPreloader();
    } else {
        window.addEventListener('load', finishPreloader, { once: true });
    }

    window.setTimeout(finishPreloader, 5200);
})();

window.addEventListener('DOMContentLoaded', async () => {
    if (window.numenCatalogReady) await window.numenCatalogReady;
    const root = document.documentElement;
    const masthead = document.querySelector('.masthead');
    const aboutSection = document.querySelector('.about-section');
    const aboutCard = document.querySelector('.about-card');
    const projectsSection = document.querySelector('.nail-portfolio');
    const projectRevealElements = document.querySelectorAll('.projects-reveal');
    const endingRevealElements = document.querySelectorAll('.ending-reveal');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const navbarShrink = () => {
        const navbar = document.body.querySelector('#mainNav');
        if (!navbar) return;
        navbar.classList.toggle('navbar-shrink', window.scrollY !== 0);
    };

    navbarShrink();

    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav && window.bootstrap) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    }

    const navbarToggler = document.body.querySelector('.navbar-toggler');
    document.querySelectorAll('#navbarResponsive .nav-link').forEach((item) => {
        item.addEventListener('click', () => {
            if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    if (aboutCard) {
        if ('IntersectionObserver' in window && !reduceMotion.matches) {
            const revealAbout = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.18,
                rootMargin: '0px 0px -8% 0px',
            });

            revealAbout.observe(aboutCard);
        } else {
            aboutCard.classList.add('is-visible');
        }
    }

    if (projectRevealElements.length) {
        if ('IntersectionObserver' in window && !reduceMotion.matches) {
            const revealProjects = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -6% 0px',
            });

            projectRevealElements.forEach((element) => revealProjects.observe(element));
        } else {
            projectRevealElements.forEach((element) => element.classList.add('is-visible'));
        }
    }

    if (endingRevealElements.length) {
        if ('IntersectionObserver' in window && !reduceMotion.matches) {
            const revealEnding = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -7% 0px',
            });

            endingRevealElements.forEach((element) => revealEnding.observe(element));
        } else {
            endingRevealElements.forEach((element) => element.classList.add('is-visible'));
        }
    }

    const sparkField = document.querySelector('.spark-field');
    if (sparkField) {
        const sparkCount = window.innerWidth < 768 ? 14 : 24;
        const fragment = document.createDocumentFragment();

        for (let index = 0; index < sparkCount; index += 1) {
            const spark = document.createElement('span');
            const size = 2 + Math.random() * 3.5;

            spark.className = 'forest-spark';
            spark.style.setProperty('--spark-left', `${3 + Math.random() * 94}%`);
            spark.style.setProperty('--spark-top', `${5 + Math.random() * 88}%`);
            spark.style.setProperty('--spark-size', `${size.toFixed(1)}px`);
            spark.style.setProperty('--spark-duration', `${5 + Math.random() * 6}s`);
            spark.style.setProperty('--spark-delay', `${-Math.random() * 10}s`);
            spark.style.setProperty('--spark-drift', `${-24 + Math.random() * 48}px`);
            spark.style.setProperty('--spark-opacity', `${0.4 + Math.random() * 0.55}`);
            fragment.appendChild(spark);
        }

        sparkField.appendChild(fragment);
    }

    if (aboutCard && window.matchMedia('(pointer: fine)').matches && !reduceMotion.matches) {
        aboutCard.addEventListener('pointermove', (event) => {
            const bounds = aboutCard.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;

            aboutCard.style.setProperty('--card-glow-x', `${(x * 100).toFixed(1)}%`);
            aboutCard.style.setProperty('--card-glow-y', `${(y * 100).toFixed(1)}%`);
            aboutCard.style.setProperty('--card-tilt-x', `${((0.5 - y) * 2.4).toFixed(2)}deg`);
            aboutCard.style.setProperty('--card-tilt-y', `${((x - 0.5) * 2.8).toFixed(2)}deg`);
        });

        aboutCard.addEventListener('pointerleave', () => {
            aboutCard.style.setProperty('--card-glow-x', '50%');
            aboutCard.style.setProperty('--card-glow-y', '50%');
            aboutCard.style.setProperty('--card-tilt-x', '0deg');
            aboutCard.style.setProperty('--card-tilt-y', '0deg');
        });
    }

    const nailGallery = document.querySelector('#nailGallery');
    const galleryFilters = document.querySelectorAll('.gallery-filter');
    const galleryCards = nailGallery ? Array.from(nailGallery.querySelectorAll('.nail-card')) : [];
    const setCards = galleryCards.filter((card) => !card.classList.contains('nail-card-callout'));
    const photosByCard = new Map(setCards.map((card) => {
        const template = card.querySelector('.nail-set-photos');
        const photos = template
            ? Array.from(template.content.querySelectorAll('img'))
            : Array.from(card.querySelectorAll('.nail-card__photo'));
        const count = card.querySelector('.nail-set-count');
        if (count) count.textContent = `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'}`;
        card.querySelectorAll('[data-open-set]').forEach((button) => {
            const photoLabel = photos.length === 1 ? 'photo' : `all ${photos.length} photos`;
            button.setAttribute('aria-label', `View ${photoLabel} of ${card.dataset.title}`);
        });
        return [card, photos];
    }));
    const galleryCount = document.querySelector('.gallery-count');
    const galleryExpansion = document.querySelector('#galleryExpansion');
    const galleryToggle = document.querySelector('#galleryToggle');
    const galleryToggleLabel = galleryToggle?.querySelector('.gallery-toggle-label');
    const gallerySummary = document.querySelector('#gallerySummary');
    const requestedPreviewCount = Number(nailGallery?.dataset.collapsedCount);
    const previewCount = Number.isInteger(requestedPreviewCount) && requestedPreviewCount > 0
        ? requestedPreviewCount
        : 6;
    let galleryExpanded = false;
    let selectedGalleryFilter = 'all';

    const matchingSets = () => setCards.filter((card) => (
        selectedGalleryFilter === 'all'
        || (card.dataset.category || '').split(' ').includes(selectedGalleryFilter)
    ));

    const renderGallery = () => {
        const matching = matchingSets();
        // If the expansion control is absent, keep every matching set available.
        const visible = galleryExpanded || !galleryToggle ? matching : matching.slice(0, previewCount);
        const visibleSet = new Set(visible);
        setCards.forEach((card) => { card.hidden = !visibleSet.has(card); });

        if (galleryCount) {
            galleryCount.textContent = `${matching.length} ${matching.length === 1 ? 'set' : 'sets'}`;
        }
        if (gallerySummary) {
            gallerySummary.textContent = `Showing ${visible.length} of ${matching.length} sets`;
        }
        if (galleryExpansion) galleryExpansion.hidden = matching.length <= previewCount;
        if (galleryToggle) galleryToggle.setAttribute('aria-expanded', String(galleryExpanded));
        if (galleryToggleLabel) {
            galleryToggleLabel.textContent = galleryExpanded
                ? 'Show fewer'
                : `Show all ${matching.length} sets`;
        }
    };

    // These handlers remain ready for use if the commented toolbar is restored.
    galleryFilters.forEach((button) => {
        button.addEventListener('click', () => {
            selectedGalleryFilter = button.dataset.filter || 'all';
            galleryExpanded = false;
            galleryFilters.forEach((filterButton) => {
                const isSelected = filterButton === button;
                filterButton.classList.toggle('is-active', isSelected);
                filterButton.setAttribute('aria-pressed', String(isSelected));
            });
            renderGallery();
        });
    });

    galleryToggle?.addEventListener('click', () => {
        galleryExpanded = !galleryExpanded;
        renderGallery();

        if (galleryExpanded) {
            const firstNewSet = matchingSets()[previewCount];
            firstNewSet?.querySelector('.nail-card__open')?.focus({ preventScroll: true });
            firstNewSet?.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        } else {
            // Keep the control in view when the long gallery contracts above it.
            galleryToggle.focus({ preventScroll: true });
            galleryToggle.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        }
    });

    renderGallery();

    const endingFireflies = document.querySelector('.ending-fireflies');
    if (endingFireflies) {
        const fireflyCount = window.innerWidth < 768 ? 18 : 34;
        const fragment = document.createDocumentFragment();

        for (let index = 0; index < fireflyCount; index += 1) {
            const firefly = document.createElement('span');
            const size = 1.5 + Math.random() * 3;

            firefly.className = 'ending-firefly';
            firefly.style.setProperty('--firefly-x', `${2 + Math.random() * 96}%`);
            firefly.style.setProperty('--firefly-y', `${4 + Math.random() * 91}%`);
            firefly.style.setProperty('--firefly-size', `${size.toFixed(1)}px`);
            firefly.style.setProperty('--firefly-speed', `${4.5 + Math.random() * 6}s`);
            firefly.style.setProperty('--firefly-delay', `${-Math.random() * 8}s`);
            firefly.style.setProperty('--firefly-drift', `${-32 + Math.random() * 64}px`);
            firefly.style.setProperty('--firefly-opacity', `${0.45 + Math.random() * 0.5}`);
            fragment.appendChild(firefly);
        }

        endingFireflies.appendChild(fragment);
    }

    const moonletterForm = document.querySelector('#moonletterForm');
    const moonletterEmail = document.querySelector('#moonletterEmail');
    const moonletterStatus = document.querySelector('#moonletterStatus');

    if (moonletterForm && moonletterEmail && moonletterStatus) {
        moonletterEmail.addEventListener('input', () => {
            moonletterEmail.removeAttribute('aria-invalid');
            moonletterStatus.textContent = '';
            moonletterStatus.classList.remove('is-error');
        });

        moonletterForm.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!moonletterEmail.checkValidity()) {
                moonletterEmail.setAttribute('aria-invalid', 'true');
                moonletterStatus.textContent = 'Please enter a valid email address.';
                moonletterStatus.classList.add('is-error');
                moonletterEmail.focus();
                return;
            }

            const submitButton = moonletterForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = 'Sending a little magic <i class="fas fa-sparkles" aria-hidden="true"></i>';
            }

            window.setTimeout(() => {
                moonletterStatus.textContent = 'The moonletter is ready ✦ Connect your mailing-list service before publishing.';
                moonletterStatus.classList.remove('is-error');
                moonletterForm.reset();

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Enter the circle <i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i>';
                }
            }, reduceMotion.matches ? 0 : 650);
        });
    }

    const bookingForm = document.querySelector('#bookingForm');
    const bookingMessage = document.querySelector('#bookingMessage');
    const messageCount = document.querySelector('#messageCount');
    const bookingStatus = document.querySelector('#bookingStatus');

    if (bookingMessage && messageCount) {
        const updateMessageCount = () => {
            messageCount.textContent = String(bookingMessage.value.length);
        };

        bookingMessage.addEventListener('input', updateMessageCount);
        updateMessageCount();
    }

    if (bookingForm && bookingStatus) {
        const requiredFields = Array.from(bookingForm.querySelectorAll('[required]'));
        const photoInput = bookingForm.querySelector('#visionPhotos');
        const photoPreviews = bookingForm.querySelector('#visionPreviews');
        const startedAtInput = bookingForm.querySelector('#inquiryStartedAt');
        const submitButton = bookingForm.querySelector('.enchanted-submit');
        const challenge = bookingForm.querySelector('#inquiryChallenge');
        const maxPhotos = 5;
        const maxPhotoBytes = 4 * 1024 * 1024;
        const acceptedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
        let selectedPhotos = [];
        let turnstileWidgetId = null;

        if (startedAtInput) startedAtInput.value = String(Date.now());

        const turnstileSiteKey = window.NUMEN_CONFIG?.turnstileSiteKey?.trim();
        const renderTurnstile = () => {
            if (!challenge || !turnstileSiteKey || !window.turnstile || turnstileWidgetId !== null) return;
            turnstileWidgetId = window.turnstile.render(challenge, {
                sitekey: turnstileSiteKey,
                theme: 'dark',
                size: 'flexible',
            });
        };

        if (turnstileSiteKey) {
            const turnstileTimer = window.setInterval(() => {
                renderTurnstile();
                if (turnstileWidgetId !== null) window.clearInterval(turnstileTimer);
            }, 250);
            window.setTimeout(() => window.clearInterval(turnstileTimer), 10000);
        } else if (challenge) {
            challenge.hidden = true;
        }

        const updatePhotoInput = () => {
            if (!photoInput || typeof DataTransfer === 'undefined') return;
            const transfer = new DataTransfer();
            selectedPhotos.forEach((file) => transfer.items.add(file));
            photoInput.files = transfer.files;
        };

        const renderPhotoPreviews = () => {
            if (!photoPreviews) return;
            photoPreviews.replaceChildren();
            selectedPhotos.forEach((file, index) => {
                const item = document.createElement('div');
                item.className = 'vision-preview';

                const image = document.createElement('img');
                image.alt = `Selected inspiration ${index + 1}`;
                image.src = URL.createObjectURL(file);
                image.addEventListener('load', () => URL.revokeObjectURL(image.src), { once: true });

                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'vision-preview__remove';
                remove.setAttribute('aria-label', `Remove ${file.name}`);
                remove.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>';
                remove.addEventListener('click', () => {
                    selectedPhotos.splice(index, 1);
                    updatePhotoInput();
                    renderPhotoPreviews();
                    bookingStatus.textContent = '';
                    bookingStatus.classList.remove('is-error');
                });

                item.append(image, remove);
                photoPreviews.append(item);
            });

            if (selectedPhotos.length) {
                const count = document.createElement('p');
                count.className = 'vision-preview-count';
                count.textContent = `${selectedPhotos.length} of ${maxPhotos} photos selected`;
                photoPreviews.append(count);
            }
        };

        photoInput?.addEventListener('change', () => {
            const incoming = Array.from(photoInput.files || []);
            const invalid = incoming.find((file) => !acceptedPhotoTypes.has(file.type) || file.size > maxPhotoBytes);
            if (invalid) {
                photoInput.value = '';
                bookingStatus.textContent = 'Each photo must be a JPG, PNG, or WebP under 4 MB.';
                bookingStatus.classList.add('is-error');
                return;
            }
            if (incoming.length > maxPhotos) {
                photoInput.value = '';
                bookingStatus.textContent = 'You can add up to five inspiration photos.';
                bookingStatus.classList.add('is-error');
                return;
            }
            selectedPhotos = incoming;
            bookingStatus.textContent = '';
            bookingStatus.classList.remove('is-error');
            renderPhotoPreviews();
        });

        requiredFields.forEach((field) => {
            field.addEventListener('input', () => {
                field.removeAttribute('aria-invalid');
                bookingStatus.textContent = '';
                bookingStatus.classList.remove('is-error');
            });

            field.addEventListener('change', () => {
                field.removeAttribute('aria-invalid');
            });
        });

        bookingForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const invalidField = requiredFields.find((field) => !field.checkValidity());
            if (invalidField) {
                requiredFields.forEach((field) => {
                    field.setAttribute('aria-invalid', String(!field.checkValidity()));
                });
                bookingStatus.textContent = invalidField.id === 'bookingAgreement'
                    ? 'Please read and agree to the appointment policies before sending your inquiry.'
                    : 'A few details still need your magic before this can be sent.';
                bookingStatus.classList.add('is-error');
                invalidField.focus();
                return;
            }

            bookingStatus.classList.remove('is-error');
            bookingStatus.textContent = 'Sending your vision through the forest…';
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.classList.add('is-sending');
            }

            try {
                const response = await fetch(bookingForm.action, {
                    method: 'POST',
                    body: new FormData(bookingForm),
                    headers: { Accept: 'application/json' },
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.message || 'Your vision could not be delivered right now.');

                bookingStatus.textContent = result.message || 'Your vision has been sent ✦';
                document.dispatchEvent(new CustomEvent('numen:inquiry-sent', {detail:result}));
                bookingForm.reset();
                selectedPhotos = [];
                renderPhotoPreviews();
                if (startedAtInput) startedAtInput.value = String(Date.now());
                if (messageCount) messageCount.textContent = '0';
                if (turnstileWidgetId !== null && window.turnstile) window.turnstile.reset(turnstileWidgetId);
            } catch (error) {
                bookingStatus.textContent = error.message || 'Something interrupted the magic. Please try again.';
                bookingStatus.classList.add('is-error');
                if (turnstileWidgetId !== null && window.turnstile) window.turnstile.reset(turnstileWidgetId);
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.classList.remove('is-sending');
                }
            }
        });
    }

    const currentYear = document.querySelector('#currentYear');
    if (currentYear) currentYear.textContent = String(new Date().getFullYear());

    if (galleryCards.length && !document.body.classList.contains('page-enchanted') && window.matchMedia('(pointer: fine)').matches && !reduceMotion.matches) {
        galleryCards.forEach((card) => {
            const cardInner = card.querySelector('.nail-card-inner');
            if (!cardInner) return;

            card.addEventListener('pointermove', (event) => {
                const bounds = card.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width;
                const y = (event.clientY - bounds.top) / bounds.height;

                cardInner.style.setProperty('--nail-tilt-x', `${((0.5 - y) * 1.8).toFixed(2)}deg`);
                cardInner.style.setProperty('--nail-tilt-y', `${((x - 0.5) * 2.2).toFixed(2)}deg`);
            });

            card.addEventListener('pointerleave', () => {
                cardInner.style.setProperty('--nail-tilt-x', '0deg');
                cardInner.style.setProperty('--nail-tilt-y', '0deg');
            });
        });
    }

    const nailModal = document.querySelector('#nailModal');
    const nailModalPhoto = document.querySelector('#nailModalPhoto');
    const nailPhotoStage = document.querySelector('#nailPhotoStage');
    const nailPhotoCounter = document.querySelector('#nailPhotoCounter');
    const nailPhotoPrevious = document.querySelector('#nailPhotoPrevious');
    const nailPhotoNext = document.querySelector('#nailPhotoNext');
    const nailPhotoThumbnails = document.querySelector('#nailPhotoThumbnails');
    const nailModalTitle = document.querySelector('#nailModalTitle');
    const nailModalService = document.querySelector('#nailModalService');
    const nailModalDescription = document.querySelector('#nailModalDescription');
    const nailModalClose = document.querySelector('.nail-modal__close');
    let activeSetPhotos = [];
    let activePhotoIndex = 0;
    let modalTrigger = null;
    let swipeStart = null;

    const showSetPhoto = (index) => {
        if (!nailModalPhoto || !activeSetPhotos.length) return;
        activePhotoIndex = (index + activeSetPhotos.length) % activeSetPhotos.length;
        const source = activeSetPhotos[activePhotoIndex];
        nailModalPhoto.src = source.getAttribute('src');
        nailModalPhoto.alt = source.alt;
        nailModalPhoto.width = source.width;
        nailModalPhoto.height = source.height;
        nailModalPhoto.dataset.rotation = source.dataset.rotation || '0';
        if (nailPhotoCounter) {
            nailPhotoCounter.textContent = `Photo ${activePhotoIndex + 1} of ${activeSetPhotos.length}`;
        }
        nailPhotoThumbnails?.querySelectorAll('button').forEach((thumbnail, thumbnailIndex) => {
            thumbnail.setAttribute('aria-pressed', String(thumbnailIndex === activePhotoIndex));
        });
    };

    const restoreModalFocus = () => {
        swipeStart = null;
        if (modalTrigger?.isConnected) modalTrigger.focus({ preventScroll: true });
    };

    const closeNailModal = () => {
        if (!nailModal) return;

        if (typeof nailModal.close === 'function') {
            nailModal.close();
        } else {
            nailModal.removeAttribute('open');
            restoreModalFocus();
        }
    };

    document.querySelectorAll('[data-open-set]').forEach((button) => {
        button.addEventListener('click', () => {
            if (!nailModal || !nailModalPhoto) return;

            const card = button.closest('.nail-card');
            activeSetPhotos = photosByCard.get(card) || [];
            if (!activeSetPhotos.length) return;
            modalTrigger = button;

            if (nailModalTitle) nailModalTitle.textContent = card?.dataset.title || 'Nail Set';
            if (nailModalService) nailModalService.textContent = card?.dataset.service || 'Custom nail artistry';
            if (nailModalDescription) {
                nailModalDescription.textContent = card?.dataset.description || 'Ask about creating a custom version of this set.';
            }

            if (nailPhotoThumbnails) {
                nailPhotoThumbnails.replaceChildren();
                nailPhotoThumbnails.setAttribute('aria-label', `Photos of ${card.dataset.title}`);
                activeSetPhotos.forEach((source, index) => {
                    const thumbnail = document.createElement('button');
                    thumbnail.type = 'button';
                    thumbnail.className = 'nail-photo-thumbnail';
                    thumbnail.setAttribute('aria-label', `Show photo ${index + 1} of ${activeSetPhotos.length}: ${source.alt}`);
                    thumbnail.setAttribute('aria-controls', 'nailModalPhoto');
                    const photo = source.cloneNode();
                    photo.alt = '';
                    thumbnail.append(photo);
                    thumbnail.addEventListener('click', () => showSetPhoto(index));
                    nailPhotoThumbnails.append(thumbnail);
                });
                nailPhotoThumbnails.hidden = activeSetPhotos.length < 2;
            }
            if (nailPhotoPrevious) nailPhotoPrevious.disabled = activeSetPhotos.length < 2;
            if (nailPhotoNext) nailPhotoNext.disabled = activeSetPhotos.length < 2;
            showSetPhoto(0);

            if (typeof nailModal.showModal === 'function') {
                nailModal.showModal();
            } else {
                nailModal.setAttribute('open', '');
            }
            nailModal.scrollTop = 0;
            if (nailPhotoThumbnails) nailPhotoThumbnails.scrollLeft = 0;
            nailModalClose?.focus({ preventScroll: true });
        });
    });

    nailPhotoPrevious?.addEventListener('click', () => showSetPhoto(activePhotoIndex - 1));
    nailPhotoNext?.addEventListener('click', () => showSetPhoto(activePhotoIndex + 1));

    // Keep vertical scrolling available while swiping horizontally between photos.
    nailPhotoStage?.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' || !event.isPrimary) return;
        swipeStart = { x: event.clientX, y: event.clientY };
        nailPhotoStage.setPointerCapture(event.pointerId);
    });
    nailPhotoStage?.addEventListener('pointerup', (event) => {
        if (!swipeStart) return;
        const deltaX = event.clientX - swipeStart.x;
        const deltaY = event.clientY - swipeStart.y;
        swipeStart = null;
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
            showSetPhoto(activePhotoIndex + (deltaX < 0 ? 1 : -1));
        }
    });
    nailPhotoStage?.addEventListener('pointercancel', () => { swipeStart = null; });

    if (nailModalClose) {
        nailModalClose.addEventListener('click', closeNailModal);
    }

    if (nailModal) {
        nailModal.addEventListener('close', restoreModalFocus);
        nailModal.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                showSetPhoto(activePhotoIndex + (event.key === 'ArrowRight' ? 1 : -1));
            } else if (event.key === 'Escape') {
                event.preventDefault();
                closeNailModal();
            }
        });
        nailModal.addEventListener('click', (event) => {
            if (event.target === nailModal) closeNailModal();
        });

        nailModal.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', closeNailModal);
        });
    }

    let animationFrame = null;

    const updateScene = () => {
        animationFrame = null;
        navbarShrink();

        if (reduceMotion.matches) {
            root.style.setProperty('--hero-scroll', '0');
            root.style.setProperty('--about-scroll', '0');
            root.style.setProperty('--masthead-shift', '0px');
            root.style.setProperty('--hero-content-shift', '0px');
            root.style.setProperty('--hero-content-opacity', '1');
            root.style.setProperty('--about-shift', '0px');
            root.style.setProperty('--about-curve-shift', '0px');
            return;
        }

        const viewportHeight = Math.max(window.innerHeight, 1);
        const heroProgress = Math.min(Math.max(window.scrollY / viewportHeight, 0), 1.15);

        root.style.setProperty('--hero-scroll', heroProgress.toFixed(3));
        root.style.setProperty('--masthead-shift', `${(heroProgress * 28).toFixed(1)}px`);
        root.style.setProperty('--hero-content-shift', `${(heroProgress * -19).toFixed(1)}px`);
        root.style.setProperty('--hero-content-opacity', `${(1 - heroProgress * 0.43).toFixed(3)}`);

        if (aboutSection) {
            const aboutBounds = aboutSection.getBoundingClientRect();
            const aboutProgress = Math.min(
                Math.max((viewportHeight - aboutBounds.top) / (viewportHeight + aboutBounds.height), 0),
                1
            );

            root.style.setProperty('--about-scroll', aboutProgress.toFixed(3));
            root.style.setProperty('--about-shift', `${((aboutProgress - 0.35) * 24).toFixed(1)}px`);
            root.style.setProperty('--about-curve-shift', `${(aboutProgress * -13).toFixed(1)}px`);
        }

        if (projectsSection) {
            const projectBounds = projectsSection.getBoundingClientRect();
            const projectProgress = Math.min(
                Math.max((viewportHeight - projectBounds.top) / (viewportHeight + projectBounds.height), 0),
                1
            );

            root.style.setProperty('--projects-progress', projectProgress.toFixed(3));
        }
    };

    const requestSceneUpdate = () => {
        if (animationFrame === null) {
            animationFrame = window.requestAnimationFrame(updateScene);
        }
    };

    document.addEventListener('scroll', requestSceneUpdate, { passive: true });
    window.addEventListener('resize', requestSceneUpdate, { passive: true });

    if (typeof reduceMotion.addEventListener === 'function') {
        reduceMotion.addEventListener('change', requestSceneUpdate);
    } else if (typeof reduceMotion.addListener === 'function') {
        reduceMotion.addListener(requestSceneUpdate);
    }

    requestSceneUpdate();
});
