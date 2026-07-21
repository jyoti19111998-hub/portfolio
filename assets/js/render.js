/* Renders all data-driven repetitive sections from data.js into the DOM. */
(function () {
  const d = window.PORTFOLIO_DATA;
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };

  /* ---------- Hero tags ---------- */
  const heroTags = $('#hero-tags');
  if (heroTags) d.heroTags.forEach((t) => heroTags.appendChild(el('span', 'tag-pill', t)));

  /* ---------- Stats strip ---------- */
  const statsStrip = $('#stats-strip');
  if (statsStrip) d.stats.forEach((s) => {
    const cell = el('div', 'stat-cell', `<div class="stat-num"><span class="grad">${s.num}</span></div><div class="stat-label">${s.label}</div>`);
    statsStrip.appendChild(cell);
  });

  /* ---------- Services ---------- */
  const servicesGrid = $('#services-grid');
  if (servicesGrid) d.services.forEach((s) => {
    const card = el('div', 'glass service-card', `
      <div class="service-icon">${s.icon}</div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
      <div class="service-tags">${s.tags.map((t) => `<span class="mini-tag">${t}</span>`).join('')}</div>
    `);
    card.setAttribute('data-reveal', '');
    servicesGrid.appendChild(card);
  });

  /* ---------- Stack ---------- */
  const stackGrid = $('#stack-grid');
  if (stackGrid) d.stack.forEach((s) => {
    const card = el('div', 'glass stack-card', `<h4>${s.group}</h4><div class="stack-chips">${s.chips.map((c) => `<span class="stack-chip">${c}</span>`).join('')}</div>`);
    card.setAttribute('data-reveal', '');
    stackGrid.appendChild(card);
  });

  /* ---------- Why me ---------- */
  const whyGrid = $('#why-grid');
  if (whyGrid) d.whyMe.forEach((w) => {
    const card = el('div', 'glass why-card', `<div class="why-icon">${w.icon}</div><h3>${w.title}</h3><p>${w.desc}</p>`);
    card.setAttribute('data-reveal', '');
    whyGrid.appendChild(card);
  });

  /* ---------- Journey timeline ---------- */
  const timelineWrap = $('#timeline-wrap');
  if (timelineWrap) {
    const rail = el('div', 'timeline-rail'); rail.innerHTML = '<div class="timeline-rail-fill"></div>';
    timelineWrap.appendChild(rail);
    d.journey.forEach((j) => {
      const node = el('div', 'tl-node', `
        <div class="tl-dot">${j.icon}</div>
        <div class="tl-year">${j.year}</div>
        <div class="tl-title">${j.title}</div>
        <div class="tl-desc">${j.desc}</div>
      `);
      timelineWrap.appendChild(node);
    });
  }

  /* ---------- Philosophy ---------- */
  const philBox = $('#philosophy-box');
  if (philBox) {
    philBox.innerHTML = `<blockquote>"${d.philosophy.quote}"</blockquote><cite>— ${d.person.name}</cite><div class="philosophy-note">${d.philosophy.note}</div>`;
  }

  /* ---------- Research library ---------- */
  const libFilters = $('#lib-filters');
  const libGrid = $('#lib-grid');
  if (libGrid) {
    const tags = ['All', ...new Set(d.researchLibrary.map((r) => r.tag))];
    tags.forEach((tag) => {
      const btn = el('button', 'lib-filter' + (tag === 'All' ? ' active' : ''), tag);
      btn.dataset.tag = tag;
      libFilters.appendChild(btn);
    });
    d.researchLibrary.forEach((r) => {
      const card = el('div', 'glass lib-card', `<span class="lib-tag">${r.tag}</span><h4>${r.title}</h4><p>${r.desc}</p>`);
      card.dataset.tag = r.tag;
      card.dataset.reveal = '';
      card.addEventListener('click', () => {
        const target = document.querySelector(`[data-project-id="${r.relatedProject}"]`);
        if (target) target.click();
      });
      libGrid.appendChild(card);
    });
    libFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.lib-filter');
      if (!btn) return;
      libFilters.querySelectorAll('.lib-filter').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const tag = btn.dataset.tag;
      libGrid.querySelectorAll('.lib-card').forEach((card) => {
        card.hidden = tag !== 'All' && card.dataset.tag !== tag;
      });
    });
  }

  /* ---------- Contact interests ---------- */
  const interestList = $('#interest-list');
  if (interestList) d.contactInterests.forEach((i) => interestList.appendChild(el('div', 'interest-item', `<span class="interest-dot"></span>${i}`)));

  /* ---------- Footer / contact links / resume hrefs ---------- */
  document.querySelectorAll('[data-resume-link]').forEach((a) => a.setAttribute('href', d.person.resume));
  document.querySelectorAll('[data-linkedin-link]').forEach((a) => a.setAttribute('href', d.person.linkedin));
  document.querySelectorAll('[data-email-link]').forEach((a) => a.setAttribute('href', `mailto:${d.person.email}`));
  document.querySelectorAll('[data-email-text]').forEach((n) => n.textContent = d.person.email);
  document.querySelectorAll('[data-photo]').forEach((img) => img.setAttribute('src', d.person.photo));
})();
