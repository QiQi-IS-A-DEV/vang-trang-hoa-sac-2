begin;
create function public.delete_cms_group(resource_name text,target_id uuid,replacement_id uuid default null)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  if replacement_id=target_id then raise exception 'Choose another destination' using errcode='22023'; end if;
  if resource_name='departments' then
    perform 1 from public.departments where id=target_id for update;
    if not found then raise exception 'Not found' using errcode='P0002'; end if;
    if replacement_id is not null then
      perform 1 from public.departments where id=replacement_id for key share;
      if not found then raise exception 'Invalid destination' using errcode='22023'; end if;
      update public.assignments set department_id=replacement_id where department_id=target_id;
    end if;
    delete from public.departments where id=target_id;
  elsif resource_name='categories' then
    perform 1 from public.categories where id=target_id for update;
    if not found then raise exception 'Not found' using errcode='P0002'; end if;
    if replacement_id is not null then
      perform 1 from public.categories where id=replacement_id for key share;
      if not found then raise exception 'Invalid destination' using errcode='22023'; end if;
      update public.posts set category_id=replacement_id where category_id=target_id;
    end if;
    delete from public.categories where id=target_id;
  else raise exception 'Unsupported resource' using errcode='22023';
  end if;
end $$;
create function public.delete_program_card(card_id uuid)
returns void language plpgsql security invoker set search_path='' as $$
declare linked_person uuid;
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode='42501'; end if;
  select person_id into linked_person from public.assignments
    where id=card_id and (role='volunteer' or responsibility='program-card') for update;
  if not found then raise exception 'Not found' using errcode='P0002'; end if;
  delete from public.assignments where id=card_id;
  delete from public.people where id=linked_person and unit='volunteer-card-upload'
    and not exists(select 1 from public.assignments where person_id=linked_person);
end $$;
revoke all on function public.delete_cms_group(text,uuid,uuid),public.delete_program_card(uuid) from public,anon;
grant execute on function public.delete_cms_group(text,uuid,uuid),public.delete_program_card(uuid) to authenticated;
commit;
