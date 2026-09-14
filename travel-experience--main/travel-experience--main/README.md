# Moroccan Experience

Tailor-made luxury travel in Morocco — an editorial travel-operator site with a real booking flow,
a **25 % deposit taken through Stripe**, published journey families (private · luxury · bespoke ·
group), a travel-assistant chat agent, and the legal furniture a booking site needs
(booking conditions, privacy policy, legal terms, sitemap).

Design and structure are modelled on the layout conventions of a modern luxury tour operator:
full-bleed photography, serif display type, an itinerary-first content model, and a quote that is
calculated server-side rather than in the browser.

---

## Quick start

```bash
npm install
cp .env.example .env      # optional — the app runs with safe defaults and no keys
npm start                 # http://localhost:3000
npm run dev               # auto-restart on file change
npm test                  # 9 pricing-invariant tests (luxury floor, group band, 25 % deposit)
```

The site works with **zero configuration**: pages render, prices calculate, bookings are written to
`data/store/`, payments run in *demo mode*, and the chat assistant uses its built-in Morocco expert.

---

## What is implemented

| Area | Where |
|---|---|
| Home (hero slideshow, journey families, group band, reviews, destinations, press) | `views/pages/home.ejs` |
| Journey catalogue with filters (type, audience, nights, sort, search) | `views/pages/journeys.ejs`, `src/routes/pages.js` |
| 14 itinerary pages: day-by-day, inclusions, departures, live price panel | `src/data/journeys.js`, `views/pages/journey.ejs` |
| Journey families — private, luxury, bespoke, group | `src/data/tourTypes.js`, `views/pages/tour-type*.ejs` |
| Group audiences — women-only, students, seniors (10–30 travellers) | `views/pages/tour-audience.ejs` |
| Group price calculator (band $2,000–$4,000 by party size) | `#/pricing` on `/tours/group`, `public/js/site.js` |
| Booking form with live quote, validation and the 25 % deposit | `views/pages/booking.ejs`, `src/routes/booking.js` |
| Stripe Checkout + webhook (idempotent), demo checkout fallback | `src/services/stripeService.js` |
| Booking reference, confirmation page, `.ics` calendar file, status lookup | `/booking/confirmation`, `/booking/:ref.ics`, `/booking/lookup` |
| Travel assistant (LLM-first, offline expert fallback, handoff to phone/WhatsApp, lead capture) | `src/services/chatAgent.js`, `src/data/knowledge.js`, `public/js/chat.js` |
| Back-to-top button with scroll-progress ring | `views/partials/widgets.ejs`, `public/js/site.js` |
| Booking conditions · privacy policy · legal terms · FAQ | `src/data/legal.js`, `views/pages/legal.ejs` |
| HTML sitemap, `/sitemap.xml`, `/robots.txt`, JSON-LD (TravelAgency, FAQPage), Open Graph | `src/routes/pages.js` |
| Cookie consent with essential/all choice | `public/js/site.js` |

### Contact details (already wired in)

* **Marrakech team** — `+212 677 926 928` · phone and WhatsApp
* **USA office** — `+1 623 282 1221` · phone and WhatsApp

Change them once in `src/config.js` (or via `PHONE_MA` / `PHONE_USA` / `WHATSAPP_NUMBER` in `.env`)
and the header, footer, hero strips, every CTA, the chat widget, `tel:`/`wa.me` links and the
structured data update together.

### Pricing rules

Encoded in `src/services/pricing.js` and disclosed line-by-line in the quote:

* **Luxury** — from **$6,000 per person for 7 days**, excluding international flights. The floor is
  absolute: season or party size can never push a 7-night luxury quote below it.
* **Groups** — **$2,000–$4,000 per person**, sized by party: 10 travellers pay the top of the band,
  30 travellers the floor. Never run below 10, never above 30. Audiences: women-only, students,
  seniors (senior departures capped at 20).
* **Private** — from $2,400 pp, with a shared-vehicle discount from 4 / 6 / 10 travellers.
* **Bespoke** — priced from a blank page (indicative $3,600 pp and up).
* **Season** — peak ×1.18 (Jan, Jul, Aug, Dec), shoulder ×1.0, low ×0.9.
* **Deposit** — **25 %** now, balance **60 days** before departure, minimum 21 days' notice,
  amendment fee $75 pp.

---

## Taking real payments (Stripe)

1. Add your keys to `.env`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
   `POST /book` then redirects to a real Stripe Checkout Session containing a single line item,
   *“{journey} — 25% deposit”*, with `client_reference_id` = the booking reference.
2. Webhook locally:
   ```bash
   stripe listen --forward-to localhost:3000/stripe/webhook
   ```
   Handle `checkout.session.completed` (and `checkout.session.expired`) and paste the printed
   `whsec_…` into `STRIPE_WEBHOOK_SECRET`. The handler is idempotent and marks the booking
   `deposit_paid`, appending to `data/store/payments.json`.
3. Go live with `sk_live_…`; `GET /api/health` reports which mode the site is in, and the booking
   form shows a “Demo payments” badge whenever no key is present.

Card numbers never touch this server: the browser talks to Stripe, and we store only the amount,
date, currency and Stripe session/charge reference.

### Test cards (demo mode)

With no key set, `/booking/demo-checkout` renders a simulated payment page (no network call) so the
whole flow — booking → deposit → confirmation → ledger → `.ics` — can be exercised end to end.

---

## Enabling the smarter assistant

The chat agent is grounded in the live catalogue, prices and policy text, and answers through
whichever brain is configured:

| Env | Effect |
|---|---|
| `ANTHROPIC_API_KEY` | Uses the Anthropic Messages API (`ANTHROPIC_MODEL`, default `claude-sonnet-4-20250514`) |
| `OPENAI_API_KEY` | Uses an OpenAI-compatible endpoint (`OPENAI_MODEL`, optional `LLM_BASE_URL`) |
| neither | Built-in Morocco expert: keyword-scored intents over `src/data/knowledge.js`, quoting the same prices and terms |

The system prompt forbids inventing prices, asks for at most one follow-up question, and refuses
card numbers, passport numbers and medical detail — the widget also redacts long digit runs client-side.

---

## Layout

```
server.js                  Express bootstrap, Stripe webhook (raw body), view locals
src/config.js              brand, contact, deposit %, pricing bands, nav, reviews, press
src/data/                  journeys · tourTypes · destinations · journal · legal · knowledge
src/services/              pricing · db (atomic JSON store) · stripeService · chatAgent
src/routes/                pages · booking · api
views/partials/            head · header (mega nav) · footer · widgets (chat + back-to-top + cookie)
views/pages/               every rendered page
public/css/styles.css      the whole design system (no framework)
public/js/                 site.js (chrome) · booking.js (live quote) · chat.js (assistant)
public/img/                photography — see public/img/ATTRIBUTION.md
data/store/                bookings.json · payments.json · leads.json · newsletter.json (runtime)
```

Swap `src/services/db.js` for Postgres and nothing else has to move: five functions
(`insert`, `all`, `update`, `read`, `nextRef`) are the whole persistence layer.

---

## Before launch

* **Replace the placeholder business identity** — `src/config.js` carries a fictional registered
  name, address, ministry licence and IATA number; the footer, legal pages and invoices echo them.
* **Photography** — the images here are demo placeholders (see `public/img/ATTRIBUTION.md`).
  Keep the filenames and drop in commissioned work.
* **Legal review** — booking conditions, privacy policy and terms are drafted to be realistic
  (GDPR / UK GDPR / Morocco's Law 09-08, Stripe as processor, cancellation scale) but are not legal
  advice for your entity.
* Add real `BASE_URL` in production so Stripe redirects and the XML sitemap resolve correctly.

MIT licence, `LICENSE`.
