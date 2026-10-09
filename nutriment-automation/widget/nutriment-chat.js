/*!
 * Nutriment Properties – lead chat box (free, no third-party service)
 *
 * Embed before </body>:
 *   <script>
 *     window.NutrimentChatConfig = {
 *       endpoint: 'https://script.google.com/macros/s/XXXX/exec', // Apps Script web app URL
 *       whatsapp: '66XXXXXXXXX',                                    // digits only
 *       line: 'https://line.me/R/ti/p/@yourlineid',                 // optional
 *       color: '#0f766e'                                            // optional brand colour
 *     };
 *   </script>
 *   <script src="nutriment-chat.js" defer></script>
 */
(function () {
  'use strict';
  if (window.__nutrimentChatLoaded) return;
  window.__nutrimentChatLoaded = true;

  var cfg = Object.assign({
    endpoint: '',
    whatsapp: '',
    line: '',
    color: '#0f766e',
    brand: 'Nutriment Properties',
    openAfterSeconds: 25,
  }, window.NutrimentChatConfig || {});

  var COUNTRIES = ['USA', 'Russia', 'India', 'China', 'Japan', 'United Kingdom', 'Philippines',
    'UAE / Dubai', 'Thailand', 'Other'];
  var RENT_BUDGETS = ['Under 30k THB/mo', '30k–60k THB/mo', '60k–120k THB/mo', '120k+ THB/mo'];
  var BUY_BUDGETS = ['Under 5M THB', '5M–10M THB', '10M–25M THB', '25M+ THB'];

  // Conversation script. Each step: bot text, then either options (buttons) or an input.
  // `when` lets a step be skipped based on earlier answers.
  var STEPS = [
    { key: 'interest', text: 'Hi! 👋 Welcome to ' + cfg.brand + '. What can we help you with today?',
      options: ['Buy', 'Rent', 'Airbnb investment set-up', 'Commercial (club / office / shop)', 'Hotel lease / sale'] },
    { key: 'propertyType', text: 'Which type of property?',
      when: function (a) { return /^(Buy|Rent|Airbnb)/.test(a.interest); },
      options: ['Apartment / condo', 'Pool villa', 'Not sure yet'] },
    { key: 'propertyType', text: 'What kind of commercial property?',
      when: function (a) { return /^Commercial/.test(a.interest); },
      options: ['Club / bar (Walking Street)', 'Office', 'Shop', 'Other'] },
    { key: 'bedrooms', text: 'How many bedrooms?',
      when: function (a) { return /Apartment|villa|Not sure/i.test(a.propertyType || ''); },
      options: ['1', '2', '3', '4+'] },
    { key: 'budget', text: "What's your budget?",
      options: function (a) {
        return (a.interest === 'Rent' ? RENT_BUDGETS : BUY_BUDGETS).concat(['Prefer to discuss']);
      } },
    { key: 'country', text: 'Which country are you based in?', options: COUNTRIES },
    { key: 'timeline', text: 'When are you planning to move forward?',
      options: ['Immediately', 'Within 1 month', '1–3 months', 'Just browsing'] },
    { key: 'name', text: 'Great! What is your name?', input: 'text', placeholder: 'Your name', required: true },
    { key: 'email', text: 'Thanks, {name}! Your email address?', input: 'email', placeholder: 'you@example.com',
      validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email'; } },
    { key: 'whatsapp', text: 'And your WhatsApp number (with country code)? Tap "Skip" if you prefer email.',
      input: 'tel', placeholder: '+1 555 123 4567', skippable: true,
      validate: function (v) { return v.replace(/\D/g, '').length >= 7 || 'Please include the country code'; } },
    { key: 'message', text: 'Anything else we should know? (location, dates, must-haves…)',
      input: 'textarea', placeholder: 'Optional', skippable: true },
  ];

  var answers = {};
  var stepIndex = -1;
  var started = false;
  var root, panel, body, footer, launcher;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (k === 'on') Object.keys(attrs.on).forEach(function (ev) { node.addEventListener(ev, attrs.on[ev]); });
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function waLink(text) {
    return 'https://wa.me/' + String(cfg.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(text);
  }

  function injectStyles() {
    var c = cfg.color;
    var css =
      '.nc-root{position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.4}' +
      '.nc-launch{width:60px;height:60px;border-radius:50%;border:0;background:' + c + ';color:#fff;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.25);font-size:28px}' +
      '.nc-badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:10px;font-size:12px;padding:1px 6px}' +
      '.nc-panel{position:absolute;right:0;bottom:76px;width:360px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 110px);background:#fff;color:#111;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.25);display:none;flex-direction:column;overflow:hidden}' +
      '.nc-open .nc-panel{display:flex}' +
      '.nc-head{background:' + c + ';color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between}' +
      '.nc-head b{display:block;font-size:16px}.nc-head small{opacity:.85}' +
      '.nc-x{background:none;border:0;color:#fff;font-size:22px;cursor:pointer}' +
      '.nc-body{flex:1;overflow-y:auto;padding:14px;background:#f6f7f9}' +
      '.nc-msg{max-width:85%;padding:9px 12px;border-radius:12px;margin:6px 0;white-space:pre-wrap;word-wrap:break-word}' +
      '.nc-bot{background:#fff;border:1px solid #e5e7eb;border-bottom-left-radius:4px}' +
      '.nc-user{background:' + c + ';color:#fff;margin-left:auto;border-bottom-right-radius:4px}' +
      '.nc-opts{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}' +
      '.nc-opt{border:1px solid ' + c + ';color:' + c + ';background:#fff;border-radius:16px;padding:6px 12px;cursor:pointer;font:inherit;font-size:14px}' +
      '.nc-opt:hover{background:' + c + ';color:#fff}' +
      '.nc-foot{border-top:1px solid #e5e7eb;padding:10px;display:flex;gap:6px;background:#fff}' +
      '.nc-foot input,.nc-foot textarea{flex:1;border:1px solid #d1d5db;border-radius:8px;padding:8px 10px;font:inherit;color:#111;background:#fff;resize:none}' +
      '.nc-btn{border:0;border-radius:8px;padding:8px 12px;background:' + c + ';color:#fff;cursor:pointer;font:inherit}' +
      '.nc-btn.nc-ghost{background:#e5e7eb;color:#111}' +
      '.nc-err{color:#b91c1c;font-size:13px;margin:2px 0 0}' +
      '.nc-quick{display:flex;gap:6px;padding:8px 14px;background:#fff;border-top:1px solid #e5e7eb}' +
      '.nc-quick a{flex:1;text-align:center;text-decoration:none;color:#fff;border-radius:8px;padding:7px;font-size:13px}' +
      '.nc-wa{background:#25D366}.nc-line{background:#06C755}' +
      '.nc-hp{position:absolute;left:-9999px}';
    document.head.appendChild(el('style', { text: css }));
  }

  function build() {
    injectStyles();
    body = el('div', { class: 'nc-body', 'aria-live': 'polite' });
    footer = el('div', { class: 'nc-foot' });
    footer.style.display = 'none';

    var quick = el('div', { class: 'nc-quick' }, [
      cfg.whatsapp ? el('a', { class: 'nc-wa', href: waLink('Hi ' + cfg.brand + ', I have a property enquiry.'), target: '_blank', rel: 'noopener', text: 'WhatsApp us' }) : null,
      cfg.line ? el('a', { class: 'nc-line', href: cfg.line, target: '_blank', rel: 'noopener', text: 'LINE' }) : null,
    ]);
    if (!cfg.whatsapp && !cfg.line) quick.style.display = 'none';

    panel = el('div', { class: 'nc-panel', role: 'dialog', 'aria-label': cfg.brand + ' chat' }, [
      el('div', { class: 'nc-head' }, [
        el('div', {}, [el('b', { text: cfg.brand }), el('small', { text: 'Pattaya property experts · usually reply within minutes' })]),
        el('button', { class: 'nc-x', 'aria-label': 'Close chat', text: '×', on: { click: toggle } }),
      ]),
      body, quick, footer,
    ]);
    launcher = el('button', { class: 'nc-launch', 'aria-label': 'Open chat', text: '💬', on: { click: toggle } });
    root = el('div', { class: 'nc-root' }, [panel, launcher]);
    document.body.appendChild(root);

    if (cfg.openAfterSeconds > 0) {
      setTimeout(function () {
        if (!started) launcher.appendChild(el('span', { class: 'nc-badge', text: '1' }));
      }, cfg.openAfterSeconds * 1000);
    }
  }

  function toggle() {
    root.classList.toggle('nc-open');
    var badge = launcher.querySelector('.nc-badge');
    if (badge) badge.remove();
    if (!started && root.classList.contains('nc-open')) { started = true; next(); }
  }

  function say(text, who) {
    body.appendChild(el('div', { class: 'nc-msg ' + (who === 'user' ? 'nc-user' : 'nc-bot'), text: text }));
    body.scrollTop = body.scrollHeight;
  }

  function botSay(text, then) {
    var typing = el('div', { class: 'nc-msg nc-bot', text: '…' });
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;
    setTimeout(function () { typing.remove(); say(text, 'bot'); if (then) then(); }, 450);
  }

  function next() {
    stepIndex++;
    while (stepIndex < STEPS.length && STEPS[stepIndex].when && !STEPS[stepIndex].when(answers)) stepIndex++;
    if (stepIndex >= STEPS.length) return submit();
    var step = STEPS[stepIndex];
    var text = step.text.replace('{name}', (answers.name || '').split(' ')[0]);
    botSay(text, function () { step.options ? showOptions(step) : showInput(step); });
  }

  function record(step, value, label) {
    answers[step.key] = value;
    say(label || value || 'Skipped', 'user');
    footer.style.display = 'none';
    footer.textContent = '';
    next();
  }

  function showOptions(step) {
    var opts = typeof step.options === 'function' ? step.options(answers) : step.options;
    var wrap = el('div', { class: 'nc-opts' });
    opts.forEach(function (o) {
      wrap.appendChild(el('button', { class: 'nc-opt', text: o, on: { click: function () { wrap.remove(); record(step, o); } } }));
    });
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function showInput(step) {
    footer.textContent = '';
    var field = step.input === 'textarea'
      ? el('textarea', { rows: '2', placeholder: step.placeholder || '', 'aria-label': step.placeholder || step.key })
      : el('input', { type: step.input, placeholder: step.placeholder || '', 'aria-label': step.placeholder || step.key,
        autocomplete: { name: 'name', email: 'email', whatsapp: 'tel' }[step.key] || 'off' });
    var err = el('div', { class: 'nc-err' });
    var send = function () {
      var v = field.value.trim();
      if (!v) { if (step.skippable) return record(step, '', 'Skip'); err.textContent = 'This field is required'; return; }
      var ok = step.validate ? step.validate(v) : true;
      if (ok !== true) { err.textContent = ok; return; }
      record(step, v);
    };
    field.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    var col = el('div', { style: 'flex:1;display:flex;flex-direction:column' }, [field, err]);
    footer.appendChild(col);
    if (step.skippable) footer.appendChild(el('button', { class: 'nc-btn nc-ghost', text: 'Skip', on: { click: function () { record(step, '', 'Skip'); } } }));
    footer.appendChild(el('button', { class: 'nc-btn', text: 'Send', on: { click: send } }));
    footer.style.display = 'flex';
    field.focus();
  }

  function submit() {
    var payload = Object.assign({}, answers, { page: location.href, website: '' });
    var done = function () {
      botSay('Thank you, ' + (answers.name || '').split(' ')[0] + '! ✅ An agent will contact you shortly' +
        (answers.email ? ' – we have also emailed you a confirmation.' : '.'), function () {
        if (!cfg.whatsapp) return;
        var summary = 'Hi, I am ' + answers.name + ' (' + (answers.country || '') + '). Interested in: ' +
          [answers.interest, answers.propertyType, answers.bedrooms && answers.bedrooms + ' bed', answers.budget]
            .filter(Boolean).join(', ') + '.';
        var wrap = el('div', { class: 'nc-opts' }, [
          el('a', { class: 'nc-opt', href: waLink(summary), target: '_blank', rel: 'noopener', text: 'Continue on WhatsApp →' }),
        ]);
        body.appendChild(wrap);
        body.scrollTop = body.scrollHeight;
      });
    };
    if (!cfg.endpoint) { console.warn('[NutrimentChat] No endpoint configured; lead not sent', payload); return done(); }
    // text/plain avoids a CORS preflight, which Apps Script web apps do not answer.
    fetch(cfg.endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
      .then(done)
      .catch(function () {
        botSay('Sorry, something went wrong sending your details. Please message us on WhatsApp instead.');
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
