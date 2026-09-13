'use strict';
/**
 * Central brand + business configuration.
 * Change numbers, e-mail addresses and commercial policy here — every page,
 * e-mail, sitemap entry and chat-agent answer reads from this file.
 */
require('dotenv').config();

const int = (v, d) => (v === undefined || v === '' ? d : parseInt(v, 10));

const config = {
  brand: {
    name: 'Moroccan Experience',
    short: 'Moroccan Experience',
    legalName: 'Moroccan Experience voyages SARL',
    baseline: 'The Morocco travel experts',
    tagline: 'Tailor-made journeys across Morocco. Est. 2005.',
    claim: 'Every journey starts with a feeling',
    foundedYear: 2005,
    licences: ['Moroccan Ministry of Tourism — Licence d’Agence de Voyages n° 270/02', 'IATA accredited agent · 78 3 2315 4'],
    address: {
      line1: '47 Derb Sidi Bouloucate, Riad Zone',
      line2: 'Marrakech 40000, Morocco',
      line3: 'Office 12, 1800 Century Park E, Los Angeles, CA 90067, USA',
    },
    social: [
      { label: 'Instagram', url: 'https://instagram.com' },
      { label: 'Facebook', url: 'https://facebook.com' },
      { label: 'YouTube', url: 'https://youtube.com' },
      { label: 'Pinterest', url: 'https://pinterest.com' },
    ],
  },

  contact: {
    // Display strings — every tel: link strips non-digits, so grouping here is safe.
    phoneMa: process.env.PHONE_MA || '+212 677 926 928',
    phoneUsa: process.env.PHONE_USA || '+1 623 282 1221',
    whatsapp: (process.env.WHATSAPP_NUMBER || '212677926928').replace(/\D/g, ''),
    emailBookings: process.env.EMAIL_BOOKINGS || 'bookings@moroccanexperience.com',
    emailTeam: process.env.EMAIL_TEAM || 'hello@moroccanexperience.com',
    hours: [
      { tz: 'Marrakech (GMT+1)', days: 'Mon–Sat', time: '08:30 – 19:30' },
      { tz: 'USA (Pacific)', days: 'Mon–Fri', time: '07:00 – 17:00 (overnight line for travellers in-country)' },
    ],
    emergencyNote: 'A 24/7 in-country line stays open for every guest while travelling with us.',
  },

  currency: (process.env.CURRENCY || 'usd').toLowerCase(),
  currencySymbol: '$',

  deposit: {
    percent: int(process.env.DEPOSIT_PERCENT, 25),
    balanceDueDaysBefore: 60,
    minBookingLeadDays: 21,
  },

  pricing: {
    // Group tours: 10 – 30 travellers, $2,000 – $4,000 per person.
    group: { minTravellers: 10, maxTravellers: 30, minPerPerson: 2000, maxPerPerson: 4000 },
    luxury: { minPerPerson: 6000, benchmarkNights: 7 },
    privateMin: 2400,
    bespokeMin: 3600,
    seasonMultipliers: { low: 0.9, shoulder: 1, peak: 1.18 },
    peakMonths: [0, 6, 7, 11], // Jan, Jul, Aug, Dec
    easterMonths: [2, 3],
    singleSupplementPct: 0.18,
    amendmentFee: 75,
  },

  payments: {
    stripeSecret: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    get enabled() {
      return /^sk_(live|test)_/.test(this.stripeSecret);
    },
  },

  agent: {
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
    openaiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    baseUrl: process.env.LLM_BASE_URL || '',
    maxMessages: 14,
    requestTimeoutMs: 25000,
  },

  nav: [
    {
      label: 'Journeys',
      href: '/journeys',
      children: [
        { label: 'Private tours', href: '/tours/private', blurb: 'Just your party, your pace, your guide' },
        { label: 'Luxury tours', href: '/tours/luxury', blurb: 'From $6,000 pp · 7 days' },
        { label: 'Bespoke tours', href: '/tours/bespoke', blurb: 'Designed from a blank page with you' },
        { label: 'Group tours', href: '/tours/group', blurb: 'Women-only, students & seniors · 10–30 travellers' },
      ],
    },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Why us', href: '/why-us' },
    { label: 'Journal', href: '/journal' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],

  footerColumns: [
    {
      title: 'Journeys',
      links: [
        { label: 'Private tours', href: '/tours/private' },
        { label: 'Luxury tours', href: '/tours/luxury' },
        { label: 'Bespoke tours', href: '/tours/bespoke' },
        { label: 'Group tours', href: '/tours/group' },
        { label: 'All journeys', href: '/journeys' },
      ],
    },
    {
      title: 'Group travel',
      links: [
        { label: 'Women-only journeys', href: '/tours/group/women' },
        { label: 'Student journeys', href: '/tours/group/students' },
        { label: 'Senior journeys', href: '/tours/group/seniors' },
        { label: 'Group pricing & sizes', href: '/tours/group#pricing' },
      ],
    },
    {
      title: 'Book with confidence',
      links: [
        { label: 'Plan my trip', href: '/book' },
        { label: 'Booking conditions', href: '/booking-conditions' },
        { label: 'Booking FAQ', href: '/faq' },
        { label: 'Privacy policy', href: '/privacy-policy' },
        { label: 'Legal terms', href: '/legal-terms' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About us', href: '/about' },
        { label: 'Destinations', href: '/destinations' },
        { label: 'Journal', href: '/journal' },
        { label: 'Contact', href: '/contact' },
        { label: 'Sitemap', href: '/sitemap' },
      ],
    },
  ],

  reviews: [
    { quote: 'Hands down the most remarkable journey our family has ever taken.', name: 'Brett', from: 'Middle East trip', score: 5 },
    { quote: 'Every detail was thought through before we knew we needed it. Nothing was left to chance.', name: 'Ike & Alexa', from: 'Fes & the Imperial Cities', score: 5 },
    { quote: 'Wonderful, wonderful, wonderful — you will not be disappointed.', name: 'Wendy', from: 'Luxury Sahara, 7 nights', score: 5 },
    { quote: 'A dream come true: small riads, a mountain fortress and a desert oasis.', name: 'Kim', from: 'Bespoke Atlas expedition', score: 5 },
    { quote: 'The women-only group was the first holiday where I never once felt out of place.', name: 'Nadia', from: 'Women-only Atlas & Coast', score: 5 },
    { quote: 'Our student group of 24 moved through the medinas like we had a local family here.', name: 'Prof. Almeida', from: 'Student Discovery, 10 nights', score: 5 },
  ],

  press: [
    { quote: 'An award-winning travel company specialising in tailor-made experiences for those in search of unique travels.', source: 'Modern Luxury' },
    { quote: 'Many companies promise once-in-a-lifetime trips. Here it isn’t hyperbole.', source: 'CNBC Traveller' },
    { quote: 'The most quietly influential Morocco specialists you have not heard of yet.', source: 'Robb Report' },
    { quote: 'Luxury travel with intention — thoughtfully planned, impeccably delivered.', source: 'Condé Nast Traveller' },
  ],

  badges: [
    { title: 'Award-winning planners', text: 'Best Custom Luxury Holidays, 3 years running' },
    { title: 'No-obligation quotes', text: 'Itineraries and pricing, no strings attached' },
    { title: 'No planning fees', text: 'Design time is included, never billed' },
    { title: '24/7 on the ground', text: 'A real person answers, wherever you are' },
    { title: 'Expert private guides', text: 'Licensed, hand-picked, mostly with us 10+ years' },
  ],
};

config.siteUrl = (process.env.BASE_URL || 'http://localhost:' + (process.env.PORT || 3000)).replace(/\/$/, '');

// Bumped once per process start, so every deploy gets a fresh query string on
// /css/styles.css and /js/site.js — this busts the 7/30-day browser cache set
// by express.static below, so CSS/JS fixes show up immediately after deploy
// instead of waiting out the cache lifetime.
config.assetVersion = Date.now();

module.exports = config;
