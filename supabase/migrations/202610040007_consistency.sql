begin;
create function public.cms_touch() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
revoke all on function public.cms_touch() from public;
do $$ declare t text; begin
 foreach t in array array['people','departments','landing_sections','site_settings'] loop
 execute format('create trigger cms_touch before update on public.%I for each row execute function public.cms_touch()',t);
 end loop;
end $$;
create or replace function public.cms_album_check() returns trigger language plpgsql set search_path = '' as $$
declare targets uuid[];
begin
  if TG_TABLE_NAME = 'posts' then targets := array[new.id];
  elsif TG_OP = 'DELETE' then targets := array[old.post_id];
  else targets := array[old.post_id,new.post_id]; end if;
  if exists(select 1 from public.posts p where p.id = any(targets) and p.status = 'published'
     and not exists(select 1 from public.post_images i where i.post_id = p.id)) then
    raise exception 'Published posts require an album' using errcode = '23514';
  end if;
  return null;
end $$;
-- Merge partial settings under a row lock; simultaneous edits to different fields are retained.
create function public.update_site_settings(payload jsonb) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare result jsonb;
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
  update public.site_settings set content = content || (payload - 'logo_asset_id' - 'background_asset_id'),
    logo_asset_id = case when payload ? 'logo_asset_id' then (payload->>'logo_asset_id')::uuid else logo_asset_id end,
    background_asset_id = case when payload ? 'background_asset_id' then (payload->>'background_asset_id')::uuid else background_asset_id end
  where id = 'main' returning content into result;
  return result;
end $$;
revoke all on function public.update_site_settings(jsonb) from public;
grant execute on function public.update_site_settings(jsonb) to authenticated;
commit;
