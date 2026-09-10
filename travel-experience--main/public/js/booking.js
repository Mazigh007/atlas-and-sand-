/* ══════════════════════════════════════════════════════════════════════════
   Booking form — live pricing, deposit maths and the Stripe hand-off.
   Prices are never trusted from the browser: the server recalculates the
   quote on POST /book and charges the deposit it computed.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const $ = (s) => form.querySelector(s) || document.querySelector(s);
  const journey = $('#fJourney');
  const catSel = $('#fCategory');
  const travellers = $('#fTravellers');
  const nights = $('#fNights');
  const dateEl = $('#fDate');
  const single = $('#fSingle');
  const linesBox = $('#quoteLines');
  const totalEl = $('#qTotal');
  const depEl = $('#qDeposit');
  const depLabel = $('#qDepositLabel');
  const balNote = $('#qBalanceNote');
  const metaEl = $('#quoteMeta');
  const journeyNameEl = $('#quoteJourney');
  const payBtn = $('#payBtn');
  const payLabel = $('#payBtnLabel');
  const status = $('#quoteStatus');

  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const pct = (window.mxConfig && window.mxConfig.depositPercent) || 25;
  let timer = null;
  let lastValid = null;

  /* ── steppers ────────────────────────────────────────────────────────── */
  document.querySelectorAll('[data-stepper]').forEach((box) => {
    const input = box.querySelector('input');
    const min = parseFloat(box.dataset.min || input.min || 1);
    const max = parseFloat(box.dataset.max || input.max || 99);
    box.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        const step = parseFloat(b.dataset.step);
        const next = Math.min(max, Math.max(min, (parseFloat(input.value) || min) + step));
        input.value = next;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      })
    );
    input.addEventListener('blur', () => {
      const v = Math.min(max, Math.max(min, parseFloat(input.value) || min));
      input.value = v;
    });
  });

  /* ── selecting a journey sets nights + the category used for pricing ─── */
  function selectedCategory() {
    const opt = journey && journey.value ? journey.options[journey.selectedIndex] : null;
    // An explicit itinerary wins; otherwise the chosen journey family drives pricing.
    return (opt && opt.dataset.category) || (catSel ? catSel.value : 'private');
  }
  const CAT_HINTS = {
    private: 'Private = your own guide and vehicle, departing whenever you like. From $2,400 pp.',
    luxury: 'Luxury = palace suites, staffed camp, chef. From $6,000 pp for 7 days.',
    bespoke: 'Bespoke = designed from a blank page; indicative until access is confirmed.',
    group: 'Group = 10 – 30 travellers on a fixed date, $2,000 – $4,000 pp by party size.'
  };
  function syncFromJourney() {
    if (catSel) {
      const note = form.querySelector('[data-cat-note]');
      if (note) note.textContent = CAT_HINTS[selectedCategory()] || '';
    }
    const opt = journey && journey.value ? journey.options[journey.selectedIndex] : null;
    if (opt && opt.dataset.nights) nights.value = opt.dataset.nights;
    const aud = form.querySelector('#fAudience');
    if (aud) aud.value = (opt && opt.dataset.audience) || '';
    if (opt && opt.dataset.category === 'group' && parseInt(travellers.value, 10) < 10) travellers.value = 10;
    if (opt && opt.dataset.category !== 'group' && parseInt(travellers.value, 10) > 12) travellers.value = 2;
  }

  /* ── group / private advisories ───────────────────────────────────────── */
  function advisories() {
    const list = [];
    const cat = selectedCategory();
    const t = parseInt(travellers.value, 10) || 0;
    if (cat === 'group' && t < 10) list.push({ kind: 'err', text: 'Group departures need at least 10 travellers. Below that we run the same route privately — usually $2,900 – $4,200 pp.' });
    if (cat === 'group' && t > 30) list.push({ kind: 'ok', text: 'Above 30 travellers this becomes a private departure for your own party (two coaches, one itinerary). We price it the same way.' });
    if (cat === 'luxury' && parseInt(nights.value, 10) < 7) list.push({ kind: 'info', text: 'Luxury is quoted from $6,000 pp for 7 days. Shorter luxury journeys exist — the rate simply pro-rates.' });
    if (cat !== 'group' && t >= 6) list.push({ kind: 'ok', text: 'Party of ' + t + ': the private vehicle and guide are shared, so your per-person price drops. That discount is already in the quote.' });
    if (dateEl.value) {
      const leadDays = Math.round((new Date(dateEl.value) - new Date()) / 86400000);
      if (leadDays < 21 && leadDays >= 0) list.push({ kind: 'err', text: 'Only ' + leadDays + ' days to go — inside 21 days we cannot guarantee rooms. Call ' + ((window.mxConfig && window.mxConfig.phoneMa) || '') + ' and we will try.' });
      if (leadDays < 0) list.push({ kind: 'err', text: 'That date is in the past.' });
    }
    const box = document.getElementById('mxAdvisories') || createBox();
    box.innerHTML = list.map((a) => '<p class="notice ' + (a.kind === 'err' ? 'notice--err' : a.kind === 'ok' ? 'notice--ok' : '') + '" style="margin-bottom:8px">' + a.text + '</p>').join('');
    return list.filter((a) => a.kind === 'err').length === 0;
  }
  function createBox() {
    const box = document.createElement('div');
    box.id = 'mxAdvisories';
    box.setAttribute('aria-live', 'polite');
    (document.querySelector('.layout-detail > div') || document.body).prepend(box);
    return box;
  }

  /* ── payload ─────────────────────────────────────────────────────────── */
  function payload() {
    const fd = new FormData(form);
    return {
      journey: fd.get('journey') || '',
      category: selectedCategory(),
      travellers: fd.get('travellers'),
      nights: fd.get('nights'),
      startDate: fd.get('startDate') || '',
      single: single ? single.checked : false,
      extras: fd.getAll('extras'),
      mode: fd.get('mode'),
    };
  }

  /* ── live quote ──────────────────────────────────────────────────────── */
  async function recalc() {
    clearTimeout(timer);
    if (status) {
      status.hidden = false;
      status.textContent = 'Recalculating…';
    }
    timer = setTimeout(async () => {
      try {
        const r = await fetch('/api/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload()) });
        const d = await r.json();
        if (!d.quote) return;
        render(d.quote);
        lastValid = d.quote;
      } catch (e) {
        if (status) status.textContent = 'Price engine unreachable — the figures shown are the ones the page loaded with.';
      }
    }, 260);
  }

  function render(q) {
    const isQuote = q.mode === 'quote';
    if (journeyNameEl) {
      journeyNameEl.innerHTML =
        (q.journey ? q.journey.name : 'Bespoke design') + ' · <span id="quoteMeta">' + q.travellers + ' traveller' + (q.travellers > 1 ? 's' : '') + ' · ' + q.nights + ' nights' + (q.season && q.season.multiplier !== 1 ? ' · ' + q.season.label.toLowerCase() : '') + '</span>';
    }
    const rows = (q.lines || []).map((l) => '<li class="' + (l.kind === 'discount' ? 'disc' : '') + '"><span>' + l.label + '</span><span>' + (l.amount < 0 ? '−' : '') + fmt(Math.abs(l.amount)) + '</span></li>');
    if (isQuote) rows.push('<li><span>Per person</span><span><b>' + q.formatted.perPerson + '</b></span></li>');
    if (linesBox) linesBox.innerHTML = rows.join('');
    if (totalEl) totalEl.textContent = isQuote ? q.formatted.tripTotal : '—';
    if (depEl) depEl.textContent = isQuote ? q.formatted.deposit : 'Nothing';
    if (depLabel) depLabel.textContent = isQuote ? 'Pay today · ' + pct + '% deposit' : 'Pay today';
    if (payLabel) payLabel.textContent = isQuote ? 'Pay ' + q.formatted.deposit + ' deposit' : 'Send enquiry';
    if (balNote) {
      balNote.innerHTML = isQuote
        ? 'Balance <b>' + q.formatted.balance + '</b> due ' + q.balanceDueDaysBefore + ' days before departure' + (q.balanceDueOn ? ' (by ' + new Date(q.balanceDueOn + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ')' : '') + ' — never charged automatically.'
        : 'A designer replies with a costed day-by-day within 48 hours. No planning fee, no obligation.';
    }
    if (status) status.hidden = true;
    const box = document.querySelector('.sum-total');
    if (box) box.style.display = isQuote ? '' : 'none';
    const dep = document.querySelector('.sum-deposit');
    if (dep) dep.style.opacity = isQuote ? '1' : '0.6';
  }

  /* ── wire up ─────────────────────────────────────────────────────────── */
  ['change', 'input'].forEach((evt) => form.addEventListener(evt, (e) => {
    if (e.target === journey) syncFromJourney();
    advisories();
    recalc();
  }));

  /* radio: pay now vs proposal first */
  form.querySelectorAll('input[name="payNow"]').forEach((r) =>
    r.addEventListener('change', () => {
      const enquiry = r.value === 'no';
      if (payLabel) payLabel.textContent = enquiry ? 'Send enquiry — pay nothing' : lastValid ? 'Pay ' + lastValid.formatted.deposit + ' deposit' : 'Pay ' + pct + '% deposit';
      recalc();
    })
  );

  form.addEventListener('submit', (e) => {
    const ok = advisories();
    if (!ok) {
      e.preventDefault();
      const first = document.querySelector('#mxAdvisories .notice--err');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (payBtn) {
      payBtn.classList.add('is-busy');
      if (payLabel) payLabel.textContent = 'Opening secure payment…';
    }
  });

  /* first paint */
  syncFromJourney();
  advisories();
  recalc();
})();
