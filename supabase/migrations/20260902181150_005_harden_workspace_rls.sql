-- Harden workspace authorization with explicit authenticated grants,
-- non-recursive membership checks, indexes for policy predicates, and RLS.

create schema if not exists private;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.business_profiles enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.sops enable row level security;
alter table public.ai_memories enable row level security;
alter table public.activity_logs enable row level security;

create or replace function private.user_can_access_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = target_workspace_id and w.owner_id = (select auth.uid())
  )
  or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace_id and wm.user_id = (select auth.uid())
  );
$$;

revoke execute on function private.user_can_access_workspace(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.user_can_access_workspace(uuid) to authenticated;

revoke all on table public.workspaces from anon, authenticated;
revoke all on table public.workspace_members from anon, authenticated;
revoke all on table public.business_profiles from anon, authenticated;
revoke all on table public.knowledge_documents from anon, authenticated;
revoke all on table public.sops from anon, authenticated;
revoke all on table public.ai_memories from anon, authenticated;
revoke all on table public.activity_logs from anon, authenticated;

grant select, insert, update, delete on table public.workspaces to authenticated;
grant select, insert, update, delete on table public.workspace_members to authenticated;
grant select, insert, update, delete on table public.business_profiles to authenticated;
grant select, insert, update, delete on table public.knowledge_documents to authenticated;
grant select, insert, update, delete on table public.sops to authenticated;
grant select, insert, update, delete on table public.ai_memories to authenticated;
grant select, insert on table public.activity_logs to authenticated;

drop policy if exists "workspace members can read their workspace" on public.workspaces;
drop policy if exists "users can create their own workspaces" on public.workspaces;
drop policy if exists "workspace owners can update their workspace" on public.workspaces;
drop policy if exists "workspace owners can delete their workspace" on public.workspaces;
drop policy if exists "workspace members can read membership" on public.workspace_members;
drop policy if exists "workspace owners can manage membership" on public.workspace_members;
drop policy if exists "workspace members can access business profiles" on public.business_profiles;
drop policy if exists "workspace members can access knowledge documents" on public.knowledge_documents;
drop policy if exists "workspace members can access sops" on public.sops;
drop policy if exists "workspace members can access ai memories" on public.ai_memories;
drop policy if exists "workspace members can read activity logs" on public.activity_logs;
drop policy if exists "workspace members can create activity logs" on public.activity_logs;

drop policy if exists "authenticated workspace members can read their workspace" on public.workspaces;
drop policy if exists "authenticated users can create their own workspaces" on public.workspaces;
drop policy if exists "workspace owners can update their workspace" on public.workspaces;
drop policy if exists "workspace owners can delete their workspace" on public.workspaces;
drop policy if exists "authenticated users can read workspace membership" on public.workspace_members;
drop policy if exists "workspace owners can manage membership" on public.workspace_members;
drop policy if exists "workspace owners can update membership" on public.workspace_members;
drop policy if exists "workspace owners can delete membership" on public.workspace_members;
drop policy if exists "authenticated workspace members can access business profiles" on public.business_profiles;
drop policy if exists "authenticated workspace members can access knowledge documents" on public.knowledge_documents;
drop policy if exists "authenticated workspace members can access sops" on public.sops;
drop policy if exists "authenticated workspace members can access ai memories" on public.ai_memories;
drop policy if exists "authenticated workspace members can read activity logs" on public.activity_logs;
drop policy if exists "authenticated workspace members can create activity logs" on public.activity_logs;

create policy "authenticated workspace members can read their workspace"
on public.workspaces for select to authenticated
using ((select private.user_can_access_workspace(id)));

create policy "authenticated users can create their own workspaces"
on public.workspaces for insert to authenticated
with check ((select auth.uid()) = owner_id);

create policy "workspace owners can update their workspace"
on public.workspaces for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "workspace owners can delete their workspace"
on public.workspaces for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy "authenticated users can read workspace membership"
on public.workspace_members for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id and w.owner_id = (select auth.uid())
  )
);

create policy "workspace owners can manage membership"
on public.workspace_members for insert to authenticated
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id and w.owner_id = (select auth.uid())
  )
);

create policy "workspace owners can update membership"
on public.workspace_members for update to authenticated
using (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id and w.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id and w.owner_id = (select auth.uid())
  )
);

create policy "workspace owners can delete membership"
on public.workspace_members for delete to authenticated
using (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id and w.owner_id = (select auth.uid())
  )
);

create policy "authenticated workspace members can access business profiles"
on public.business_profiles for all to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check ((select private.user_can_access_workspace(workspace_id)));

create policy "authenticated workspace members can access knowledge documents"
on public.knowledge_documents for all to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check ((select private.user_can_access_workspace(workspace_id)));

create policy "authenticated workspace members can access sops"
on public.sops for all to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check ((select private.user_can_access_workspace(workspace_id)));

create policy "authenticated workspace members can access ai memories"
on public.ai_memories for all to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check ((select private.user_can_access_workspace(workspace_id)));

create policy "authenticated workspace members can read activity logs"
on public.activity_logs for select to authenticated
using ((select private.user_can_access_workspace(workspace_id)));

create policy "authenticated workspace members can create activity logs"
on public.activity_logs for insert to authenticated
with check ((select private.user_can_access_workspace(workspace_id)));
