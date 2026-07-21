/* Navbar shrink-on-scroll, mobile menu, magnetic buttons, theme toggle */
(function () {
  const nav = document.querySelector('.navbar');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Magnetic effect
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - r.left - r.width / 2;
      const relY = e.clientY - r.top - r.height / 2;
      if (window.gsap) {
        gsap.to(el, { x: relX * 0.35, y: relY * 0.35, duration: 0.4, ease: 'power2.out' });
      }
    });
    el.addEventListener('mouseleave', () => {
      if (window.gsap) gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });

  // Theme toggle (day/night)
  const themeBtn = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const stored = localStorage.getItem('jk-theme');
  if (stored) root.setAttribute('data-theme', stored);
  const setIcon = () => {
    themeBtn.textContent = root.getAttribute('data-theme') === 'light' ? '🌙' : '☀️';
  };
  setIcon();
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    if (next === 'dark') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'light');
    localStorage.setItem('jk-theme', next);
    setIcon();
  });

  // Mobile hamburger menu
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  hamburger?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('mobile-open');
    hamburger.classList.toggle('open', open);
  });
  navLinks?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    navLinks.classList.remove('mobile-open');
    hamburger.classList.remove('open');
  }));

  // Smooth in-page anchor scroll (works with or without Lenis)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (window.lenis) window.lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();
