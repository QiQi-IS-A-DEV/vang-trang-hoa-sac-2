begin;
create function public.save_website(payload jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare patch jsonb;
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  if payload ? 'settings' then perform public.update_site_settings(payload->'settings'); end if;
  for patch in select value from jsonb_array_elements(coalesce(payload->'sections','[]'::jsonb)) loop
    update public.landing_sections set
      title=case when patch ? 'title' then patch->>'title' else title end,
      description=case when patch ? 'description' then patch->>'description' else description end,
      enabled=case when patch ? 'enabled' then (patch->>'enabled')::boolean else enabled end,
      sort_order=case when patch ? 'sort_order' then (patch->>'sort_order')::integer else sort_order end,
      asset_id=case when patch ? 'asset_id' then (patch->>'asset_id')::uuid else asset_id end,
      content=case when patch ? 'content' then coalesce(content,'{}'::jsonb) || (patch->'content') else content end
    where id=(patch->>'id')::uuid;
    if not found then raise exception 'Section not found' using errcode='P0002'; end if;
  end loop;
end $$;
revoke all on function public.save_website(jsonb) from public,anon;
grant execute on function public.save_website(jsonb) to authenticated;
commit;
