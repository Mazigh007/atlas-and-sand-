'use strict';
/**
 * Pricing engine — one source of truth for every number on the site.
 *
 * Rules (kept deliberately simple and disclosed line-by-line in the quote):
 *   Luxury   : benchmark $6,000 pp for 7 nights; scales with nights, floor $6,000 at 7+.
 *   Group    : $4,000 pp at 10 travellers → the journey's floor at 30 (10–30 band, linear).
 *   Private  : journey base price for its own length, with a party-size discount.
 *   Bespoke  : guide figure, then a design uplift for unusual access.
 *   Season   : peak ×1.18 (Jan, Jul, Aug, Dec + Easter), shoulder ×1.0, low ×0.9.
 *   Deposit  : 25% of the trip total, charged now through Stripe. Balance 60 days out.
 */
const config = require('../config');
const { find: findJourney } = require('../data/journeys');

const money = (n) => Math.round(n * 100) / 100;
const fmt = (n) =>
  config.currencySymbol + money(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

function seasonOf(dateStr) {
  if (!dateStr) return { key: 'shoulder', label: 'Shoulder season', multiplier: 1 };
  const d = new Date(dateStr + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return { key: 'shoulder', label: 'Shoulder season', multiplier: 1 };
  const m = d.getUTCMonth();
  const peak = config.pricing.peakMonths.includes(m);
  // May, Jun, Sep and Oct are the quiet months in the deep south — priced down, not off.
  const low = [4, 5, 8, 9].includes(m);
  if (peak) return { key: 'peak', label: 'Peak season (Jul–Aug, Dec–Jan)', multiplier: config.pricing.seasonMultipliers.peak };
  if (low) return { key: 'low', label: 'Low season rates (May, Jun, Sep, Oct)', multiplier: config.pricing.seasonMultipliers.low };
  return { key: 'shoulder', label: 'Shoulder season', multiplier: config.pricing.seasonMultipliers.shoulder };
}

/** Per-person price for a group of n travellers, inside the $2,000 – $4,000 band. */
function groupPerPerson(size, floor, ceiling) {
  const { minTravellers, maxTravellers } = config.pricing.group;
  const n = Math.max(minTravellers, Math.min(size, maxTravellers * 3)); // allow private group charters above 30
  if (n <= minTravellers) return ceiling;
  const span = maxTravellers - minTravellers;
  const step = Math.min(n - minTravellers, span) / span;
  return money(ceiling - step * (ceiling - floor));
}

const EXTRA_OPTIONS = {
  private_transfers: { label: 'Private airport transfers both ends', perPerson: 90, appliesTo: ['private', 'bespoke', 'group'] },
  balloon: { label: 'Sunrise desert balloon flight with champagne', perPerson: 420, appliesTo: ['luxury', 'bespoke', 'group', 'private'] },
  internal_flight: { label: 'Domestic flight segment instead of a long drive', perPerson: 310, appliesTo: ['private', 'luxury', 'bespoke', 'group'] },
  hammam: { label: 'Private hammam suite for the party', perPerson: 140, appliesTo: ['private', 'luxury', 'bespoke', 'group'] },
  flights: { label: 'Let us arrange international flights (at cost + $40 pp ticketing)', perPerson: 40, appliesTo: ['private', 'luxury', 'bespoke', 'group'] },
};

/**
 * @param {object} o
 * @param {string} o.journeySlug  journey slug from the catalogue
 * @param {number} o.travellers   party size
 * @param {number} o.nights       optional override of the journey's nights
 * @param {string} o.startDate    yyyy-mm-dd, drives season
 * @param {boolean} o.single      single rooms rather than twin share
 * @param {string[]} o.extras      keys of EXTRA_OPTIONS
 * @param {boolean} o.leadOnly    request a design consultation only (no price)
 */
function quote(o = {}) {
  const journey = findJourney(o.journeySlug);
  const lines = [];
  const category = journey ? journey.category : o.category || 'private';
  const travellers = Math.max(1, parseInt(o.travellers, 10) || 2);
  const nights = Math.max(2, parseInt(o.nights, 10) || (journey ? journey.nights : 7));
  const season = seasonOf(o.startDate);
  const extras = (o.extras || []).filter((e) => EXTRA_OPTIONS[e]);

  if (o.leadOnly) {
    return {
      mode: 'enquiry',
      travellers,
      nights,
      category,
      season,
      lines: [{ label: 'No payment now — this is a request for a proposal', amount: 0 }],
      perPerson: 0,
      tripTotal: 0,
      deposit: 0,
      depositPercent: config.deposit.percent,
      balance: 0,
      extras,
      formatted: { perPerson: '—', tripTotal: '—', deposit: '—', balance: '—' },
      journey: journey ? { slug: journey.slug, name: journey.name } : null,
    };
  }

  let perPerson;
  if (category === 'group') {
    const floor = journey ? journey.priceFrom : config.pricing.group.minPerPerson;
    const ceiling = journey ? journey.priceMax || config.pricing.group.maxPerPerson : config.pricing.group.maxPerPerson;
    perPerson = groupPerPerson(travellers, floor, ceiling);
    lines.push({ label: `Group rate for ${travellers} traveller${travellers > 1 ? 's' : ''}`, note: 'band $2,000 – $4,000 pp · 10–30 travellers', amount: perPerson });
  } else if (category === 'luxury') {
    const base = journey ? journey.priceFrom : config.pricing.luxury.minPerPerson;
    const factor = nights / (journey ? journey.nights : config.pricing.luxury.benchmarkNights);
    perPerson = Math.max(config.pricing.luxury.minPerPerson * (nights >= 7 ? 1 : nights / 7), base * factor);
    if (nights >= 7) perPerson = Math.max(perPerson, config.pricing.luxury.minPerPerson);
    lines.push({ label: `Luxury journey · ${nights} nights`, note: 'from $6,000 pp for 7 nights', amount: money(perPerson) });
  } else if (category === 'bespoke') {
    const base = journey ? journey.priceFrom : config.pricing.bespokeMin;
    perPerson = money(base * (nights / (journey ? journey.nights : 7)));
    lines.push({ label: `Bespoke design · ${nights} nights`, note: 'indicative until access is confirmed', amount: perPerson });
  } else {
    const base = journey ? journey.priceFrom : config.pricing.privateMin;
    perPerson = money(base * (nights / (journey ? journey.nights : 5)));
    lines.push({ label: `Private journey · ${nights} nights`, amount: perPerson });
  }

  // Party-size economics on private/bespoke/luxury: vehicle + guide are shared.
  let partyFactor = 1;
  if (category !== 'group') {
    if (travellers >= 10) partyFactor = 0.88;
    else if (travellers >= 6) partyFactor = 0.93;
    else if (travellers >= 4) partyFactor = 0.96;
    if (partyFactor !== 1) {
      const saving = money(perPerson * (1 - partyFactor));
      perPerson = money(perPerson * partyFactor);
      lines.push({ label: `Party of ${travellers} — private vehicle and guide shared`, amount: -saving, kind: 'discount' });
    }
  }

  // Season
  if (season.multiplier !== 1) {
    const delta = money(perPerson * (season.multiplier - 1));
    perPerson = money(perPerson * season.multiplier);
    lines.push({ label: season.label, amount: delta, kind: delta < 0 ? 'discount' : 'surcharge' });
  }

  // Single rooms
  if (o.single) {
    const sup = money(perPerson * config.pricing.singleSupplementPct);
    perPerson = money(perPerson + sup);
    lines.push({ label: 'Single occupancy throughout', amount: sup });
  }

  // Extras
  let extrasPerPerson = 0;
  extras.forEach((key) => {
    const ex = EXTRA_OPTIONS[key];
    if (ex.appliesTo.includes(category)) {
      extrasPerPerson = money(extrasPerPerson + ex.perPerson);
      lines.push({ label: ex.label, amount: ex.perPerson });
    }
  });

  // Luxury floor is absolute: the published band starts at $6,000 pp for 7 days,
  // whatever the season or party size does to the arithmetic.
  if (category === 'luxury') {
    const floor = money(config.pricing.luxury.minPerPerson * (nights >= config.pricing.luxury.benchmarkNights ? 1 : nights / config.pricing.luxury.benchmarkNights));
    if (perPerson < floor) {
      lines.push({ label: 'Luxury rate floor', amount: money(floor - perPerson) });
      perPerson = floor;
    }
  }

  const perPersonTotal = money(perPerson);
  const tripTotal = money(perPersonTotal * travellers);
  const deposit = money((tripTotal * config.deposit.percent) / 100);
  const balance = money(tripTotal - deposit);

  return {
    mode: 'quote',
    category,
    travellers,
    nights,
    startDate: o.startDate || null,
    single: Boolean(o.single),
    extras,
    season,
    journey: journey ? { slug: journey.slug, name: journey.name, nights: journey.nights, audience: journey.audience } : null,
    lines,
    perPerson: perPersonTotal,
    tripTotal,
    depositPercent: config.deposit.percent,
    deposit,
    balance,
    balanceDueDaysBefore: config.deposit.balanceDueDaysBefore,
    balanceDueOn: balanceDueDate(o.startDate),
    formatted: { perPerson: fmt(perPersonTotal), tripTotal: fmt(tripTotal), deposit: fmt(deposit), balance: fmt(balance) },
  };
}

function balanceDueDate(startDate) {
  if (!startDate) return null;
  const d = new Date(startDate + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() - config.deposit.balanceDueDaysBefore);
  return d.toISOString().slice(0, 10);
}

/** Amount in the smallest currency unit — what Stripe and the ledger want. */
const toCents = (n) => Math.round(n * 100);

module.exports = { quote, seasonOf, groupPerPerson, EXTRA_OPTIONS, toCents, fmt, money, balanceDueDate };
