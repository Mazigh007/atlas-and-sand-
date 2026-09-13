/* ══════════════════════════════════════════════════════════════════════════
   Moroccan Experience — site behaviour
   header · nav · hero slideshow · carousels · reveal · back-to-top ·
   cookie consent · newsletter · group price calculator
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  /* ── header: solid background after scrolling past the top ────────────── */
  const header = $('#siteHeader');
  function onScroll() {
    if (!header) return;
    const y = window.scrollY || 0;
    header.classList.toggle('is-solid', y > 40);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── mobile nav ───────────────────────────────────────────────────────── */
  const toggle = $('#navToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('#mobileNav a').forEach((a) =>
      a.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        document.body.style.overflow = '';
      })
    );
  }

  /* mega menu: also open on click for touch devices */
  $$('#primaryNav li[data-mega] > button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const li = btn.parentElement;
      const open = li.classList.contains('is-open');
      $$('#primaryNav li.is-open').forEach((o) => o.classList.remove('is-open'));
      if (!open) li.classList.add('is-open');
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $$('#primaryNav li.is-open').forEach((o) => o.classList.remove('is-open'));
  });

  /* ── hero slideshow ───────────────────────────────────────────────────── */
  const slideBox = $('[data-slideshow]');
  if (slideBox) {
    const slides = $$('.hero-slide', slideBox);
    if (slides.length > 1) {
      let i = 0;
      setInterval(() => {
        slides[i].classList.remove('is-active');
        i = (i + 1) % slides.length;
        slides[i].classList.add('is-active');
      }, 6500);
    }
  }

  /* ── carousels ────────────────────────────────────────────────────────── */
  $$('[data-carousel]').forEach((box) => {
    const track = $('.carousel-track', box);
    const dotsBox = $('.carousel-dots', box);
    if (!track || !dotsBox) return;
    const n = track.children.length;
    let idx = 0;
    for (let i = 0; i < n; i += 1) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Review ' + (i + 1));
      if (i === 0) b.classList.add('is-active');
      b.addEventListener('click', () => go(i, true));
      dotsBox.appendChild(b);
    }
    function go(i, manual) {
      idx = (i + n) % n;
      track.style.transform = 'translateX(' + -100 * idx + '%)';
      $$('button', dotsBox).forEach((d, k) => d.classList.toggle('is-active', k === idx));
      if (manual) restart();
    }
    let timer = null;
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => go(idx + 1), 7200);
    }
    box.addEventListener('mouseenter', () => clearInterval(timer));
    box.addEventListener('mouseleave', restart);
    restart();
  });

  /* ── reveal on scroll ─────────────────────────────────────────────────── */
  const revealables = $$('.reveal');
  if ('IntersectionObserver' in window && revealables.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.style.transitionDelay = (parseInt(en.target.dataset.delay || 0, 10) || (Array.prototype.indexOf.call(revealables, en.target) % 4) * 70) + 'ms';
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* ── broken image → keep the gradient placeholder ─────────────────────── */
  $$('img').forEach((img) => {
    img.addEventListener('error', () => img.classList.add('is-missing'), { once: true });
    if (img.complete && img.naturalWidth === 0) img.classList.add('is-missing');
  });

  /* ── back to top, with a scroll-progress ring ────────────────────────── */
  const toTop = $('#toTop');
  if (toTop) {
    const ring = $('#toTopRing');
    const CIRC = 169.6;
    if (ring) ring.style.strokeDasharray = CIRC;
    function updateTop() {
      const y = window.scrollY || 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(1, y / max);
      toTop.classList.toggle('is-visible', y > 620);
      if (ring) ring.style.strokeDashoffset = String(CIRC * (1 - pct));
    }
    document.addEventListener('scroll', updateTop, { passive: true });
    window.addEventListener('resize', updateTop);
    updateTop();
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const skip = $('#main');
      if (skip) skip.focus({ preventScroll: true });
    });
  }

  /* ── cookie consent ──────────────────────────────────────────────────── */
  const KEY = 'mx_consen' + 't';
  const banner = $('#cookieBanner');
  function setCookie(name, value, days) {
    document.cookie = name + '=' + encodeURIComponent(value) + ';path=/;max-age=' + days * 86400 + ';samesite=lax';
  }
  if (banner) {
    let stored = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch (e) {
      stored = document.cookie.indexOf('mx_cookie_consent') > -1 ? 'saved' : null;
    }
    if (!stored) setTimeout(() => banner.classList.add('is-visible'), 1400);
    $$('[data-cookie]', banner).forEach((b) =>
      b.addEventListener('click', () => {
        const choice = b.dataset.cookie;
        try {
          localStorage.setItem(KEY, choice);
        } catch (e) {
          /* private mode */
        }
        setCookie('mx_cookie_consent', choice, 365);
        banner.classList.remove('is-visible');
        if (choice === 'all' && window.mxAnalytics) window.mxAnalytics.enable();
      })
    );
    $$('[data-open-cookie-settings]').forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        banner.classList.add('is-visible');
      })
    );
  }

  /* ── newsletter ──────────────────────────────────────────────────────── */
  $$('[data-newsletter]').forEach((form) =>
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const note = form.parentElement.querySelector('[data-newsletter-note]');
      const email = form.querySelector('input').value;
      try {
        const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) });
        const data = await r.json();
        if (note) {
          note.textContent = data.ok ? data.message : data.error || 'Something went wrong.';
          note.style.color = data.ok ? '#8fd8ab' : '#f2b3a8';
        }
        if (data.ok) form.reset();
      } catch (err) {
        if (note) note.textContent = 'Could not reach us — e-mail ' + (window.mxConfig ? window.mxConfig.email : 'us') + ' instead.';
      }
    })
  );

  /* ── group price calculator (on /tours/group) ────────────────────────── */
  const calc = $('[data-group-calc]');
  if (calc) {
    const size = $('#gcSize', calc);
    const nights = $('#gcNights', calc);
    const date = $('#gcDate', calc);
    const out = {
      people: $('#gcPeople'),
      nightsLabel: $('#gcNightsLabel'),
      head: $('#gcHead'),
      per: $('#gcPer'),
      total: $('#gcTotal'),
      dep: $('#gcDeposit'),
      dep2: $('#gcDeposit2'),
      bal: $('#gcBalance'),
      note: $('#gcNote'),
      link: calc.querySelector('.sum-deposit a'),
    };
    let t = null;
    async function recalc() {
      if (!size || !nights) return;
      out.people.textContent = size.value;
      out.nightsLabel.textContent = nights.value;
      out.head.textContent = 'Group of ' + size.value + ' · ' + nights.value + ' nights';
      clearTimeout(t);
      t = setTimeout(async () => {
        try {
          const r = await fetch('/api/quote', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ category: 'group', travellers: size.value, nights: nights.value, startDate: date ? date.value : '' }),
          });
          const d = await r.json();
          const q = d.quote;
          out.per.textContent = q.formatted.perPerson;
          out.total.textContent = q.formatted.tripTotal;
          out.dep.textContent = q.formatted.deposit;
          out.dep2.textContent = q.formatted.deposit;
          out.bal.textContent = q.formatted.balance;
          out.note.textContent = q.season.multiplier === 1 ? 'Shoulder-season rate. Includes coach, two trip leaders, local guides, breakfast daily and all entrance fees.' : q.season.label + ' pricing applied. Includes coach, two trip leaders, local guides, breakfast daily and all entrance fees.';
          if (out.link) out.link.href = '/book?category=group&travellers=' + size.value + '&nights=' + nights.value + (date && date.value ? '&startDate=' + date.value : '');
        } catch (e) {
          out.note.textContent = 'Could not reach the price engine — refresh and try again.';
        }
      }, 220);
    }
    [size, nights, date].forEach((el) => el && el.addEventListener('input', recalc));
    recalc();
  }

  /* ── smooth anchors ──────────────────────────────────────────────────── */
  $$('a[href^="#"]:not([data-open-cookie-settings])').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
  );
})();
