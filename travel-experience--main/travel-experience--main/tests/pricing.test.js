'use strict';
/**
 * Pricing invariants — the commercial promises the whole site repeats, kept honest:
 *   luxury never dips below $6,000 pp for 7 days · groups live in $2,000–$4,000 for 10–30
 *   pax · deposit is exactly 25% and balance is the remainder · seasons move the rate.
 * Run: node --test tests/
 */
const test = require('node:test');
const assert = require('node:assert');
const { quote, seasonOf, groupPerPerson } = require('../src/services/pricing');
const config = require('../src/config');

test('luxury has an absolute floor of $6,000 per person for 7 nights', () => {
  for (const date of ['2026-05-15', '2026-07-20', '2026-10-02', '2026-12-24', '']) {
    const q = quote({ journeySlug: 'luxury-sahara-under-the-stars', travellers: 2, nights: 7, startDate: date });
    assert.ok(q.perPerson >= 6000, `luxury pp must stay >= 6000 (got ${q.perPerson} on ${date})`);
  }
});

test('group band is $2,000–$4,000 and price falls as the party grows', () => {
  const at10 = groupPerPerson(10, 2000, 4000);
  const at20 = groupPerPerson(20, 2000, 4000);
  const at30 = groupPerPerson(30, 2000, 4000);
  assert.strictEqual(at10, 4000);
  assert.ok(at20 > 2000 && at20 < 4000);
  assert.strictEqual(at30, 2000);
  assert.ok(at10 > at20 && at20 > at30, 'monotonic decrease');
});

test('group journeys never quote outside the band, whatever the party size', () => {
  for (const n of [10, 14, 18, 22, 26, 30]) {
    const q = quote({ journeySlug: 'student-discovery-morocco', travellers: n, nights: 10 });
    assert.ok(q.perPerson >= 2000 && q.perPerson <= 4000, `out of band at ${n}: ${q.perPerson}`);
  }
});

test('deposit is exactly 25% of the trip total and balance is the remainder', () => {
  const q = quote({ journeySlug: 'the-grand-moroccan', travellers: 4, nights: 10, startDate: '2026-11-05', single: true, extras: ['balloon'] });
  assert.strictEqual(config.deposit.percent, 25);
  assert.ok(Math.abs(q.deposit - q.tripTotal * 0.25) < 0.011, 'deposit = 25%');
  assert.ok(Math.abs(q.tripTotal - (q.deposit + q.balance)) < 0.011, 'deposit + balance = total');
  assert.strictEqual(q.perPerson * q.travellers, q.tripTotal);
});

test('private parties of 4+ share the vehicle and guide, so pp drops', () => {
  const two = quote({ journeySlug: 'marrakech-and-the-atlas-foothills', travellers: 2 }).perPerson;
  const six = quote({ journeySlug: 'marrakech-and-the-atlas-foothills', travellers: 6 }).perPerson;
  assert.ok(six < two, 'party discount applied');
  assert.ok(two >= config.pricing.privateMin - 1, 'private floor respected at minimum party');
});

test('season multipliers move the rate in the right direction', () => {
  assert.strictEqual(seasonOf('2026-07-15').key, 'peak');
  assert.strictEqual(seasonOf('2026-12-31').key, 'peak');
  assert.strictEqual(seasonOf('2026-05-10').key, 'low');
  assert.strictEqual(seasonOf('2026-09-12').key, 'low');
  assert.strictEqual(seasonOf('2026-04-12').key, 'shoulder');
  const peak = quote({ journeySlug: 'imperial-cities-private-circuit', travellers: 2, startDate: '2026-12-27' }).perPerson;
  const shoulder = quote({ journeySlug: 'imperial-cities-private-circuit', travellers: 2, startDate: '2026-06-20' }).perPerson;
  assert.ok(peak > shoulder);
});

test('balance falls due 60 days before departure', () => {
  const q = quote({ journeySlug: 'group-imperial-explorer', travellers: 20, startDate: '2027-04-01' });
  assert.strictEqual(q.balanceDueDaysBefore, 60);
  const days = (new Date('2027-04-01') - new Date(q.balanceDueOn)) / 86400000;
  assert.strictEqual(days, 60);
});

test('an enquiry mode never invents a payment amount', () => {
  const q = quote({ leadOnly: true, travellers: 30, nights: 10 });
  assert.strictEqual(q.tripTotal, 0);
  assert.strictEqual(q.deposit, 0);
  assert.strictEqual(q.mode, 'enquiry');
});

test('every journey is priced consistently with its own catalogue entry', () => {
  const { journeys } = require('../src/data/journeys');
  for (const j of journeys) {
    const q = quote({ journeySlug: j.slug, travellers: j.category === 'group' ? 30 : 2, nights: j.nights });
    if (j.category === 'group') {
      assert.ok(q.perPerson >= j.priceFrom - 1 && q.perPerson <= j.priceMax + 1, `${j.slug} group price ${q.perPerson} vs band ${j.priceFrom}-${j.priceMax}`);
    } else {
      assert.ok(q.perPerson > 0 && Number.isFinite(q.perPerson), `${j.slug} has a usable price`);
    }
  }
});
