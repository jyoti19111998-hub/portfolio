/* Custom cursor: glow dot + trailing ring + spotlight + click ripple + particle trail */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  const spotlight = document.createElement('div');
  spotlight.className = 'spotlight';
  document.body.append(spotlight, ring, dot);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    spotlight.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;

    const target = e.target.closest('a, button, .magnetic, [data-cursor-hover]');
    ring.classList.toggle('is-hover', !!target);
  });

  function raf() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(raf);
  }
  raf();

  window.addEventListener('mousedown', () => ring.classList.add('is-click'));
  window.addEventListener('mouseup', () => ring.classList.remove('is-click'));

  // Click ripple
  window.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position:fixed; left:${e.clientX}px; top:${e.clientY}px; width:8px; height:8px;
      border:1.5px solid var(--purple-2); border-radius:50%; transform:translate(-50%,-50%);
      pointer-events:none; z-index:997;`;
    document.body.appendChild(ripple);
    if (window.gsap) {
      gsap.to(ripple, { width: 90, height: 90, opacity: 0, duration: .6, ease: 'power2.out', onComplete: () => ripple.remove() });
    } else {
      ripple.remove();
    }
  });

  // Subtle particle trail
  let last = 0;
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - last < 40) return;
    last = now;
    const p = document.createElement('div');
    const size = 3 + Math.random() * 3;
    p.style.cssText = `
      position:fixed; left:${e.clientX}px; top:${e.clientY}px; width:${size}px; height:${size}px;
      border-radius:50%; background:radial-gradient(circle, var(--cyan), transparent);
      pointer-events:none; z-index:996; transform:translate(-50%,-50%);`;
    document.body.appendChild(p);
    if (window.gsap) {
      gsap.to(p, {
        x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 40 + 20,
        opacity: 0, duration: .9, ease: 'power1.out', onComplete: () => p.remove(),
      });
    } else {
      setTimeout(() => p.remove(), 500);
    }
  });
})();
