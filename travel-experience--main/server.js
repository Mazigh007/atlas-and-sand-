'use strict';
/**
 * Moroccan Experience — tailor-made luxury travel in Morocco.
 * Express app: rendered site, Stripe deposit checkout, travel assistant API,
 * sitemap and robots.
 */
require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');

const config = require('./src/config');
const { journeys, CATEGORIES } = require('./src/data/journeys');
const { destinations } = require('./src/data/destinations');
const { posts } = require('./src/data/journal');
const { tourTypes, audiences } = require('./src/data/tourTypes');
const pages = require('./src/routes/pages');
const booking = require('./src/routes/booking');
const api = require('./src/routes/api');
const stripeService = require('./src/services/stripeService');
const db = require('./src/services/db');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);
app.disable('x-powered-by');

/* Stripe webhook must see the raw body, so it is mounted before the parsers. */
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const { constructWebhookEvent } = require('./src/services/stripeService');
  const { event, error } = constructWebhookEvent(req.body, req.headers['stripe-signature']);
  if (error) return res.status(400).send('Webhook error: ' + error);
  try {
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      const obj = event.data.object;
      const ref = obj.client_reference_id || (obj.metadata && obj.metadata.booking_ref);
      const chargeId = obj.payment_intent || obj.id;
      if (ref) {
        const paid = await stripeService.markDepositPaid(ref, {
          sessionId: obj.id,
          chargeId,
          amountCents: obj.amount_total ?? obj.amount_received,
          method: 'stripe_checkout',
        });
        if (paid) console.log('[stripe] deposit recorded for', ref, 'status', paid.status);
      }
    }
    if (event.type === 'checkout.session.expired') {
      const ref = event.data.object.client_reference_id;
      if (ref) await db.update('bookings', (b) => b.ref === ref, { status: 'deposit_lapsed' });
    }
    res.json({ received: true });
  } catch (e) {
    console.error('[stripe] webhook handler failed', e);
    res.status(500).json({ error: 'handler failed' });
  }
});

app.use(compression());
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '128kb' }));
app.use(
  '/static',
  express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0,
    immutable: true,
  })
);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0 }));

/* Catalogue data available to every view and partial. */
app.locals.journeys = journeys;
app.locals.destinations = destinations;
app.locals.posts = posts;
app.locals.tourTypes = tourTypes;
app.locals.audiences = audiences;
app.locals.CATEGORIES = CATEGORIES;
app.locals.press = config.press;
app.locals.badges = config.badges;
app.locals.reviews = config.reviews;

/* Request locals available to every template. */
app.use((req, res, next) => {
  res.locals.config = config;
  res.locals.path = req.path;
  res.locals.query = req.query;
  res.locals.stripe = stripeService.describe();
  res.locals.agentMode = require('./src/services/chatAgent').providerReady() ? 'llm' : 'offline';
  res.locals.year = new Date().getFullYear();
  res.locals.canonical = config.siteUrl + req.path.replace(/\/$/, '') || config.siteUrl;
  res.locals.nonce = Math.random().toString(36).slice(2, 10);
  next();
});

app.use('/', pages);
app.use('/', booking);
app.use('/api', api);

/* 404 */
app.use((req, res) => {
  res.status(404);
  res.render('errors/404', { title: 'Page not found', desc: 'That page has moved or never existed.' });
});

/* Errors */
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500);
  res.render('errors/500', { title: 'Something went wrong', desc: '', error: process.env.NODE_ENV === 'production' ? null : String(err.message || err) });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ${config.brand.name} — ${config.brand.baseline}`);
    console.log(`  http://localhost:${PORT}`);
    console.log(`  [DEBUG] process.env.BASE_URL = ${JSON.stringify(process.env.BASE_URL)}`);
    console.log(`  [DEBUG] config.siteUrl = ${JSON.stringify(config.siteUrl)}`);
    console.log(`  Payments: ${stripeService.describe().mode === 'demo' ? 'DEMO (add STRIPE_SECRET_KEY to .env for real Stripe Checkout)' : 'Stripe ' + stripeService.describe().mode}`);
    console.log(`  Assistant: ${require('./src/services/chatAgent').providerReady() ? 'LLM connected' : 'offline expert (set ANTHROPIC_API_KEY or OPENAI_API_KEY for the live model)'}\n`);
  });
}

module.exports = app;
