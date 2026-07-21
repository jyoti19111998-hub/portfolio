/* Command palette: Ctrl+K / Cmd+K opens a searchable command list */
(function () {
  const d = window.PORTFOLIO_DATA;
  const overlay = document.createElement('div');
  overlay.className = 'cmdk-overlay';
  overlay.innerHTML = `
    <div class="cmdk-box">
      <div class="cmdk-input-row">
        <span>⌘</span>
        <input type="text" placeholder="Type a command… (resume, projects, linkedin, research, contact)" autocomplete="off" />
        <span class="kbd-hint">esc</span>
      </div>
      <div class="cmdk-list"></div>
    </div>`;
  document.body.appendChild(overlay);
  const input = overlay.querySelector('input');
  const list = overlay.querySelector('.cmdk-list');
  let activeIndex = 0;
  let filtered = d.commands;

  function renderList() {
    list.innerHTML = '';
    filtered.forEach((cmd, i) => {
      const item = document.createElement('div');
      item.className = 'cmdk-item' + (i === activeIndex ? ' active' : '');
      item.innerHTML = `<span class="cmdk-item-label">${cmd.label}</span><span class="cmdk-item-hint">${cmd.hint}</span>`;
      item.addEventListener('click', () => runCommand(cmd));
      item.addEventListener('mouseenter', () => { activeIndex = i; renderList(); });
      list.appendChild(item);
    });
  }

  function runCommand(cmd) {
    close();
    if (cmd.action === 'resume') window.open(d.person.resume, '_blank');
    else if (cmd.action === 'linkedin') window.open(d.person.linkedin, '_blank');
    else if (cmd.action.startsWith('scroll:')) {
      const target = document.querySelector(cmd.action.replace('scroll:', ''));
      if (target) {
        if (window.lenis) window.lenis.scrollTo(target, { offset: -70 });
        else target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function open() {
    overlay.classList.add('open');
    input.value = ''; filtered = d.commands; activeIndex = 0; renderList();
    setTimeout(() => input.focus(), 50);
  }
  function close() { overlay.classList.remove('open'); }

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    filtered = d.commands.filter((c) => c.label.toLowerCase().includes(q) || c.id.includes(q) || c.hint.toLowerCase().includes(q));
    activeIndex = 0;
    renderList();
  });

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? close() : open();
    }
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); renderList(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); renderList(); }
    if (e.key === 'Enter' && filtered[activeIndex]) runCommand(filtered[activeIndex]);
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  document.getElementById('cmdk-trigger')?.addEventListener('click', open);
})();
