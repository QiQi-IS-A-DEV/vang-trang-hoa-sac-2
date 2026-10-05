begin;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  author_name text not null check (char_length(btrim(author_name)) between 1 and 80),
  role_team text check (role_team is null or char_length(btrim(role_team)) between 1 and 80),
  message text not null check (char_length(btrim(message)) between 1 and 1000),
  leaf_type text not null default 'leaf' check (leaf_type in ('leaf', 'lantern', 'star')),
  slot_index bigint generated always as identity (start with 0 minvalue 0) unique not null,
  created_at timestamptz not null default now()
);
create index messages_created_at_idx on public.messages (created_at desc, id);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null check (image_url ~ '^https://'),
  title text check (char_length(title) <= 160),
  category text check (char_length(category) <= 80),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index gallery_images_sort_idx on public.gallery_images (sort_order, created_at);

alter table public.messages enable row level security;
alter table public.gallery_images enable row level security;

-- Remove any Supabase default table grants before granting the precise operations.
revoke all on public.messages, public.gallery_images from anon, authenticated;
grant select on public.messages, public.gallery_images to anon, authenticated;
grant insert (author_name, role_team, message, leaf_type) on public.messages to anon, authenticated;
grant usage on sequence public.messages_slot_index_seq to anon, authenticated;

create policy messages_read on public.messages for select to anon, authenticated using (true);
create policy messages_submit on public.messages for insert to anon, authenticated with check (true);
create policy gallery_read on public.gallery_images for select to anon, authenticated using (true);
-- No browser policies for updating/deleting messages or writing gallery metadata.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- Public viewing, with no anonymous/authenticated upload policies.
-- Administrators can upload using the Supabase Dashboard for this first phase.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

commit;