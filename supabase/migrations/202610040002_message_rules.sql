begin;

alter table public.messages alter column leaf_type set default 'lantern';

-- Preserve historical leaf records; accept only lantern/star for new submissions.
create or replace function public.normalize_new_message()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.author_name := btrim(new.author_name, E' \t\n\r');
  new.role_team := nullif(btrim(new.role_team, E' \t\n\r'), '');
  new.message := btrim(new.message, E' \t\n\r');
  if new.leaf_type not in ('lantern', 'star') then
    raise exception 'New messages require lantern or star' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function public.normalize_new_message() from public, anon, authenticated;
create trigger normalize_new_message before insert on public.messages
for each row execute function public.normalize_new_message();

create index gallery_images_category_sort_idx on public.gallery_images (category, sort_order, created_at, id);

commit;
