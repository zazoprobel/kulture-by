alter table public.venues
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_until timestamptz,
  add column if not exists is_verified boolean not null default false;

alter table public.places
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_until timestamptz;

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'site',
  status text not null default 'new',
  city text,
  event_type text,
  date_requested date,
  guests integer,
  budget numeric(10, 2),
  customer_name text not null,
  customer_phone text,
  customer_email text not null,
  comment text,
  venue_id uuid references public.venues(id) on delete set null,
  place_id uuid references public.places(id) on delete set null,
  tour_id uuid references public.tours(id) on delete set null
);

create index if not exists venues_featured_idx on public.venues (is_featured, featured_until);
create index if not exists places_featured_idx on public.places (is_featured, featured_until);
create index if not exists booking_requests_created_at_idx on public.booking_requests (created_at desc);
create index if not exists booking_requests_status_idx on public.booking_requests (status);

alter table public.booking_requests enable row level security;

drop policy if exists "booking_requests_insert_public" on public.booking_requests;
create policy "booking_requests_insert_public" on public.booking_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists "booking_requests_select_admin" on public.booking_requests;
create policy "booking_requests_select_admin" on public.booking_requests
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "booking_requests_update_admin" on public.booking_requests;
create policy "booking_requests_update_admin" on public.booking_requests
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
