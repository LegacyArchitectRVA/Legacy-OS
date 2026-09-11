-- Allow a private clip to document the evidence associated with a successor action.
-- Ownership remains enforced by the existing clip RLS policy and the action's owner policy.
alter table public.legacy_os_clips
  add column if not exists successor_action_id uuid references public.legacy_successor_actions(id) on delete set null;

create index if not exists legacy_os_clips_successor_action_idx
  on public.legacy_os_clips (successor_action_id)
  where successor_action_id is not null;
