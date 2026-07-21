/**
 * Scripted "Ask about Jyoti" assistant. This is a guided, keyword-matched
 * Q&A engine over her real project/skill data — not a live LLM call (this
 * is a static site with no backend to safely hold an API key). Framed
 * honestly to visitors via the subtitle under the assistant's name.
 */
(function () {
  const d = window.PORTFOLIO_DATA;

  const fab = document.createElement('button');
  fab.className = 'ai-fab';
  fab.setAttribute('aria-label', 'Open AI assistant');
  fab.textContent = '🤖';
  document.body.appendChild(fab);

  const panel = document.createElement('div');
  panel.className = 'ai-panel';
  panel.innerHTML = `
    <div class="ai-panel-head">
      <div class="ai-avatar">🤖</div>
      <div>
        <strong>Jyoti's Assistant</strong>
        <span>Guided answers from her real project data</span>
      </div>
      <button class="ai-panel-close" aria-label="Close">✕</button>
    </div>
    <div class="ai-messages"></div>
    <div class="ai-suggestions"></div>
    <div class="ai-input-row">
      <input type="text" placeholder="Ask about her projects, skills, or experience…" />
      <button class="ai-send" aria-label="Send">➤</button>
    </div>`;
  document.body.appendChild(panel);

  const messages = panel.querySelector('.ai-messages');
  const suggestionsEl = panel.querySelector('.ai-suggestions');
  const input = panel.querySelector('input');
  const sendBtn = panel.querySelector('.ai-send');

  function addMsg(text, who) {
    const m = document.createElement('div');
    m.className = `ai-msg ${who}`;
    m.textContent = text;
    messages.appendChild(m);
    messages.scrollTop = messages.scrollHeight;
    return m;
  }

  function addTyping() {
    const m = document.createElement('div');
    m.className = 'ai-msg bot';
    m.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
    messages.appendChild(m);
    messages.scrollTop = messages.scrollHeight;
    return m;
  }

  function setSuggestions(chips) {
    suggestionsEl.innerHTML = '';
    chips.forEach((c) => {
      const btn = document.createElement('button');
      btn.className = 'ai-chip'; btn.textContent = c;
      btn.addEventListener('click', () => handleInput(c));
      suggestionsEl.appendChild(btn);
    });
  }

  const defaultSuggestions = ['Tell me about a project', 'What\'s her tech stack?', 'Is she available for work?', 'How did she go from law to AI?'];

  function findProject(q) {
    return d.projects.find((p) => q.includes(p.id.replace(/-/g, ' ')) || p.title.toLowerCase().split(' ').some((w) => w.length > 4 && q.includes(w)));
  }

  function respond(rawQ) {
    const q = rawQ.toLowerCase();

    if (/resume|cv/.test(q)) return { text: `Here's her resume: ${d.person.resume} — I've opened it in a new tab.`, effect: () => window.open(d.person.resume, '_blank') };
    if (/linkedin/.test(q)) return { text: 'Opening her LinkedIn profile now.', effect: () => window.open(d.person.linkedin, '_blank') };
    if (/contact|email|hire|reach/.test(q)) return { text: `You can reach her at ${d.person.email} or via the contact form below. She's ${d.person.availability.toLowerCase()}.` };
    if (/available|freelance|hiring|open to work/.test(q)) return { text: `Yes — she's ${d.person.availability.toLowerCase()}, based in ${d.person.location}.` };

    const proj = findProject(q);
    if (proj) return { text: `${proj.title}: ${proj.subtitle}\n\nApproach: ${proj.approach}\n\nOutcome: ${proj.outcome}` };
    if (/project|case stud|work|built|build/.test(q)) {
      const list = d.projects.map((p, i) => `${i + 1}. ${p.title}`).join('\n');
      return { text: `She's shipped 6 real automation systems:\n${list}\n\nAsk me about any one by name, or scroll to the Projects section.` };
    }

    if (/stack|tool|tech|claude|gpt|make|zapier|n8n|python/.test(q)) {
      const chips = d.stack.map((s) => `${s.group}: ${s.chips.join(', ')}`).join('\n');
      return { text: `Her stack spans:\n${chips}` };
    }

    if (/skill|galaxy|graph|knowledge/.test(q)) return { text: 'Check out the Knowledge Graph and Skills Galaxy sections — they visualise how Law, AI, IP, Automation, and Research connect in her work.' };

    if (/law|lawyer|legal background|journey|history|from law|became|transition/.test(q)) {
      return { text: `Her path: ${d.journey.map((j) => j.title).join(' → ')}. ${d.philosophy.quote}` };
    }

    if (/research|library|paper|writing/.test(q)) {
      const topics = d.researchLibrary.map((r) => r.title).join(', ');
      return { text: `Her research focus areas: ${topics}. Explore the Research Library section for details on each.` };
    }

    if (/hello|hi there|^hi$|hey/.test(q)) return { text: `Hi! I'm Jyoti's AI. Ask me anything about her projects, experience, or research.` };
    if (/thank/.test(q)) return { text: "You're welcome! Anything else you'd like to know about her work?" };

    return { text: "I can tell you about her projects, tech stack, journey from law to AI, or how to get in touch. Try one of the suggestions below, or ask directly." };
  }

  function handleInput(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    input.value = '';
    const typingEl = addTyping();
    setTimeout(() => {
      typingEl.remove();
      const { text: reply, effect } = respond(text);
      addMsg(reply, 'bot');
      if (effect) effect();
    }, 500 + Math.random() * 400);
  }

  sendBtn.addEventListener('click', () => handleInput(input.value));
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleInput(input.value); });
  panel.querySelector('.ai-panel-close').addEventListener('click', () => panel.classList.remove('open'));

  let greeted = false;
  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && !greeted) {
      greeted = true;
      setSuggestions(defaultSuggestions);
      setTimeout(() => addMsg("Hi, I'm Jyoti's AI. Ask me anything about her projects, experience, or research.", 'bot'), 300);
    }
  });
})();
