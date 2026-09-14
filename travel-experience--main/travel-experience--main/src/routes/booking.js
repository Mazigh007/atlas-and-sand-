'use strict';
/**
 * Booking + payment flow.
 * GET  /book                     booking form (live quote, 25% deposit)
 * POST /book                     create booking, take the customer to Stripe Checkout (or demo pay)
 * GET  /booking/confirmation     reference + status
 * GET  /booking/demo-checkout    simulated card page used when no Stripe key is set
 * POST /booking/demo-pay         marks the demo deposit paid
 * GET  /booking/cancelled        returned here from Stripe if payment is abandoned
 * GET|POST /booking/lookup       find a booking by reference + e-mail
 */
const express = require('express');
const config = require('../config');
const db = require('../services/db');
const stripeService = require('../services/stripeService');
const { quote, EXTRA_OPTIONS } = require('../services/pricing');
const { journeys } = require('../data/journeys');
const { tourTypes, audiences } = require('../data/tourTypes');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function num(v, d) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : d;
}

function normaliseForm(body) {
  const extras = body.extras ? (Array.isArray(body.extras) ? body.extras : [body.extras]) : [];
  return {
    mode: body.mode === 'enquiry' ? 'enquiry' : 'quote',
    journeySlug: body.journey || '',
    category: body.category || 'private',
    audience: body.audience || '',
    nights: num(body.nights, 7),
    travellers: num(body.travellers, 2),
    startDate: body.startDate || '',
    single: body.single === 'on' || body.single === true,
    extras: extras.filter((e) => EXTRA_OPTIONS[e]),
    leadOnly: body.mode === 'enquiry',
    contact: {
      title: (body.title || '').toString().slice(0, 10),
      firstName: (body.firstName || '').toString().trim().slice(0, 60),
      lastName: (body.lastName || '').toString().trim().slice(0, 60),
      email: (body.email || '').toString().trim().toLowerCase().slice(0, 120),
      phone: (body.phone || '').toString().trim().slice(0, 30),
      country: (body.country || '').toString().trim().slice(0, 60),
      partyLead: (body.partyLead || '').toString().trim().slice(0, 60),
      diet: (body.diet || '').toString().trim().slice(0, 200),
      notes: (body.notes || '').toString().trim().slice(0, 2000),
    },
    consent: {
      conditions: body.acceptConditions === 'on',
      privacy: body.acceptPrivacy === 'on',
      marketing: body.acceptMarketing === 'on',
    },
    payNow: body.payNow !== 'no',
  };
}

function validate(f) {
  const errors = [];
  const c = f.contact;
  if (!c.firstName) errors.push({ field: 'firstName', msg: 'We need a first name to address you.' });
  if (!c.lastName) errors.push({ field: 'lastName', msg: 'We need a surname for the booking record.' });
  if (!EMAIL_RE.test(c.email)) errors.push({ field: 'email', msg: 'Enter an e-mail address we can send the proposal and invoice to.' });
  if (c.phone.replace(/\D/g, '').length < 8) errors.push({ field: 'phone', msg: 'Enter a phone number with country code — this is the number we use if something changes.' });
  if (f.mode !== 'enquiry') {
    if (!f.journeySlug) errors.push({ field: 'journey', msg: 'Choose a journey, or switch to “request a proposal”.' });
    if (f.startDate) {
      const d = new Date(f.startDate + 'T12:00:00');
      const lead = (d - new Date()) / 86400000;
      if (Number.isNaN(d.getTime())) errors.push({ field: 'startDate', msg: 'That departure date is not a valid date.' });
      else if (lead < 0) errors.push({ field: 'startDate', msg: 'That date is in the past.' });
      else if (lead < config.deposit.minLeadDays) {
        errors.push({ field: 'startDate', msg: `Less than ${config.deposit.minLeadDays} days away — call us on ${config.contact.phoneMa} and we will try.` });
      }
    } else {
      errors.push({ field: 'startDate', msg: 'Pick an approximate departure date; it sets the season rate.' });
    }
    if (f.category === 'group') {
      const { minTravellers, maxTravellers } = config.pricing.group;
      if (f.travellers < minTravellers) errors.push({ field: 'travellers', msg: `Group departures run with ${minTravellers} travellers or more. Below that, switch to a private tour.` });
      if (f.travellers > 300) errors.push({ field: 'travellers', msg: 'For parties above 300, contact us directly to build a custom departure.' });
    } else if (f.travellers < 1 || f.travellers > 60) {
      errors.push({ field: 'travellers', msg: 'Enter a party size between 1 and 60.' });
    }
    if (!f.consent.conditions) errors.push({ field: 'acceptConditions', msg: 'Please accept the booking conditions — they set out the 25% deposit and cancellation charges.' });
    if (!f.consent.privacy) errors.push({ field: 'acceptPrivacy', msg: 'Please accept the privacy policy so we can hold your details for this enquiry.' });
  } else if (!f.consent.privacy) {
    errors.push({ field: 'acceptPrivacy', msg: 'Please accept the privacy policy so we can reply to your enquiry.' });
  }
  return errors;
}

function baseUrl(req) {
  if (config.siteUrl && !/localhost|127\.0\.0\.1/.test(config.siteUrl)) return config.siteUrl;
  return (req.headers['x-forwarded-proto'] || req.protocol) + '://' + req.headers.host;
}

const journeyOptions = () =>
  journeys.map((j) => ({
    slug: j.slug,
    name: j.name,
    category: j.category,
    categoryName: j.tourType.name,
    audience: j.audience,
    nights: j.nights,
    priceFrom: j.priceFrom,
    priceMax: j.priceMax,
    featured: j.featured,
  }));

/* ── the form ─────────────────────────────────────────────────────────────── */
router.get('/book', (req, res) => {
  const q = req.query;
  const j = journeys.find((x) => x.slug === q.journey);
  const form = {
    mode: q.mode === 'enquiry' ? 'enquiry' : 'quote',
    journey: j ? j.slug : '',
    category: j ? j.category : q.category || 'private',
    nights: num(q.nights, j ? j.nights : 7),
    travellers: num(q.travellers, j && j.category === 'group' ? 20 : 2),
    startDate: q.startDate || '',
    single: q.single === '1',
    extras: q.extras ? String(q.extras).split(',').filter((e) => EXTRA_OPTIONS[e]) : [],
  };
  res.render('pages/booking', {
    title: 'Book a Morocco journey — 25% deposit | Moroccan Experience',
    desc: 'Build your itinerary, see the price and pay a 25% deposit by card through Stripe. Balance due 60 days before departure.',
    form,
    initialQuote: quote(Object.assign({}, form, { journeySlug: form.journey, leadOnly: form.mode === 'enquiry' })),
    journeyOptions: journeyOptions(),
    tourTypes,
    audiences,
    extrasCatalogue: EXTRA_OPTIONS,
    errors: [],
    values: { contact: {}, consent: {} },
  });
});

/* ── submit ───────────────────────────────────────────────────────────────── */
router.post('/book', async (req, res, next) => {
  try {
    if (req.body.company_website) return res.redirect('/book'); // honeypot
    const f = normaliseForm(req.body);
    const errors = validate(f);
    if (errors.length) {
      return res.status(422).render('pages/booking', {
        title: 'Book a Morocco journey — 25% deposit | Moroccan Experience',
        desc: 'Build your itinerary, see the price and pay a 25% deposit by card through Stripe.',
        form: Object.assign({}, f, { journey: f.journeySlug, extras: f.extras }),
        initialQuote: quote(f),
        journeyOptions: journeyOptions(),
        tourTypes,
        audiences,
        extrasCatalogue: EXTRA_OPTIONS,
        errors,
        values: f,
      });
    }

    const pricing = f.leadOnly ? quote(Object.assign({}, f, { leadOnly: true })) : quote(f);
    const journey = journeys.find((x) => x.slug === f.journeySlug);
    const ref = await db.nextRef();
    const booking = {
      ref,
      createdAt: new Date().toISOString(),
      status: f.leadOnly ? 'enquiry_received' : 'pending_deposit',
      mode: f.leadOnly ? 'enquiry' : 'booking',
      journeySlug: journey ? journey.slug : null,
      journeyName: journey ? journey.name : 'Bespoke proposal',
      category: f.category,
      audience: f.audience || (journey && journey.audience) || null,
      contact: f.contact,
      consent: f.consent,
      pricing,
      paymentProvider: stripeService.enabled() ? 'stripe' : 'demo',
      stripeSessionId: null,
      depositPaidAt: null,
      source: req.headers.referer || 'direct',
    };
    await db.insert('bookings', booking);

    if (f.leadOnly) return res.redirect('/booking/confirmation?ref=' + ref + '&status=enquiry');
    if (!f.payNow) return res.redirect('/booking/confirmation?ref=' + ref + '&status=pending');

    const session = await stripeService.createCheckoutSession(booking, baseUrl(req));
    return res.redirect(session.url);
  } catch (e) {
    next(e);
  }
});

/* ── confirmation ─────────────────────────────────────────────────────────── */
router.get('/booking/confirmation', async (req, res, next) => {
  const booking = (await db.all('bookings')).find((b) => b.ref === req.query.ref);
  if (!booking) return next();
  res.render('pages/booking-confirmation', {
    title: `Booking ${booking.ref} — confirmed with us | Moroccan Experience`,
    desc: 'Your enquiry and deposit reference.',
    booking,
    status: req.query.status || booking.status,
    noIndex: true,
  });
});

router.get('/booking/cancelled', async (req, res, next) => {
  const booking = (await db.all('bookings')).find((b) => b.ref === req.query.ref);
  if (!booking) return next();
  res.render('pages/booking-cancelled', {
    title: `Payment not completed — ${booking.ref}`,
    desc: 'Your itinerary is held while you decide.',
    booking,
    noIndex: true,
  });
});

/* ── demo checkout (no Stripe key configured) ─────────────────────────────── */
router.get('/booking/demo-checkout', async (req, res, next) => {
  const booking = (await db.all('bookings')).find((b) => b.ref === req.query.ref);
  if (!booking) return next();
  res.render('pages/booking-demo-checkout', {
    title: `Secure payment — ${booking.ref}`,
    desc: 'Simulated Stripe Checkout for development.',
    booking,
    noIndex: true,
  });
});

router.post('/booking/demo-pay', async (req, res, next) => {
  try {
    const booking = (await db.all('bookings')).find((b) => b.ref === req.body.ref);
    if (!booking) return next();
    const card = String(req.body.card || '').replace(/\D/g, '');
    if (card.length !== 16) {
      return res.status(422).render('pages/booking-demo-checkout', {
        title: `Secure payment — ${booking.ref}`,
        desc: '',
        booking,
        error: 'A 16-digit test card number is required (try 4242 4242 4242 4242).',
        noIndex: true,
      });
    }
    await stripeService.markDepositPaid(booking.ref, { sessionId: 'demo_' + booking.ref, method: 'demo_card' });
    res.redirect('/booking/confirmation?ref=' + booking.ref + '&status=paid');
  } catch (e) {
    next(e);
  }
});

/* ── lookup ───────────────────────────────────────────────────────────────── */
router.get('/booking/lookup', (req, res) => {
  res.render('pages/booking-lookup', {
    title: 'Find my booking | Moroccan Experience',
    desc: 'Look up a booking with your reference and e-mail address.',
    booking: null,
    error: null,
    noIndex: true,
  });
});

router.post('/booking/lookup', async (req, res) => {
  const ref = String(req.body.ref || '').trim().toUpperCase();
  const email = String(req.body.email || '').trim().toLowerCase();
  const booking = (await db.all('bookings')).find((b) => b.ref === ref && (!email || b.contact.email === email));
  if (!booking) {
    return res.render('pages/booking-lookup', {
      title: 'Find my booking | Moroccan Experience',
      desc: '',
      booking: null,
      error: 'Nothing matched that reference and e-mail. Check the reference (it looks like ME-2026-00042) or WhatsApp ' + config.contact.phoneMa + ' and we will find it.',
      noIndex: true,
    });
  }
  res.render('pages/booking-confirmation', {
    title: `Booking ${booking.ref} | Moroccan Experience`,
    desc: '',
    booking,
    status: booking.status,
    noIndex: true,
  });
});

/* ── calendar file for the trip ───────────────────────────────────────────── */
router.get('/booking/:ref.ics', async (req, res, next) => {
  const booking = (await db.all('bookings')).find((b) => b.ref === req.params.ref);
  if (!booking) return next();
  const p = booking.pricing || {};
  const start = p.startDate ? p.startDate.replace(/-/g, '') : null;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Moroccan Experience//Booking//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:' + booking.ref + '@moroccanexperience.com',
    'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    start ? 'DTSTART;VALUE=DATE:' + start : 'DTSTART:' + new Date(Date.now() + 86400000 * 30).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    start ? 'DTEND;VALUE=DATE:' + new Date(new Date(p.startDate + 'T12:00:00').getTime() + 86400000 * (p.nights + 1)).toISOString().slice(0, 10).replace(/-/g, '') : 'DTEND:' + new Date(Date.now() + 86400000 * 38).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    'SUMMARY:' + (booking.journeyName || 'Morocco journey') + ' — ' + booking.ref,
    'DESCRIPTION:' + (p.travellers || 1) + ' travellers, ' + (p.nights || 7) + ' nights. Deposit ' + (config.currencySymbol + (p.deposit || 0)) + '. Balance ' + (config.currencySymbol + (p.balance || 0)) + ' due ' + (p.balanceDueDaysBefore || 60) + ' days before departure. Contact ' + config.contact.emailBookings + '.',
    'LOCATION:Marrakech, Morocco',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  res.type('text/calendar').set('Content-Disposition', 'attachment; filename="' + booking.ref + '.ics' + '"').send(lines.join('\r\n'));
});

module.exports = router;
