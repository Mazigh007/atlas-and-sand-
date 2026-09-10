'use strict';
/**
 * Postgres-backed store — used automatically when DATABASE_URL is set.
 * Works unchanged against Neon and Supabase (both are plain Postgres); only
 * the connection string differs. Each "collection" is a table with a jsonb
 * `data` column, so the shape the rest of the app sees (insert/all/update/
 * nextRef) is identical to the JSON-file store in db.json.js.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon and Supabase both require TLS; their certs aren't always in Node's
  // default trust store, so relax verification rather than fail to connect.
  ssl: { rejectUnauthorized: false },
});

const TABLES = { bookings: 'bookings', payments: 'payments', leads: 'leads', newsletter: 'newsletter' };

let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    const sql = fs.readFileSync(path.join(__dirname, '../db-migrations/schema.sql'), 'utf8');
    schemaReady = pool.query(sql).catch((e) => {
      schemaReady = null; // let the next call retry instead of wedging forever
      throw e;
    });
  }
  return schemaReady;
}

function tableFor(name) {
  const t = TABLES[name];
  if (!t) throw new Error(`Unknown collection "${name}"`);
  return t;
}

async function insert(name, record) {
  await ensureSchema();
  const table = tableFor(name);
  if (table === 'bookings') {
    await pool.query('insert into bookings (ref, data) values ($1, $2)', [record.ref, record]);
  } else {
    await pool.query(`insert into ${table} (data) values ($1)`, [record]);
  }
  return record;
}

async function all(name) {
  await ensureSchema();
  const table = tableFor(name);
  const { rows } = await pool.query(`select id, data from ${table} order by id asc`);
  return rows.map((r) => r.data);
}

/** Loads matched via a matcher run in JS, same as the JSON store, so callers don't change. */
async function update(name, matcher, patch) {
  await ensureSchema();
  const table = tableFor(name);
  const { rows } = await pool.query(`select id, data from ${table} order by id desc`);
  for (const r of rows) {
    if (matcher(r.data)) {
      const updated = Object.assign({}, r.data, patch, { updatedAt: new Date().toISOString() });
      await pool.query(`update ${table} set data = $1, updated_at = now() where id = $2`, [updated, r.id]);
      return updated;
    }
  }
  return null;
}

async function nextRef() {
  await ensureSchema();
  const { rows } = await pool.query(
    `insert into counters (key, value) values ('bookings', 1)
     on conflict (key) do update set value = counters.value + 1
     returning value`
  );
  const n = rows[0].value;
  const year = new Date().getFullYear();
  return 'ME-' + year + '-' + String(n).padStart(5, '0');
}

async function read(name) {
  return all(name);
}

module.exports = { insert, all, update, read, nextRef, pool };
