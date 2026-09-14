'use strict';
/**
 * Tiny durable JSON store (append-safe, atomic writes). Used automatically
 * when no DATABASE_URL is set, so the app still runs with zero config.
 * Every function returns a Promise so it has the same shape as db.postgres.js
 * (see src/services/db.js, which picks one or the other).
 */
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, '../../data/store'));
const collections = ['bookings', 'payments', 'leads', 'newsletter', 'counter'];
fs.mkdirSync(DIR, { recursive: true });
collections.forEach((c) => {
  const f = path.join(DIR, c + '.json');
  if (!fs.existsSync(f)) fs.writeFileSync(f, c === 'counter' ? '{"bookings":0}' : '[]');
});

const file = (name) => path.join(DIR, name + '.json');

function read(name) {
  try {
    return JSON.parse(fs.readFileSync(file(name), 'utf8'));
  } catch (e) {
    return name === 'counter' ? {} : [];
  }
}

function writeAtomic(name, data) {
  const f = file(name);
  const tmp = f + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, f);
}

async function insert(name, record) {
  const rows = read(name);
  rows.push(record);
  writeAtomic(name, rows);
  return record;
}

async function all(name) {
  return read(name);
}

async function update(name, matcher, patch) {
  const rows = read(name);
  let changed = null;
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    if (matcher(rows[i])) {
      rows[i] = Object.assign({}, rows[i], patch, { updatedAt: new Date().toISOString() });
      changed = rows[i];
      break;
    }
  }
  if (changed) writeAtomic(name, rows);
  return changed;
}

async function nextRef() {
  const c = read('counter');
  c.bookings = (c.bookings || 0) + 1;
  writeAtomic('counter', c);
  const year = new Date().getFullYear();
  return 'ME-' + year + '-' + String(c.bookings).padStart(5, '0');
}

module.exports = { insert, all, update, read: async (name) => read(name), nextRef, DIR };
