/* Project case-study cards + Notion-style fullscreen expand modal */
(function () {
  const d = window.PORTFOLIO_DATA;
  const list = document.getElementById('projects-list');
  if (!list) return;

  const overlay = document.createElement('div');
  overlay.className = 'project-modal-overlay';
  overlay.innerHTML = `
    <div class="project-modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <button class="modal-close" aria-label="Close">✕</button>
        <h3 id="modal-title"></h3>
        <p id="modal-subtitle"></p>
      </div>
      <div class="modal-body">
        <div class="modal-block"><h4>Problem</h4><p id="modal-problem"></p></div>
        <div class="modal-block"><h4>Approach</h4><p id="modal-approach"></p></div>
        <div class="modal-block"><h4>Outcome</h4><p id="modal-outcome"></p><span class="modal-outcome-badge" id="modal-badge"></span></div>
        <div class="modal-block"><h4>Key Learning</h4><p id="modal-learning"></p></div>
        <div class="modal-block"><h4>Tech Stack</h4><div class="modal-stack" id="modal-stack"></div></div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  function openModal(p) {
    overlay.querySelector('#modal-title').textContent = p.title;
    overlay.querySelector('#modal-subtitle').textContent = p.subtitle;
    overlay.querySelector('#modal-problem').textContent = p.problem;
    overlay.querySelector('#modal-approach').textContent = p.approach;
    overlay.querySelector('#modal-outcome').textContent = p.outcome;
    overlay.querySelector('#modal-badge').textContent = p.outcomeBadge;
    overlay.querySelector('#modal-learning').textContent = p.learning;
    const stackEl = overlay.querySelector('#modal-stack');
    stackEl.innerHTML = p.stack.map((s) => `<span class="stack-chip">${s}</span>`).join('');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
  }
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
  }
  overlay.querySelector('.modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  d.projects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'glass project-card';
    card.dataset.projectId = p.id;
    card.setAttribute('data-tilt-in', '');
    card.innerHTML = `
      <div class="project-top">
        <div class="project-num">${p.num}</div>
        <div>
          <div class="project-title">${p.title}</div>
          <div class="project-subtitle">${p.subtitle}</div>
        </div>
        <span class="project-badge">${p.outcomeBadge}</span>
      </div>
      <div class="project-tools-preview">${p.stack.slice(0, 5).map((s) => `<span class="mini-tag">${s}</span>`).join('')}${p.stack.length > 5 ? `<span class="mini-tag">+${p.stack.length - 5} more</span>` : ''}</div>
      <div class="project-expand-hint">⤢ Click to expand — timeline, stack, challenges & results</div>
    `;
    card.addEventListener('click', () => openModal(p));
    list.appendChild(card);
  });

  // Allow other modules (research library) to trigger open via click on [data-project-id]
  window.openProjectModal = (id) => {
    const p = d.projects.find((x) => x.id === id);
    if (p) openModal(p);
  };
})();
