'use strict';
const express = require('express');
const config = require('../config');
const { journeys, CATEGORIES, byCategory, byAudience } = require('../data/journeys');
const { destinations, find: findDestination } = require('../data/destinations');
const { tourTypes, audiences, findAudience } = require('../data/tourTypes');
const { posts, find: findPost } = require('../data/journal');
const legal = require('../data/legal');
const { quote } = require('../services/pricing');

const router = express.Router();

const PAGES = [
  { label: 'Plan my trip / booking form', href: '/book' },
  { label: 'Private tours', href: '/tours/private' },
  { label: 'Luxury tours', href: '/tours/luxury' },
  { label: 'Bespoke tours', href: '/tours/bespoke' },
  { label: 'Group tours', href: '/tours/group' },
  { label: 'Women-only group tours', href: '/tours/group/women' },
  { label: 'Student group tours', href: '/tours/group/students' },
  { label: 'Senior group tours', href: '/tours/group/seniors' },
  { label: 'Why us', href: '/why-us' },
  { label: 'About us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Booking FAQ', href: '/faq' },
  { label: 'Booking conditions', href: '/booking-conditions' },
  { label: 'Privacy policy', href: '/privacy-policy' },
  { label: 'Legal terms', href: '/legal-terms' },
  { label: 'Sitemap', href: '/sitemap' },
];

const allLinks = () => [
  ...journeys.map((j) => ({ href: '/journeys/' + j.slug, label: j.name })),
  ...destinations.map((d) => ({ href: '/destinations/' + d.slug, label: d.name })),
  ...posts.map((p) => ({ href: '/journal/' + p.slug, label: p.title })),
  ...PAGES,
];

/* ── home ─────────────────────────────────────────────────────────────────── */
router.get('/', (req, res) => {
  res.render('pages/home', {
    title: 'Morocco luxury travel & tailor-made holidays | Moroccan Experience',
    desc:
      'Tailor-made private, luxury, bespoke and group journeys across Morocco. Luxury tours from $6,000 pp for 7 days; group tours $2,000–$4,000 pp for 10–30 travellers. Book with a 25% deposit.',
    heroJourneys: journeys.filter((j) => j.featured).slice(0, 8),
    anyJourneys: journeys,
    tourTypes,
    CATEGORIES,
    reviews: config.reviews,
    press: config.press,
    badges: config.badges,
    destinations,
  });
});

/* ── journeys catalogue ───────────────────────────────────────────────────── */
router.get('/journeys', (req, res) => {
  const { type, audience, nights, sort, q } = req.query;
  let list = journeys.slice();
  if (type && CATEGORIES[type]) list = list.filter((j) => j.category === type);
  if (audience && audiences[audience]) list = list.filter((j) => j.audience === audience);
  if (nights) list = list.filter((j) => j.nights >= parseInt(nights, 10));
  if (q) {
    const s = String(q).toLowerCase();
    list = list.filter((j) => (j.name + j.summary + j.season + j.feeling).toLowerCase().includes(s));
  }
  if (sort === 'price-asc') list.sort((a, b) => a.priceFrom - b.priceFrom);
  if (sort === 'price-desc') list.sort((a, b) => b.priceFrom - a.priceFrom);
  if (sort === 'nights') list.sort((a, b) => a.nights - b.nights);

  res.render('pages/journeys', {
    title: 'Journeys — private, luxury, bespoke & group tours in Morocco | Moroccan Experience',
    desc: 'Twelve tailor-made Morocco journeys: private tours from $2,400 pp, luxury from $6,000 pp for 7 days, and group departures of 10–30 travellers from $2,000–$4,000 pp.',
    list,
    CATEGORIES,
    audiences,
    filters: { type, audience, nights, sort, q },
  });
});

router.get('/journeys/:slug', (req, res, next) => {
  const j = journeys.find((x) => x.slug === req.params.slug);
  if (!j) return next();
  const related = journeys.filter((x) => x.slug !== j.slug && (x.category === j.category || x.audience === j.audience)).slice(0, 3);
  const linkedDestinations = (j.itinerary || []).length ? destinations.filter((d) => j.name.toLowerCase().includes(d.name.split(' ')[0].toLowerCase()) || (d.journeys || []).includes(j.slug)).slice(0, 3) : [];
  const sampleParty = j.category === 'group' ? 20 : 2;
  res.render('pages/journey', {
    title: `${j.name} | Moroccan Experience`,
    desc: j.summary,
    j,
    related,
    linkedDestinations,
    tourType: tourTypes[j.category],
    preview: quote({ journeySlug: j.slug, travellers: sampleParty, nights: j.nights }),
    sampleParty,
    commercial: legal.COMMERCIAL,
  });
});

/* ── tour types ───────────────────────────────────────────────────────────── */
router.get('/tours/:type', (req, res, next) => {
  const t = tourTypes[req.params.type];
  if (!t) return next();
  const list = byCategory(req.params.type);
  if (req.params.type === 'group' && !req.query.audience) {
    return res.render('pages/tour-group', {
      title: 'Group tours in Morocco — women-only, students & seniors, 10–30 travellers | Moroccan Experience',
      desc: 'Group journeys for 10–30 travellers from $2,000 to $4,000 per person. Women-only, student and senior departures, plus private group charters on any date.',
      t,
      audiences,
      list,
    });
  }
  res.render('pages/tour-type', {
    title: `${t.name} in Morocco | Moroccan Experience`,
    desc: t.lede,
    t,
    list,
    audienceName: null,
  });
});

router.get('/tours/group/:audience', (req, res, next) => {
  const a = findAudience(req.params.audience);
  if (!a) return next();
  const list = byAudience(req.params.audience);
  res.render('pages/tour-audience', {
    title: `${a.name} in Morocco | Moroccan Experience`,
    desc: a.lede,
    a,
    t: tourTypes.group,
    list: list.length ? list : journeys.filter((j) => a.journeys.includes(j.slug)),
  });
});

/* ── destinations ─────────────────────────────────────────────────────────── */
router.get('/destinations', (req, res) => {
  res.render('pages/destinations', {
    title: 'Where to go in Morocco — destinations & seasons | Moroccan Experience',
    desc: 'Marrakech, Fes, the Sahara at Merzouga, Chefchaouen and the Rif, Essaouira, the High Atlas and the imperial north: what each is for, and when to go.',
    destinations,
  });
});

router.get('/destinations/:slug', (req, res, next) => {
  const d = findDestination(req.params.slug);
  if (!d) return next();
  const list = (d.journeys || []).map((s) => journeys.find((j) => j.slug === s)).filter(Boolean);
  res.render('pages/destination', {
    title: `${d.name} travel — itinerary ideas, best time to visit | Moroccan Experience`,
    desc: d.blurb,
    d,
    list,
    otherDestinations: destinations.filter((x) => x.slug !== d.slug).slice(0, 4),
  });
});

/* ── journal ──────────────────────────────────────────────────────────────── */
router.get('/journal', (req, res) => {
  res.render('pages/journal', {
    title: 'Journal — how to travel Morocco well | Moroccan Experience',
    desc: 'Planning notes, hammam etiquette, women travelling in Morocco, and how to choose between a private and a group journey.',
    posts,
  });
});

router.get('/journal/:slug', (req, res, next) => {
  const p = findPost(req.params.slug);
  if (!p) return next();
  res.render('pages/journal-post', {
    title: `${p.title} | Moroccan Experience Journal`,
    desc: p.lede,
    p,
    posts: posts.filter((x) => x.slug !== p.slug).slice(0, 3),
  });
});

/* ── company pages ────────────────────────────────────────────────────────── */
router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'About Moroccan Experience — Marrakech-based luxury travel designers',
    desc: 'Founded in Marrakech in 2005. Salaried Moroccan guides, 60% family-run properties, and travel designers who answer their own phones.',
    journeys: journeys.slice(0, 3),
  });
});

router.get('/why-us', (req, res) => {
  res.render('pages/why-us', {
    title: 'Why travel with Moroccan Experience | How we work',
    desc: 'No-obligation quotes, no planning fees, 24/7 on-the-ground line, expert private guides, and a 25% deposit that holds real inventory.',
    badges: config.badges,
    reviews: config.reviews,
    press: config.press,
  });
});

router.get('/contact', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact Moroccan Experience — call, WhatsApp or e-mail',
    desc: `Marrakech ${config.contact.phoneMa} · USA ${config.contact.phoneUsa} · ${config.contact.emailBookings}. Offices in Marrakech and Los Angeles.`,
  });
});

router.get('/faq', (req, res) => {
  res.render('pages/faq', {
    title: 'Booking FAQ — deposits, prices, groups and Morocco basics | Moroccan Experience',
    desc: 'Answers on the 25% deposit, luxury and group pricing, group sizes of 10–30 travellers, women-only departures, visas, flights and insurance.',
    faq: legal.faq,
    bookingConditionsUrl: '/booking-conditions',
  });
});

/* ── legal ────────────────────────────────────────────────────────────────── */
router.get('/booking-conditions', (req, res) => {
  res.render('pages/legal', {
    title: 'Booking conditions — deposits, balance and cancellation | Moroccan Experience',
    desc: '25% non-refundable deposit, balance 60 days before departure, cancellation scale from 25% to 100%, group minimums, and changes we make.',
    doc: legal.bookingConditions,
    kind: 'Booking conditions',
    kindSlug: 'booking-conditions',
    commercial: legal.COMMERCIAL,
  });
});

router.get('/privacy-policy', (req, res) => {
  res.render('pages/legal', {
    title: 'Privacy policy | Moroccan Experience',
    desc: 'What we collect, why, Stripe payment data, cookies, retention, transfers and your rights under GDPR, UK GDPR and Moroccan Law 09-08.',
    doc: legal.privacyPolicy,
    kind: 'Privacy policy',
    kindSlug: 'privacy-policy',
    commercial: legal.COMMERCIAL,
  });
});

router.get('/legal-terms', (req, res) => {
  res.render('pages/legal', {
    title: 'Legal terms & conditions of sale | Moroccan Experience',
    desc: 'Contract formation, quotations and pricing, our liability, AI assistant terms, force majeure, governing law and dispute resolution.',
    doc: legal.legalTerms,
    kind: 'Legal terms',
    kindSlug: 'legal-terms',
    commercial: legal.COMMERCIAL,
  });
});

/* ── search ───────────────────────────────────────────────────────────────── */
router.get('/search', (req, res) => {
  const q = String(req.query.q || '').trim();
  const s = q.toLowerCase();
  const results = s
    ? [
        ...journeys
          .filter((j) => (j.name + j.summary + j.category).toLowerCase().includes(s))
          .map((j) => ({ label: j.name, href: '/journeys/' + j.slug, kind: 'Journey', note: `${j.tourType.name} · ${j.nights} nights · from $${j.priceFrom} pp` })),
        ...destinations
          .filter((d) => (d.name + d.blurb + d.tagline).toLowerCase().includes(s))
          .map((d) => ({ label: d.name, href: '/destinations/' + d.slug, kind: 'Destination', note: d.tagline })),
        ...posts
          .filter((p) => (p.title + p.lede + p.category).toLowerCase().includes(s))
          .map((p) => ({ label: p.title, href: '/journal/' + p.slug, kind: 'Journal', note: p.category })),
        ...PAGES.filter((l) => (l.label + ' ' + l.href).toLowerCase().includes(s)).map((l) => ({ label: l.label, href: l.href, kind: 'Page', note: '' })),
      ]
    : [];
  res.render('pages/search', { title: `Search${q ? ': ' + q : ''} | Moroccan Experience`, desc: 'Search journeys, destinations and journal articles.', q, results });
});

/* ── sitemap ──────────────────────────────────────────────────────────────── */
function sitemapEntries() {
  const staticPages = [
    ['/', 'monthly', '1.0'],
    ['/journeys', 'weekly', '0.95'],
    ['/tours/private', 'weekly', '0.9'],
    ['/tours/luxury', 'weekly', '0.9'],
    ['/tours/bespoke', 'weekly', '0.9'],
    ['/tours/group', 'weekly', '0.9'],
    ['/tours/group/women', 'weekly', '0.85'],
    ['/tours/group/students', 'monthly', '0.8'],
    ['/tours/group/seniors', 'monthly', '0.8'],
    ['/destinations', 'monthly', '0.8'],
    ['/why-us', 'yearly', '0.6'],
    ['/about', 'yearly', '0.6'],
    ['/journal', 'weekly', '0.7'],
    ['/book', 'monthly', '0.9'],
    ['/contact', 'yearly', '0.5'],
    ['/faq', 'monthly', '0.5'],
    ['/booking-conditions', 'yearly', '0.4'],
    ['/privacy-policy', 'yearly', '0.3'],
    ['/legal-terms', 'yearly', '0.3'],
  ].map(([loc, changefreq, priority]) => ({ loc, changefreq, priority, label: loc }));
  return {
    staticPages,
    journeys: journeys.map((j) => ({ loc: '/journeys/' + j.slug, changefreq: 'weekly', priority: j.featured ? '0.9' : '0.8', label: j.name })),
    destinations: destinations.map((d) => ({ loc: '/destinations/' + d.slug, changefreq: 'monthly', priority: '0.7', label: d.name })),
    journal: posts.map((p) => ({ loc: '/journal/' + p.slug, changefreq: 'yearly', priority: '0.6', label: p.title })),
  };
}

router.get('/sitemap', (req, res) => {
  res.render('pages/sitemap', {
    title: 'Sitemap | Moroccan Experience',
    desc: 'Every page on moroccanexperience.com — journeys, tour types, destinations, journal articles, booking and legal pages.',
    tree: sitemapEntries(),
    tourTypes,
  });
});

router.get('/sitemap.xml', (req, res) => {
  const t = sitemapEntries();
  const urls = [...t.staticPages, ...t.journeys, ...t.destinations, ...t.journal];
  const lastmod = new Date().toISOString().slice(0, 10);
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${config.siteUrl}${u.loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
      )
      .join('\n') +
    '\n</urlset>\n';
  res.type('application/xml').send(xml);
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    ['User-agent: *', 'Allow: /', 'Disallow: /api/', 'Disallow: /booking/lookup', 'Disallow: /booking/demo-checkout', 'Disallow: /stripe/', '', `Sitemap: ${config.siteUrl}/sitemap.xml`, ''].join('\n')
  );
});

module.exports = router;
