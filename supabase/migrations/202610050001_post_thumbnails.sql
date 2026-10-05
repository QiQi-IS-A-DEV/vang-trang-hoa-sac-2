begin;
alter table public.assets add column thumbnail_url text, add column thumbnail_storage_path text;
alter table public.assets add constraint assets_thumbnail_url_check check (thumbnail_url is null or thumbnail_url ~ '^https://');
create or replace function public.queue_storage_cleanup() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.storage_path is not null then insert into public.storage_cleanup(storage_path) values(old.storage_path) on conflict do nothing; end if;
  if old.thumbnail_storage_path is not null then insert into public.storage_cleanup(storage_path) values(old.thumbnail_storage_path) on conflict do nothing; end if;
  return old;
end $$;
update storage.buckets set file_size_limit=104857600 where id='gallery';
commit;
