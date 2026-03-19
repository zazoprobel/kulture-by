create extension if not exists "pgcrypto";

create type public.user_role as enum ('guest', 'user', 'vendor', 'guide', 'admin');
create type public.place_category as enum ('nature', 'history', 'castles', 'museums', 'gastro', 'activity', 'kids');
create type public.venue_type as enum ('restaurant', 'banquet', 'loft', 'outdoor', 'hotel');
create type public.contractor_category as enum ('photo', 'video', 'decor', 'mc', 'sound', 'cake', 'floral', 'anim');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  avatar_url text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  category public.place_category not null,
  city text not null,
  address text,
  lat numeric(9, 6),
  lng numeric(9, 6),
  working_hours jsonb not null default '{}'::jsonb,
  entry_price numeric(10, 2),
  website text,
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  type public.venue_type not null,
  city text not null,
  address text,
  lat numeric(9, 6),
  lng numeric(9, 6),
  capacity_banquet integer check (capacity_banquet is null or capacity_banquet >= 0),
  capacity_buffet integer check (capacity_buffet is null or capacity_buffet >= 0),
  price_from numeric(10, 2),
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.contractors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  category public.contractor_category not null,
  city text not null,
  price_from numeric(10, 2),
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  telegram text,
  email text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  category text not null,
  city text not null,
  venue_id uuid references public.venues(id) on delete set null,
  date_start timestamptz not null,
  date_end timestamptz,
  price_from numeric(10, 2),
  image_url text,
  organizer_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint events_date_check check (date_end is null or date_end >= date_start)
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  author_id uuid not null references public.profiles(id) on delete restrict,
  place_id uuid references public.places(id) on delete set null,
  city text not null,
  likes integer not null default 0 check (likes >= 0),
  created_at timestamptz not null default now()
);

create table public.tours (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  guide_id uuid not null references public.profiles(id) on delete restrict,
  city text not null,
  duration_hours numeric(5, 2) not null check (duration_hours > 0),
  price numeric(10, 2) not null check (price >= 0),
  languages text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index places_city_idx on public.places (city);
create index places_category_idx on public.places (category);
create index places_created_by_idx on public.places (created_by);

create index venues_city_idx on public.venues (city);
create index venues_type_idx on public.venues (type);
create index venues_created_by_idx on public.venues (created_by);

create index contractors_city_idx on public.contractors (city);
create index contractors_category_idx on public.contractors (category);
create index contractors_created_by_idx on public.contractors (created_by);

create index events_city_idx on public.events (city);
create index events_venue_id_idx on public.events (venue_id);
create index events_organizer_id_idx on public.events (organizer_id);
create index events_date_start_idx on public.events (date_start);

create index stories_city_idx on public.stories (city);
create index stories_author_id_idx on public.stories (author_id);
create index stories_place_id_idx on public.stories (place_id);

create index tours_city_idx on public.tours (city);
create index tours_guide_id_idx on public.tours (guide_id);

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.venues enable row level security;
alter table public.contractors enable row level security;
alter table public.events enable row level security;
alter table public.stories enable row level security;
alter table public.tours enable row level security;

create policy "profiles_select_public" on public.profiles
for select
using (true);

create policy "profiles_insert_authenticated" on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_owner" on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_delete_admin" on public.profiles
for delete
to authenticated
using (public.is_admin(auth.uid()));

create policy "places_select_public" on public.places
for select
using (true);

create policy "places_insert_authenticated" on public.places
for insert
to authenticated
with check (auth.uid() = created_by);

create policy "places_update_owner" on public.places
for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

create policy "places_delete_admin" on public.places
for delete
to authenticated
using (public.is_admin(auth.uid()));

create policy "venues_select_public" on public.venues
for select
using (true);

create policy "venues_insert_authenticated" on public.venues
for insert
to authenticated
with check (auth.uid() = created_by);

create policy "venues_update_owner" on public.venues
for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

create policy "venues_delete_admin" on public.venues
for delete
to authenticated
using (public.is_admin(auth.uid()));

create policy "contractors_select_public" on public.contractors
for select
using (true);

create policy "contractors_insert_authenticated" on public.contractors
for insert
to authenticated
with check (auth.uid() = created_by);

create policy "contractors_update_owner" on public.contractors
for update
to authenticated
using (auth.uid() = created_by)
with check (auth.uid() = created_by);

create policy "contractors_delete_admin" on public.contractors
for delete
to authenticated
using (public.is_admin(auth.uid()));

create policy "events_select_public" on public.events
for select
using (true);

create policy "events_insert_authenticated" on public.events
for insert
to authenticated
with check (auth.uid() = organizer_id);

create policy "events_update_owner" on public.events
for update
to authenticated
using (auth.uid() = organizer_id)
with check (auth.uid() = organizer_id);

create policy "events_delete_admin" on public.events
for delete
to authenticated
using (public.is_admin(auth.uid()));

create policy "stories_select_public" on public.stories
for select
using (true);

create policy "stories_insert_authenticated" on public.stories
for insert
to authenticated
with check (auth.uid() = author_id);

create policy "stories_update_owner" on public.stories
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "stories_delete_admin" on public.stories
for delete
to authenticated
using (public.is_admin(auth.uid()));

create policy "tours_select_public" on public.tours
for select
using (true);

create policy "tours_insert_authenticated" on public.tours
for insert
to authenticated
with check (auth.uid() = guide_id);

create policy "tours_update_owner" on public.tours
for update
to authenticated
using (auth.uid() = guide_id)
with check (auth.uid() = guide_id);

create policy "tours_delete_admin" on public.tours
for delete
to authenticated
using (public.is_admin(auth.uid()));
