-- Harden workspace authorization with explicit grants and non-recursive policies.

create schema if not exists private;

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

revoke all on table public.workspaces, public.workspace_members, public.business_profiles,
  public.knowledge_documents, public.sops, public.ai_memories, public.activity_logs
  from anon, authenticated;

grant select, insert, update, delete on table public.workspaces, public.workspace_members,
  public.business_profiles, public.knowledge_documents, public.sops, public.ai_memories to authenticated;
grant select, insert on table public.activity_logs to authenticated;

-- Remove the prior policy set so this migration is safely repeatable.
drop policy if exists "workspace members can read their workspace" on public.workspaces;
drop policy if exists "users can create their own workspaces" on public.workspaces;
drop policy if exists "workspace owners can update their workspace" on public.workspaces;
drop policy if exists "workspace owners can delete their workspace" on public.workspaces;
drop policy if exists "authenticated workspace members can read their workspace" on public.workspaces;
drop policy if exists "authenticated users can create their own workspaces" on public.workspaces;
drop policy if exists "workspace owners can manage membership" on public.workspace_members;
drop policy if exists "authenticated users can read workspace membership" on public.workspace_members;
drop policy if exists "workspace owners can update membership" on public.workspace_members;
drop policy if exists "workspace owners can delete membership" on public.workspace_members;
drop policy if exists "authenticated workspace members can access business profiles" on public.business_profiles;
drop policy if exists "authenticated workspace members can access knowledge documents" on public.knowledge_documents;
drop policy if exists "authenticated workspace members can access sops" on public.sops;
drop policy if exists "authenticated workspace members can access ai memories" on public.ai_memories;
drop policy if exists "workspace members can read activity logs" on public.activity_logs;
drop policy if exists "workspace members can create activity logs" on public.activity_logs;

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

create policy "authenticated workspace members can read business profiles"
on public.business_profiles for select to authenticated
using ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can create business profiles"
on public.business_profiles for insert to authenticated
with check ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can update business profiles"
on public.business_profiles for update to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can delete business profiles"
on public.business_profiles for delete to authenticated
using ((select private.user_can_access_workspace(workspace_id)));

create policy "authenticated workspace members can read knowledge documents"
on public.knowledge_documents for select to authenticated
using ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can create knowledge documents"
on public.knowledge_documents for insert to authenticated
with check ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can update knowledge documents"
on public.knowledge_documents for update to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can delete knowledge documents"
on public.knowledge_documents for delete to authenticated
using ((select private.user_can_access_workspace(workspace_id)));

create policy "authenticated workspace members can read sops"
on public.sops for select to authenticated
using ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can create sops"
on public.sops for insert to authenticated
with check ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can update sops"
on public.sops for update to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can delete sops"
on public.sops for delete to authenticated
using ((select private.user_can_access_workspace(workspace_id)));

create policy "authenticated workspace members can read ai memories"
on public.ai_memories for select to authenticated
using ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can create ai memories"
on public.ai_memories for insert to authenticated
with check ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can update ai memories"
on public.ai_memories for update to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can delete ai memories"
on public.ai_memories for delete to authenticated
using ((select private.user_can_access_workspace(workspace_id)));

create policy "authenticated workspace members can read activity logs"
on public.activity_logs for select to authenticated
using ((select private.user_can_access_workspace(workspace_id)));
create policy "authenticated workspace members can create activity logs"
on public.activity_logs for insert to authenticated
with check ((select private.user_can_access_workspace(workspace_id)));
