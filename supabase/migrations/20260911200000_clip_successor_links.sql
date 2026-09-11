-- Allow a private clip to document the evidence associated with a successor action.
-- Ownership remains enforced by the existing clip RLS policy and the action's owner policy.
alter table public.legacy_os_clips
  add column if not exists successor_action_id uuid references public.legacy_successor_actions(id) on delete set null;

create index if not exists legacy_os_clips_successor_action_idx
  on public.legacy_os_clips (successor_action_id)
  where successor_action_id is not null;

-- A clip may only reference an action owned by the same user.
-- This closes the cross-account reference gap that a simple foreign key cannot prevent.
create or replace function public.validate_clip_successor_action_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.successor_action_id is not null and not exists (
    select 1
    from public.legacy_successor_actions action
    where action.id = new.successor_action_id
      and action.user_id = new.user_id
  ) then
    raise exception 'successor action must belong to the clip owner';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_clip_successor_action_owner on public.legacy_os_clips;
create trigger validate_clip_successor_action_owner
before insert or update of user_id, successor_action_id
on public.legacy_os_clips
for each row
execute function public.validate_clip_successor_action_owner();
