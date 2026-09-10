'use strict';
/**
 * Storage selector: uses the Postgres-backed store (Neon, Supabase, or any
 * standard Postgres) when DATABASE_URL is set, otherwise falls back to the
 * local JSON-file store so the app still runs with zero config. Both
 * backends expose the same five async functions, so callers never need to
 * know which one is active.
 */
module.exports = process.env.DATABASE_URL ? require('./db.postgres') : require('./db.json');
