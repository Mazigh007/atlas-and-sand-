'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const db = require('../services/db');
const chatAgent = require('../services/chatAgent');
const { quote, EXTRA_OPTIONS } = require('../services/pricing');
const { journeys } = require('../data/journeys');
const { destinations } = require('../data/destinations');
const stripeService = require('../services/stripeService');

const router = express.Router();

const limiter = rateLimit({ windowMs: 60_000, max: 25, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests — slow down and try again in a minute.' } });
const strictLimiter = rateLimit({ windowMs: 60_000, max: 8, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many enquiries in a row. Please WhatsApp ' + config.contact.phoneMa + '.' } });

/** The assistant endpoint. */
router.post('/chat', limiter, async (req, res) => {
  try {
    const body = req.body || {};
    const result = await chatAgent.respond(body.messages, {
      page: body.context && body.context.page,
      journey: body.context && body.context.journey,
      form: body.context && body.context.form,
    });
    const suggestions = Array.from(new Set([...(result.suggestions || []), ...defaultSuggestions(result.mode)])).slice(0, 4);
    res.json({
      reply: result.reply,
      mode: result.mode,
      source: result.source || null,
      links: result.links || [],
      suggestions,
      handoff: { whatsapp: waLink(body), phoneMa: config.contact.phoneMa, phoneUsa: config.contact.phoneUsa, email: config.contact.emailBookings },
    });
  } catch (e) {
    console.error('[api/chat]', e);
    res.status(500).json({ error: 'Assistant is unavailable — WhatsApp us on ' + config.contact.phoneMa + ' and a designer will pick it up.' });
  }
});

function defaultSuggestions(mode) {
  return mode === 'offline' ? ['Price a luxury tour', 'Women-only group', 'Cancellation terms'] : ['Send me a proposal', 'Talk to a human'];
}

function waLink() {
  return `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent('Hi Moroccan Experience — I have a question about a Morocco trip.')}`;
}

/** Optional: the assistant can open a lead record so a designer calls back. */
router.post('/chat/lead', strictLimiter, async (req, res) => {
  const b = req.body || {};
  const email = String(b.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return res.status(422).json({ error: 'Please check the e-mail address.' });
  const lead = {
    at: new Date().toISOString(),
    name: String(b.name || '').slice(0, 80),
    email,
    phone: String(b.phone || '').slice(0, 30),
    interest: String(b.interest || '').slice(0, 120),
    from: String(b.page || '').slice(0, 160),
    transcriptTail: Array.isArray(b.messages) ? b.messages.slice(-4).map((m) => ({ role: m.role, content: String(m.content).slice(0, 300) })) : [],
  };
  try {
    await db.insert('leads', lead);
    res.json({ ok: true, message: `Thank you${lead.name ? ', ' + lead.name.split(' ')[0] : ''} — a travel designer will be in touch within one business day. For anything urgent, WhatsApp ${config.contact.phoneMa}.` });
  } catch (e) {
    console.error('[api/chat/lead]', e);
    res.status(503).json({ error: 'Could not save that right now — WhatsApp us on ' + config.contact.phoneMa + ' instead.' });
  }
});

router.post('/newsletter', strictLimiter, async (req, res) => {
  const email = String((req.body || {}).email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return res.status(422).json({ error: 'That e-mail does not look right.' });
  try {
    await db.insert('newsletter', { at: new Date().toISOString(), email });
    res.json({ ok: true, message: 'Subscribed. Expect one letter a month: routes that are working right now, and what the heat is doing.' });
  } catch (e) {
    console.error('[api/newsletter]', e);
    res.status(503).json({ error: 'Could not subscribe right now — please try again shortly.' });
  }
});

/** Live quote for the booking form (also used by the assistant context). */
router.post('/quote', (req, res) => {
  try {
    const b = req.body || {};
    const q = quote({
      journeySlug: b.journey || '',
      category: b.category || 'private',
      travellers: Number(b.travellers) || 2,
      nights: Number(b.nights) || 7,
      startDate: b.startDate || '',
      single: b.single === 'on' || b.single === true || b.single === true,
      extras: b.extras ? (Array.isArray(b.extras) ? b.extras : [b.extras]) : [],
      leadOnly: b.mode === 'enquiry',
    });
    res.json({ quote: q, depositPercent: config.deposit.percent, paymentMode: stripeService.describe().mode });
  } catch (e) {
    res.status(400).json({ error: 'Could not price that combination.' });
  }
});

router.get('/journeys', (req, res) => {
  res.json(
    journeys.map((j) => ({
      slug: j.slug,
      name: j.name,
      category: j.category,
      audience: j.audience,
      nights: j.nights,
      priceFrom: j.priceFrom,
      priceMax: j.priceMax,
      summary: j.summary,
      season: j.season,
      url: '/journeys/' + j.slug,
    }))
  );
});

router.get('/destinations', (req, res) => res.json(destinations.map(({ slug, name, best, tagline }) => ({ slug, name, best, tagline, url: '/destinations/' + slug }))));

router.get('/health', async (req, res) => {
  let bookings = null;
  let dbOk = true;
  try {
    bookings = (await db.all('bookings')).length;
  } catch (e) {
    console.error('[api/health] db unreachable', e);
    dbOk = false;
  }
  res.status(dbOk ? 200 : 503).json({
    ok: dbOk,
    service: config.brand.name,
    payments: stripeService.describe(),
    assistant: { mode: chatAgent.providerReady() ? 'llm' : 'offline', provider: config.agent.anthropicKey ? 'anthropic' : config.agent.openaiKey ? 'openai' : 'built-in expert' },
    bookings,
    journeys: journeys.length,
  });
});

module.exports = router;
