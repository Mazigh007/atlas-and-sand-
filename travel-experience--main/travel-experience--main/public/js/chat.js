/* ══════════════════════════════════════════════════════════════════════════
   Travel assistant — chat widget
   Talks to POST /api/chat. That endpoint is LLM-backed when an API key exists
   and falls back to the built-in Morocco expert otherwise; this file does not
   care which. No card, passport or medical data is ever accepted here.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const root = document.getElementById('chatWidget');
  if (!root) return;

  const $ = (s) => root.querySelector(s);
  const launcher = $('#chatLauncher');
  const panel = $('#chatPanel');
  const log = $('#chatLog');
  const form = $('#chatForm');
  const input = $('#chatInput');
  const suggest = $('#chatSuggest');
  const lead = $('#chatLead');
  const status = $('#chatStatus');
  const meta = root.dataset;
  const KEY = 'mx_chat_v1';

  const WA = 'https://wa.me/' + (window.mxConfig && window.mxConfig.whatsapp ? window.mxConfig.whatsapp : '');
  let messages = [];
  let busy = false;
  let opened = false;

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function inline(s) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
  const SAFE_LINKS = {
    '/book': 'Plan my trip',
    '/journeys': 'Journeys',
    '/tours/luxury': 'Luxury tours',
    '/tours/group': 'Group tours',
    '/tours/private': 'Private tours',
    '/tours/bespoke': 'Bespoke tours',
    '/booking-conditions': 'Booking conditions',
    '/privacy-policy': 'Privacy policy',
    '/legal-terms': 'Legal terms',
    '/faq': 'FAQ',
    '/contact': 'Contact',
    '/destinations': 'Destinations',
  };
  function absolutise(s) {
    let out = esc(s);
    Object.keys(SAFE_LINKS).forEach((path) => {
      const label = SAFE_LINKS[path];
      out = out.replace(new RegExp('(^|[\\s(])' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[\\s.,;:)])', 'g'), '$1<a class="link" href="' + path + '">' + label + '</a>');
    });
    return out;
  }

  function bubble(role, html, meta2) {
    const wrap = document.createElement('div');
    wrap.className = 'msg msg--' + (role === 'user' ? 'me' : 'bot');
    wrap.innerHTML = '<div class="msg-bubble">' + html + '</div>' + (meta2 ? '<div class="msg-meta">' + meta2 + '</div>' : '');
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return wrap;
  }

  function typing() {
    const el = document.createElement('div');
    el.className = 'msg msg--bot';
    el.innerHTML = '<div class="typing"><i></i><i></i><i></i></div>';
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function chips(list) {
    suggest.innerHTML = '';
    (list || []).slice(0, 4).forEach((label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', () => send(label));
      suggest.appendChild(b);
    });
  }

  function save() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(messages.slice(-8)));
    } catch (e) {
      /* ignore */
    }
  }
  function restore() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  /* ── the booking form, if present, is context ─────────────────────────── */
  function contextPayload() {
    const ctx = { page: meta.page || document.title, journey: meta.journey || '' };
    const f = document.getElementById('bookingForm');
    if (f) {
      const fd = new FormData(f);
      ctx.form = {
        journey: fd.get('journey') || '',
        category: f.querySelector('#fJourney') ? f.querySelector('#fJourney').selectedOptions[0].dataset.category : fd.get('category') || 'private',
        travellers: fd.get('travellers'),
        nights: fd.get('nights'),
        startDate: fd.get('startDate'),
        single: f.querySelector('#fSingle') ? f.querySelector('#fSingle').checked : false,
        extras: fd.getAll('extras'),
        mode: fd.get('mode'),
      };
    }
    return ctx;
  }

  /* ── send ──────────────────────────────────────────────────────────────── */
  async function send(text) {
    const clean = String(text || '').replace(/(\d[ -]?){13,16}/g, '[redacted card number]').replace(/\b\d{3}\b\s*(cvv|cvc)/gi, '[redacted]').slice(0, 500);
    if (!clean.trim() || busy) return;
    busy = true;
    $('#payGuard') && $('#payGuard').remove();
    bubble('user', inline(clean));
    messages.push({ role: 'user', content: clean });
    chips([]);
    const t = typing();
    if (status) status.textContent = 'Amal is typing…';
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: messages.slice(-10), context: contextPayload() }),
      });
      const data = await r.json();
      t.remove();
      if (!r.ok) throw new Error(data.error || 'unavailable');
      const links = (data.links || [])
        .filter((l) => l && l.href && (l.href[0] === '/' || /^https?:/.test(l.href)))
        .map((l) => '<a class="link" style="margin-right:10px" href="' + esc(l.href) + '">' + inline(l.label) + '</a>')
        .join('');
      bubble('bot', absolutise(data.reply) + (links ? '<div style="margin-top:10px">' + links + '</div>' : ''), data.mode === 'offline' ? 'Built-in Morocco expert' : 'Travel assistant');
      messages.push({ role: 'assistant', content: data.reply });
      chips(rapidFollowups(data));
      save();
    } catch (e) {
      t.remove();
      bubble('bot', 'The assistant could not answer just now. A human can: <a class="link" href="' + WA + '">WhatsApp us</a>, call <a class="link" href="tel:' + (window.mxConfig ? window.mxConfig.phoneMa : '') + '">' + esc(window.mxConfig ? window.mxConfig.phoneMa : '') + '</a> (Morocco) or <a class="link" href="tel:' + (window.mxConfig ? window.mxConfig.phoneUsa : '') + '">' + esc(window.mxConfig ? window.mxConfig.phoneUsa : '') + '</a> (USA).', 'Fallback');
      chips(['Price a luxury tour', 'Group tours for women', 'Cancellation terms']);
    } finally {
      busy = false;
      if (status) status.textContent = 'Online — usually replies instantly';
      input.focus();
    }
  }

  function rapidFollowups(data) {
    if (data.suggestions && data.suggestions.length) return data.suggestions;
    return ['Price a journey', 'Cancellation terms', 'Talk to a human'];
  }

  /* ── handoff card ────────────────────────────────────────────────────── */
  function handoffCard() {
    const c = window.mxConfig || {};
    return (
      'Here is everything, at once:<br><br>' +
      '<a class="link" href="' + WA + '">WhatsApp ' + esc(c.phoneMa || '') + '</a><br>' +
      '<a class="link" href="tel:' + esc((c.phoneMa || '').replace(/[^+\d]/g, '')) + '">Call Morocco ' + esc(c.phoneMa || '') + '</a><br>' +
      '<a class="link" href="tel:' + esc((c.phoneUsa || '').replace(/[^+\d]/g, '')) + '">Call USA ' + esc(c.phoneUsa || '') + '</a><br>' +
      '<a class="link" href="mailto:' + esc(c.email || '') + '">' + esc(c.email || '') + '</a>' +
      '<div style="margin-top:12px"><button class="pill pill--sm" type="button" id="mxLeadToggle">Leave my details instead</button></div>'
    );
  }

  /* ── open / close ────────────────────────────────────────────────────── */
  function open(first) {
    panel.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    opened = true;
    if (first) {
      greet();
      setTimeout(() => input.focus(), 320);
    }
  }
  function close() {
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }
  function greet() {
    const c = window.mxConfig || {};
    const prior = restore();
    if (prior.length) {
      prior.forEach((m) => bubble(m.role === 'user' ? 'user' : 'bot', inline(m.content)));
      messages = prior;
      chips(['Continue', 'Talk to a human', 'Cancellation terms']);
      return;
    }
    const where = (meta.page || '').replace(/^\s*|\s*$/g, '');
    bubble(
      'bot',
      'Salam. I am the Moroccan Experience travel assistant — journeys, prices, deposits, group sizes, cancellation terms, when to come.<br><br>' +
        (meta.journey ? 'You have <strong>' + inline(meta.journey) + '</strong> open; ask me anything about it.' : 'Try “price a luxury 7-day for two”, or “what does a group of 20 students cost”.') +
        '<div style="margin-top:12px" class="small">I answer from what this site actually sells. A designer can take over any time on WhatsApp <a class="link" href="' + WA + '">' + inline(c.phoneMa || '') + '</a> or in the USA on ' + inline(c.phoneUsa || '') + '.</div>',
      meta.agentMode === 'offline' ? 'Built-in Morocco expert · no AI key set' : 'AI assistant · grounded in our published trips'
    );
    chips(['Price a luxury tour', 'Women-only group', 'How does the deposit work?', 'Talk to a human']);
  }

  launcher.addEventListener('click', () => (panel.classList.contains('is-open') ? close() : open(true)));
  $('#chatClose').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value;
    if (/^(human|agent|person|call me|whatsapp|speak to someone|talk to a human)$/i.test(val.trim())) {
      bubble('user', inline(val));
      messages.push({ role: 'user', content: val });
      input.value = '';
      bubble('bot', handoffCard(), 'Handoff');
      messages.push({ role: 'assistant', content: 'Contact details shared.' });
      lead.hidden = true;
      chips(['Book a journey', 'Email me a proposal']);
      return;
    }
    input.value = '';
    send(val);
  });

  /* keyboard: ↑ recalls last question */
  let histIdx = -1;
  input.addEventListener('keydown', (e) => {
    const mine = messages.filter((m) => m.role === 'user');
    if (e.key === 'ArrowUp' && !input.value) {
      histIdx = Math.min(histIdx + 1, mine.length - 1);
      if (mine[histIdx]) input.value = mine[histIdx].content;
      e.preventDefault();
    }
  });

  /* delegate clicks inside the log (lead toggle) */
  log.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'mxLeadToggle') {
      lead.hidden = !lead.hidden;
      if (!lead.hidden) $('#leadName').focus();
    }
  });

  $('#leadSend').addEventListener('click', async () => {
    const btn = $('#leadSend');
    const payload = {
      name: $('#leadName').value.trim(),
      email: $('#leadEmail').value.trim(),
      phone: $('#leadPhone').value.trim(),
      interest: meta.journey || meta.page || 'website enquiry',
      page: location.pathname,
      messages: messages.slice(-4),
    };
    if (!payload.email) {
      $('#leadEmail').focus();
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const r = await fetch('/api/chat/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json();
      lead.innerHTML = '<p class="mb-0">' + inline(d.ok ? d.message : d.error || 'Could not send that.') + '</p>';
      if (d.ok) chips(['Price a journey', 'Best time to visit']);
    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Send it';
      lead.querySelector('p').textContent = 'Could not reach us — call or WhatsApp ' + ((window.mxConfig || {}).phoneMa || '') + '.';
    }
  });

  /* a gentle nudge on the two highest-intent pages, once per session */
  const nudgePath = ['/book', '/tours/luxury', '/tours/group'];
  if (nudgePath.indexOf(location.pathname) > -1 && !sessionStorage.getItem(KEY)) {
    setTimeout(() => {
      if (!opened) {
        const lbl = root.querySelector('.lbl');
        if (lbl) lbl.textContent = 'Questions? Ask me';
      }
    }, 14000);
  }
})();
