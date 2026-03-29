-- Create promo_subscribers table for email collection popup
create table if not exists public.promo_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  source text not null default 'tbs_promo_popup',
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.promo_subscribers enable row level security;

-- Allow anonymous inserts (for the popup form)
create policy "Allow anonymous inserts"
  on public.promo_subscribers
  for insert
  to anon
  with check (true);

-- Allow authenticated users to read (for admin)
create policy "Allow authenticated read"
  on public.promo_subscribers
  for select
  to authenticated
  using (true);
