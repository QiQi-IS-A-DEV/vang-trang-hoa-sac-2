begin;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create policy admin_self on public.admin_users for select to authenticated using (user_id = auth.uid());
create function public.is_admin() returns boolean language sql stable security definer
set search_path = '' as $$ select exists(select 1 from public.admin_users where user_id = auth.uid()) $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text unique not null,
  url text not null check (url ~ '^https://'),
  filename text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  alt text not null default '',
  created_at timestamptz not null default now()
);
create table public.site_settings (
  id text primary key check (id = 'main'),
  content jsonb not null default '{}' check (jsonb_typeof(content) = 'object'),
  logo_asset_id uuid references public.assets(id) on delete restrict,
  background_asset_id uuid references public.assets(id) on delete restrict,
  updated_at timestamptz not null default now()
);
insert into public.site_settings(id) values ('main');
create table public.landing_sections (
  id uuid primary key default gen_random_uuid(),
  key text unique not null check (key in ('hero','advisors','organizers','departments','volunteers','recap','footer')),
  title text not null default '', description text not null default '',
  enabled boolean not null default true, sort_order integer not null default 0,
  asset_id uuid references public.assets(id) on delete restrict,
  content jsonb not null default '{}' check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);
insert into public.landing_sections(key,sort_order) values
('hero',0),('advisors',1),('organizers',2),('departments',3),('volunteers',4),('recap',5),('footer',6);
create table public.departments (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(btrim(name)) between 1 and 160),
  code text unique, description text not null default '', sort_order integer not null default 0,
  visible boolean not null default true, updated_at timestamptz not null default now()
);
create table public.people (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(btrim(name)) between 1 and 160),
  code text unique, unit text not null default '', quote text not null default '', badge text not null default '',
  asset_id uuid references public.assets(id) on delete restrict,
  visible boolean not null default true, sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);
create table public.assignments (
  id uuid primary key default gen_random_uuid(), person_id uuid not null references public.people(id) on delete cascade,
  department_id uuid references public.departments(id) on delete restrict,
  role text not null check (role in ('advisor','organizer','lead','deputy','volunteer')),
  title text not null default '', responsibility text not null default '',
  visible boolean not null default true, sort_order integer not null default 0,
  check (role not in ('lead','deputy') or department_id is not null),
  unique nulls not distinct (person_id, department_id, role)
);
create table public.categories (
  id uuid primary key default gen_random_uuid(), name text unique not null check (char_length(btrim(name)) between 1 and 80 and lower(btrim(name)) <> 'tất cả'),
  sort_order integer not null default 0
);
insert into public.categories(name,sort_order) values ('Chuẩn bị',0),('Đêm hội',1),('Trao quà',2),('Khoảnh khắc',3);
create table public.posts (
  id uuid primary key default gen_random_uuid(), title text not null check (char_length(btrim(title)) between 1 and 160),
  slug text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt text not null default '', content jsonb not null default '[]' check (jsonb_typeof(content) = 'array'),
  category_id uuid not null references public.categories(id) on delete restrict,
  cover_asset_id uuid references public.assets(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft','published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), published_at timestamptz,
  check (status <> 'published' or cover_asset_id is not null)
);
create table public.post_images (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete restrict,
  caption text not null default '', sort_order integer not null default 0,
  unique(post_id,asset_id)
);
-- Inline images use managed asset IDs. This relation protects shared images even in drafts.
create table public.post_content_assets (
  post_id uuid not null references public.posts(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete restrict,
  primary key(post_id,asset_id)
);
create function public.cms_post_before() returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status = 'published' and (TG_OP = 'INSERT' or old.status <> 'published') then new.published_at := now(); end if;
  return new;
end $$;
create trigger cms_post_before before insert or update on public.posts for each row execute function public.cms_post_before();
create function public.cms_post_assets() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.post_content_assets where post_id = new.id;
  insert into public.post_content_assets(post_id,asset_id)
  select distinct new.id, (block->>'asset_id')::uuid from jsonb_array_elements(new.content) block where block->>'type' = 'image';
  return new;
end $$;
create trigger cms_post_assets after insert or update of content on public.posts for each row execute function public.cms_post_assets();
-- Deferred validation allows post and album updates within one transaction.
create function public.cms_album_check() returns trigger language plpgsql set search_path = '' as $$
declare target uuid;
begin
  if TG_TABLE_NAME = 'posts' then target := new.id;
  elsif TG_OP = 'DELETE' then target := old.post_id;
  else target := new.post_id; end if;
  if exists(select 1 from public.posts p where p.id = target and p.status = 'published'
     and not exists(select 1 from public.post_images i where i.post_id = p.id)) then
    raise exception 'Published posts require an album' using errcode = '23514';
  end if;
  return null;
end $$;
create constraint trigger cms_post_album after insert or update on public.posts deferrable initially deferred for each row execute function public.cms_album_check();
create constraint trigger cms_image_album after delete or update on public.post_images deferrable initially deferred for each row execute function public.cms_album_check();
create index posts_public_sort on public.posts(status,sort_order,created_at,id);
create index assignments_person on public.assignments(person_id);
create index assignments_department on public.assignments(department_id);
create index post_images_asset on public.post_images(asset_id);
create index post_content_asset on public.post_content_assets(asset_id);

do $$ declare t text; begin
  foreach t in array array['assets','site_settings','landing_sections','departments','people','assignments','categories','posts','post_images','post_content_assets'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant select on public.%I to anon, authenticated',t);
    execute format('grant insert, update, delete on public.%I to authenticated',t);
    execute format('create policy cms_admin on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',t);
  end loop;
end $$;
create policy cms_public on public.site_settings for select to anon,authenticated using (true);
create policy cms_public on public.landing_sections for select to anon,authenticated using (enabled);
create policy cms_public on public.departments for select to anon,authenticated using (visible);
create policy cms_public on public.people for select to anon,authenticated using (visible);
create policy cms_public on public.assignments for select to anon,authenticated using (visible and exists(select 1 from public.people p where p.id = person_id and p.visible) and (department_id is null or exists(select 1 from public.departments d where d.id = department_id and d.visible)));
create policy cms_public on public.categories for select to anon,authenticated using (true);
create policy cms_public on public.posts for select to anon,authenticated using (status = 'published');
create policy cms_public on public.post_images for select to anon,authenticated using (exists(select 1 from public.posts p where p.id = post_id and p.status = 'published'));
create policy cms_public on public.post_content_assets for select to anon,authenticated using (exists(select 1 from public.posts p where p.id = post_id and p.status = 'published'));
create policy cms_public on public.assets for select to anon,authenticated using (
  exists(select 1 from public.posts p where p.status = 'published' and p.cover_asset_id = assets.id)
  or exists(select 1 from public.post_images i join public.posts p on p.id = i.post_id where p.status = 'published' and i.asset_id = assets.id)
  or exists(select 1 from public.post_content_assets i join public.posts p on p.id = i.post_id where p.status = 'published' and i.asset_id = assets.id)
  or exists(select 1 from public.people p where p.visible and p.asset_id = assets.id)
  or exists(select 1 from public.site_settings s where s.logo_asset_id = assets.id or s.background_asset_id = assets.id)
  or exists(select 1 from public.landing_sections s where s.enabled and s.asset_id = assets.id)
);
-- Metadata and storage mutations go through authenticated API handlers. Storage keys stay server-only.
revoke insert, update, delete on public.assets from authenticated;
revoke insert, update, delete on public.post_content_assets from authenticated;
revoke all on function public.cms_post_assets() from public;
revoke all on function public.cms_post_before() from public;
revoke all on function public.cms_album_check() from public;
commit;
