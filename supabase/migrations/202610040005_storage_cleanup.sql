begin;
create table public.storage_cleanup(storage_path text primary key, created_at timestamptz not null default now());
alter table public.storage_cleanup enable row level security;
revoke all on public.storage_cleanup from anon,authenticated;
create function public.queue_storage_cleanup() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.storage_cleanup(storage_path) values(old.storage_path) on conflict do nothing; return old; end $$;
revoke all on function public.queue_storage_cleanup() from public;
create trigger queue_storage_cleanup after delete on public.assets for each row execute function public.queue_storage_cleanup();
commit;
