create table if not exists public.profiles (
  public_id text primary key,
  edit_token_hash text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  source text not null default 'landing',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.waitlist_entries enable row level security;

-- All table access goes through server-side route handlers using the
-- service-role key, so no browser-facing RLS policy is required.
