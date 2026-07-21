/* Core orchestration: Lenis smooth scroll, GSAP reveals, typing effects, progress line */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Lenis smooth scroll ---------- */
  if (window.Lenis && !prefersReduced) {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, easing: (t) => 1 - Math.pow(1 - t, 3) });
    window.lenis = lenis;
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    document.documentElement.classList.add('has-lenis');
  }

  /* ---------- Scroll progress bar ---------- */
  const progress = document.querySelector('.scroll-progress');
  function updateProgress() {
    const h = document.documentElement;
    const scrolled = h.scrollTop || document.body.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = max > 0 ? (scrolled / max) * 100 + '%' : '0%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  if (window.lenis) window.lenis.on('scroll', updateProgress);
  updateProgress();

  /* ---------- GSAP setup ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Generic reveal: fade + slide up, staggered within a group
    document.querySelectorAll('[data-reveal-group]').forEach((group) => {
      const items = group.querySelectorAll('[data-reveal]');
      gsap.fromTo(items, { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: group, start: 'top 82%' },
      });
    });
    document.querySelectorAll('[data-reveal]:not([data-reveal-group] [data-reveal])').forEach((el) => {
      gsap.fromTo(el, { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });

    // Section heading underline / in-view trigger class
    document.querySelectorAll('section').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec, start: 'top 70%', end: 'bottom 20%',
        onEnter: () => sec.classList.add('in-view'),
        onEnterBack: () => sec.classList.add('in-view'),
      });
    });

    // Image / panel zoom-in on scroll
    document.querySelectorAll('[data-zoom]').forEach((el) => {
      gsap.fromTo(el, { scale: 1.15 }, {
        scale: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });

    // Card tilt-in
    document.querySelectorAll('[data-tilt-in]').forEach((el, i) => {
      gsap.fromTo(el, { rotateZ: i % 2 === 0 ? -2.5 : 2.5, y: 40, opacity: 0 }, {
        rotateZ: 0, y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    // Blur -> sharp on scroll
    document.querySelectorAll('[data-blur-in]').forEach((el) => {
      gsap.fromTo(el, { filter: 'blur(14px)', opacity: 0, y: 24 }, {
        filter: 'blur(0px)', opacity: 1, y: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    // Hero parallax orbs with mouse
    const orbs = document.querySelectorAll('.hero-orb');
    document.querySelector('.hero')?.addEventListener('mousemove', (e) => {
      const { innerWidth: w, innerHeight: h } = window;
      const px = (e.clientX / w - 0.5);
      const py = (e.clientY / h - 0.5);
      orbs.forEach((orb, i) => {
        const depth = (i + 1) * 18;
        gsap.to(orb, { x: px * depth, y: py * depth, duration: 1.2, ease: 'power2.out' });
      });
    });

    // Timeline rail fill tied to scroll of the journey section
    const railFill = document.querySelector('.timeline-rail-fill');
    const timelineWrap = document.querySelector('.timeline-wrap');
    if (railFill && timelineWrap) {
      gsap.to(railFill, {
        height: '100%', ease: 'none',
        scrollTrigger: { trigger: timelineWrap, start: 'top 60%', end: 'bottom 60%', scrub: 0.6 },
      });
    }
    document.querySelectorAll('.tl-node').forEach((node) => {
      ScrollTrigger.create({ trigger: node, start: 'top 65%', onEnter: () => node.classList.add('in-view'), onEnterBack: () => node.classList.add('in-view') });
    });
  }

  /* ---------- Letter-split gradient headings ---------- */
  document.querySelectorAll('[data-split-text]').forEach((el) => {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.textContent = ch === ' ' ? ' ' : ch;
      span.style.transitionDelay = `${i * 18}ms`;
      el.appendChild(span);
    });
    if (window.gsap) {
      gsap.fromTo(el.querySelectorAll('.split-char'), { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.02,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    }
  });

  /* ---------- Typing animation (hero + now section) ---------- */
  function typeLoop(el, words, opts = {}) {
    if (!el || !words || !words.length) return;
    const { typeSpeed = 55, eraseSpeed = 30, pause = 1400 } = opts;
    let wordIndex = 0, charIndex = 0, deleting = false;
    function tick() {
      const word = words[wordIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) { deleting = true; setTimeout(tick, pause); return; }
        setTimeout(tick, typeSpeed);
      } else {
        charIndex--;
        el.textContent = word.slice(0, charIndex);
        if (charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; setTimeout(tick, 400); return; }
        setTimeout(tick, eraseSpeed);
      }
    }
    tick();
  }

  const data = window.PORTFOLIO_DATA;
  typeLoop(document.getElementById('hero-typed'), [
    'legal research automation.',
    'AI contract review systems.',
    'regulatory monitoring pipelines.',
    'agentic legal workflows.',
  ]);
  typeLoop(document.getElementById('now-typed'), data.nowBuilding, { pause: 2200 });

  /* ---------- Mouse-reactive glow on cards ---------- */
  document.querySelectorAll('.service-card, .lib-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* ---------- 3D tilt on project cards ---------- */
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (window.gsap) gsap.to(card, { rotateX: py * -4, rotateY: px * 6, duration: 0.4, ease: 'power2.out', transformPerspective: 800 });
    });
    card.addEventListener('mouseleave', () => {
      if (window.gsap) gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power2.out' });
    });
  });

  /* ---------- Page load veil transition ---------- */
  const veil = document.querySelector('.page-veil');
  if (veil && window.gsap) {
    gsap.to(veil, { opacity: 0, duration: 0.8, delay: 0.15, ease: 'power2.out', onComplete: () => veil.remove() });
  }
})();
