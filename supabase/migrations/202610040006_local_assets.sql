begin;
-- Existing bundled branding/portraits stay usable without duplicating their files into Storage.
alter table public.assets alter column storage_path drop not null;
alter table public.assets drop constraint assets_url_check;
alter table public.assets add constraint assets_url_check check (url ~ '^https://' or url ~ '^/[a-zA-Z0-9_./-]+$');
create or replace function public.queue_storage_cleanup() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.storage_path is not null then insert into public.storage_cleanup(storage_path) values(old.storage_path) on conflict do nothing; end if;
  return old;
end $$;
commit;
