begin;
create function public.save_post(post_id uuid, payload jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare target uuid; entry jsonb;
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
  if jsonb_typeof(payload->'album') <> 'array' then raise exception 'Album required' using errcode = '22023'; end if;
  if post_id is null then
    insert into public.posts(title,slug,excerpt,content,category_id,cover_asset_id,status,sort_order)
    values(payload->>'title',payload->>'slug',coalesce(payload->>'excerpt',''),coalesce(payload->'content','[]'),
      (payload->>'category_id')::uuid,(payload->>'cover_asset_id')::uuid,coalesce(payload->>'status','draft'),coalesce((payload->>'sort_order')::integer,0)) returning id into target;
  else
    target := post_id;
    -- Lock before replacing the album to serialize concurrent saves.
    perform 1 from public.posts where id = target for update;
    if not found then raise exception 'Post not found' using errcode = 'P0002'; end if;
    update public.posts set title = payload->>'title',
      slug = coalesce(payload->>'slug',slug), excerpt = coalesce(payload->>'excerpt',excerpt),
      content = coalesce(payload->'content',content), category_id = (payload->>'category_id')::uuid,
      cover_asset_id = case when payload ? 'cover_asset_id' then (payload->>'cover_asset_id')::uuid else cover_asset_id end,
      status = coalesce(payload->>'status',status), sort_order = coalesce((payload->>'sort_order')::integer,sort_order) where id = target;
  end if;
  delete from public.post_images where post_images.post_id = target;
  for entry in select value from jsonb_array_elements(payload->'album') loop
    insert into public.post_images(post_id,asset_id,caption,sort_order)
    values(target,(entry->>'asset_id')::uuid,coalesce(entry->>'caption',''),coalesce((entry->>'sort_order')::integer,0));
  end loop;
  return target;
end $$;
revoke all on function public.save_post(uuid,jsonb) from public;
grant execute on function public.save_post(uuid,jsonb) to authenticated;
commit;
