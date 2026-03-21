alter table public.places
  add column if not exists image_url text;

alter table public.venues
  add column if not exists image_url text;

alter table public.contractors
  add column if not exists image_url text;

alter table public.stories
  add column if not exists image_url text;

alter table public.tours
  add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('kulture-media', 'kulture-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "kulture_media_public_read" on storage.objects;
create policy "kulture_media_public_read"
on storage.objects
for select
using (bucket_id = 'kulture-media');

drop policy if exists "kulture_media_authenticated_insert" on storage.objects;
create policy "kulture_media_authenticated_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'kulture-media');

drop policy if exists "kulture_media_authenticated_update" on storage.objects;
create policy "kulture_media_authenticated_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'kulture-media')
with check (bucket_id = 'kulture-media');

drop policy if exists "kulture_media_authenticated_delete" on storage.objects;
create policy "kulture_media_authenticated_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'kulture-media');
