'use strict';
/**
 * Stripe integration for the 25% deposit.
 *  · STRIPE_SECRET_KEY present  → real Stripe Checkout Session (+ webhook).
 *  · absent                     → DEMO mode: the same flow, a simulated payment
 *    page, and the booking is marked deposit_paid so the site can be tested end
 *    to end without a key.
 */
const config = require('../config');
const db = require('./db');
const { toCents } = require('./pricing');

let stripe = null;
if (config.payments.enabled) {
  const Stripe = require('stripe');
  stripe = new Stripe(config.payments.stripeSecret, { apiVersion: '2024-06-20', typescript: false });
}

const enabled = () => Boolean(stripe);

function describe() {
  return {
    enabled: enabled(),
    mode: enabled() ? (config.payments.stripeSecret.startsWith('sk_live') ? 'live' : 'test') : 'demo',
    depositPercent: config.deposit.percent,
    currency: config.currency,
  };
}

function depositLine(booking) {
  const p = booking.pricing;
  return {
    price_data: {
      currency: config.currency,
      unit_amount: toCents(p.deposit),
      product_data: {
        name: `${booking.journeyName || 'Morocco journey'} — ${p.depositPercent}% deposit`,
        description: [
          `${p.travellers} traveller${p.travellers > 1 ? 's' : ''} · ${p.nights} nights`,
          `Trip total ${config.currencySymbol}${Number(p.tripTotal).toLocaleString('en-US')}`,
          `Balance ${config.currencySymbol}${Number(p.balance).toLocaleString('en-US')} due ${p.balanceDueDaysBefore} days before departure`,
        ].join(' · '),
      },
    },
    quantity: 1,
  };
}

async function createCheckoutSession(booking, baseUrl) {
  const meta = {
    booking_ref: booking.ref,
    journey: booking.journeySlug || 'custom',
    travellers: String(booking.pricing.travellers),
    trip_total_usd: String(booking.pricing.tripTotal),
    deposit_usd: String(booking.pricing.deposit),
  };
  if (!enabled()) {
    return { demo: true, url: `${baseUrl}/booking/demo-checkout?ref=${booking.ref}`, sessionId: 'demo_' + booking.ref };
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: booking.ref,
    customer_email: booking.contact.email,
    locale: 'auto',
    allow_promotion_codes: false,
    billing_address_collection: 'auto',
    submit_type: 'pay',
    line_items: [depositLine(booking)],
    metadata: meta,
    payment_intent_data: { metadata: meta, description: `${booking.ref} deposit` },
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 23, // 23h (Stripe's hard cap is 24h)
    success_url: `${baseUrl}/booking/confirmation?ref=${booking.ref}&session_id={CHECKOUT_SESSION_ID}&status=paid`,
    cancel_url: `${baseUrl}/booking/cancelled?ref=${booking.ref}`,
  });
  await db.update('bookings', (b) => b.ref === booking.ref, { stripeSessionId: session.id, status: 'awaiting_deposit' });
  return { demo: false, url: session.url, sessionId: session.id };
}

/** Marks a booking paid; idempotent, and safe to call from the webhook or the demo flow. */
async function markDepositPaid(ref, { sessionId, amountCents, method, chargeId }) {
  const rows = await db.all('bookings');
  const booking = rows.find((b) => b.ref === ref);
  if (!booking) return null;
  if (booking.depositPaidAt && booking.stripeSessionId === sessionId && method !== 'demo') return booking;
  await db.insert('payments', {
    at: new Date().toISOString(),
    ref,
    sessionId: sessionId || null,
    chargeId: chargeId || null,
    amountCents: amountCents == null ? toCents(booking.pricing.deposit) : amountCents,
    currency: config.currency,
    method: method || 'stripe_checkout',
  });
  return db.update(
    'bookings',
    (b) => b.ref === ref,
    { status: 'deposit_paid', depositPaidAt: new Date().toISOString(), stripeSessionId: sessionId || booking.stripeSessionId || null }
  );
}

async function retrieveSession(id) {
  if (!enabled()) return null;
  return stripe.checkout.sessions.retrieve(id);
}

function constructWebhookEvent(rawBody, signature) {
  if (!config.payments.stripeWebhookSecret) return { error: 'no webhook secret configured' };
  try {
    return { event: stripe.webhooks.constructEvent(rawBody, signature, config.payments.stripeWebhookSecret) };
  } catch (e) {
    return { error: e.message };
  }
}

module.exports = { enabled, describe, createCheckoutSession, markDepositPaid, retrieveSession, constructWebhookEvent };
