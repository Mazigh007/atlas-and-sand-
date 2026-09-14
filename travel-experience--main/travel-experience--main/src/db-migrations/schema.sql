-- Moroccan Experience — Postgres schema (works on Neon, Supabase, or any
-- standard Postgres). Applied automatically at startup (see src/services/db.js),
-- so you never have to run this by hand — it's here for reference and for
-- anyone who wants to run migrations through the Supabase/Neon SQL editor.

create table if not exists bookings (
  id serial primary key,
  ref text unique not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
create index if not exists bookings_ref_idx on bookings (ref);

create table if not exists payments (
  id serial primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id serial primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists newsletter (
  id serial primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists counters (
  key text primary key,
  value integer not null default 0
);
insert into counters (key, value) values ('bookings', 0)
  on conflict (key) do nothing;
