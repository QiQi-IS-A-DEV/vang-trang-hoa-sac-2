begin;
-- Supabase may explicitly grant EXECUTE through default privileges; revoking PUBLIC alone is insufficient.
revoke all on function public.cms_post_assets(), public.cms_post_before(), public.cms_album_check(), public.cms_touch(), public.queue_storage_cleanup() from public,anon,authenticated;
revoke all on function public.is_admin(), public.save_post(uuid,jsonb), public.update_site_settings(jsonb) from public,anon,authenticated;
grant execute on function public.is_admin(), public.save_post(uuid,jsonb), public.update_site_settings(jsonb) to authenticated;
-- The preinstalled event trigger only runs internally, never as a client RPC.
do $$ begin
 if to_regprocedure('public.rls_auto_enable()') is not null then
  execute 'revoke all on function public.rls_auto_enable() from public,anon,authenticated';
 end if;
end $$;
alter policy admin_self on public.admin_users using (user_id = (select auth.uid()));
create index landing_sections_asset_idx on public.landing_sections(asset_id);
create index people_asset_idx on public.people(asset_id);
create index posts_category_idx on public.posts(category_id,status,sort_order,created_at,id);
create index posts_cover_idx on public.posts(cover_asset_id);
create index settings_logo_idx on public.site_settings(logo_asset_id);
create index settings_background_idx on public.site_settings(background_asset_id);
-- One SELECT policy per role; write checks remain separate and admin-only.
do $$ declare t text; condition text; begin
 foreach t in array array['assets','site_settings','landing_sections','departments','people','assignments','categories','posts','post_images','post_content_assets'] loop
  select qual into condition from pg_policies where schemaname='public' and tablename=t and policyname='cms_public';
  execute format('drop policy cms_admin on public.%I',t);
  execute format('alter policy cms_public on public.%I to anon',t);
  execute format('create policy cms_authenticated_read on public.%I for select to authenticated using ((select public.is_admin()) or (%s))',t,condition);
  if t not in ('assets','post_content_assets') then
   execute format('create policy cms_insert on public.%I for insert to authenticated with check ((select public.is_admin()))',t);
   execute format('create policy cms_update on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',t);
   execute format('create policy cms_delete on public.%I for delete to authenticated using ((select public.is_admin()))',t);
  end if;
 end loop;
end $$;
commit;
