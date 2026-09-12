-- Successor actions are private owner-scoped records. There is currently no
-- ownership-transfer workflow, so changing user_id after creation would break
-- ownership invariants for linked evidence such as clips.
create or replace function public.prevent_successor_action_owner_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'successor action owner cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_successor_action_owner_change on public.legacy_successor_actions;
create trigger prevent_successor_action_owner_change
before update of user_id
on public.legacy_successor_actions
for each row
execute function public.prevent_successor_action_owner_change();
