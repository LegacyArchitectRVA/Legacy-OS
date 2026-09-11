-- Harden successor-action storage with explicit grants and authenticated-only RLS.
-- Authorization remains bound to the authenticated user's immutable identity.

alter table public.legacy_successor_actions enable row level security;

revoke all on table public.legacy_successor_actions from anon, authenticated;
grant select, insert, update, delete on table public.legacy_successor_actions to authenticated;

drop policy if exists "successor actions owner access" on public.legacy_successor_actions;
drop policy if exists "authenticated users can access their successor actions" on public.legacy_successor_actions;

create policy "authenticated users can access their successor actions"
on public.legacy_successor_actions
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists legacy_successor_actions_user_updated_idx
  on public.legacy_successor_actions (user_id, updated_at desc);
