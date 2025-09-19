const disabledMessage = 'Nous sommes désolés, nous ne pouvons pas répondre à votre demande.';

// =====================================
// Media Logos Scroller
// =====================================
function initMediaLogosScroller() {
    const scroller = document.getElementById('media-logos');
    const prev = document.getElementById('media-prev');
    const next = document.getElementById('media-next');
    const fades = document.querySelector('.media-logos-wrap');
    if (!scroller || !prev || !next || !fades) return;

    function updateAffordances() {
        const max = scroller.scrollWidth - scroller.clientWidth - 1;
        const atStart = scroller.scrollLeft <= 1;
        const atEnd = scroller.scrollLeft >= max;
        prev.disabled = atStart;
        next.disabled = atEnd;
        fades.dataset.atStart = atStart;
        fades.dataset.atEnd = atEnd;
    }

    function step() {
        const d = Math.max(scroller.clientWidth * 0.8, 160);
        const smooth = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        return { left: d, behavior: smooth };
    }

    prev.addEventListener('click', () => scroller.scrollBy({ ...step(), left: -step().left }));
    next.addEventListener('click', () => scroller.scrollBy(step()));
    scroller.addEventListener('scroll', updateAffordances, { passive: true });
    window.addEventListener('resize', updateAffordances);
    updateAffordances();

    // keyboard arrows on the strip
    scroller.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); scroller.scrollBy(step()); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); scroller.scrollBy({ ...step(), left: -step().left }); }
    });
}

// =====================================
// Mobile Menu (Hamburger)
// =====================================
function initMobileMenu() {
    const burger = document.querySelector('.hamburger');
    const menu = document.getElementById('site-menu');
    if (!burger || !menu) return;

    const closeOnEscape = (e) => {
        if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
            burger.click();
        }
    };
    const collapseMenu = () => {
        burger.setAttribute('aria-expanded', 'false');
        menu.style.maxHeight = '0px';
        menu.classList.remove('open');
        document.removeEventListener('keydown', closeOnEscape);
    };
    burger.addEventListener('click', () => {
        const open = burger.getAttribute('aria-expanded') === 'true';
        const next = (!open).toString();
        burger.setAttribute('aria-expanded', next);
        // slide animation via max-height
        if (!open) {
            // opening
            menu.classList.add('open');
            menu.style.maxHeight = menu.scrollHeight + 'px';
        } else {
            // closing
            collapseMenu();
        }
        if (!open) {
            document.addEventListener('keydown', closeOnEscape);
        } else {
            document.removeEventListener('keydown', closeOnEscape);
        }
    });

    // Close menu automatically when a link is clicked
    menu.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        if (burger.getAttribute('aria-expanded') === 'true') {
            collapseMenu();
        }
    });
}

// =====================================
// Contact Form Logic
// =====================================
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const concernRadios = form.querySelectorAll('input[name="concern"]');
    const formFieldsToDisable = form.querySelector('.form-fields');
    const messageTextarea = form.querySelector('#message');
    const submitButton = form.querySelector('button[type="submit"]');
    if (!formFieldsToDisable || !messageTextarea || !submitButton || concernRadios.length === 0) return;

    const initialPlaceholder = messageTextarea.placeholder;

    function handleConcernChange() {
        const selectedConcern = form.querySelector('input[name="concern"]:checked');
        if (!selectedConcern) return;

        const value = selectedConcern.value;

        if (value === 'other' || value === 'abuse') {
            formFieldsToDisable.classList.add('disabled');
            messageTextarea.placeholder = disabledMessage;
            messageTextarea.value = '';
            submitButton.disabled = true;
        } else {
            formFieldsToDisable.classList.remove('disabled');
            messageTextarea.placeholder = initialPlaceholder;
            submitButton.disabled = false;
        }
    }

    concernRadios.forEach((radio) => {
        radio.addEventListener('change', handleConcernChange);
    });

    // Initial check in case of pre-filled form
    handleConcernChange();
}

// =====================================
// Hero Carousel
// =====================================
function initHeroCarousel() {
    const slides = [...document.querySelectorAll('.hero-slide')];
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');
    const hero = document.querySelector('.hero');
    if (slides.length === 0 || !prevBtn || !nextBtn) return;

    let i = 0;
    let timer = null;
    const DELAY_MS = 6000;   // typical 5–7s
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const show = (n) => {
        slides[i].classList.remove('is-active');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('is-active');

        prevBtn.classList.remove('hero-1');
        prevBtn.classList.remove('hero-2');
        prevBtn.classList.remove('hero-3');
        nextBtn.classList.remove('hero-1');
        nextBtn.classList.remove('hero-2');
        nextBtn.classList.remove('hero-3');

        let m = (n % 3) + 1;
        if (m == 0) m = 3;
        const cls = `hero-${m}`;
        prevBtn.classList.add(cls);
        nextBtn.classList.add(cls);
    };

    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => {
        if (reduceMotion) return; // respect user setting
        stop();
        timer = setInterval(() => show(i + 1), DELAY_MS);
    };
    const reset = () => { stop(); start(); };

    prevBtn.addEventListener('click', () => { show(i - 1); reset(); });
    nextBtn.addEventListener('click', () => { show(i + 1); reset(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { show(i - 1); reset(); }
        if (e.key === 'ArrowRight') { show(i + 1); reset(); }
    });

    // Pause on hover/focus and when tab is hidden
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

    // kick off
    slides[0].classList.add('is-active');
    // start();
}

// =====================================
// Bootstrapping on DOM Ready
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    initMediaLogosScroller();
    initMobileMenu();
    initContactForm();
    initHeroCarousel();
});
