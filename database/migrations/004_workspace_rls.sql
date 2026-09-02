-- Tenant isolation for the workspace data model.
-- Requires Supabase/Postgres auth.uid() to identify the signed-in user.

alter table if exists workspaces enable row level security;
alter table if exists workspace_members enable row level security;
alter table if exists business_profiles enable row level security;
alter table if exists knowledge_documents enable row level security;
alter table if exists sops enable row level security;
alter table if exists ai_memories enable row level security;
alter table if exists activity_logs enable row level security;

create policy "workspace members can read their workspace"
on workspaces for select
using (
  owner_id = auth.uid()
  or exists (
    select 1 from workspace_members wm
    where wm.workspace_id = workspaces.id and wm.user_id = auth.uid()
  )
);

create policy "users can create their own workspaces"
on workspaces for insert
with check (owner_id = auth.uid());

create policy "workspace owners can update their workspace"
on workspaces for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "workspace owners can delete their workspace"
on workspaces for delete
using (owner_id = auth.uid());

create policy "workspace members can read membership"
on workspace_members for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from workspaces w
    where w.id = workspace_members.workspace_id and w.owner_id = auth.uid()
  )
);

create policy "workspace owners can manage membership"
on workspace_members for all
using (
  exists (
    select 1 from workspaces w
    where w.id = workspace_members.workspace_id and w.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from workspaces w
    where w.id = workspace_members.workspace_id and w.owner_id = auth.uid()
  )
);

create policy "workspace members can access business profiles"
on business_profiles for all
using (
  exists (
    select 1 from workspace_members wm
    where wm.workspace_id = business_profiles.workspace_id and wm.user_id = auth.uid()
  )
  or exists (
    select 1 from workspaces w
    where w.id = business_profiles.workspace_id and w.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from workspace_members wm
    where wm.workspace_id = business_profiles.workspace_id and wm.user_id = auth.uid()
  )
  or exists (
    select 1 from workspaces w
    where w.id = business_profiles.workspace_id and w.owner_id = auth.uid()
  )
);

create policy "workspace members can access knowledge documents"
on knowledge_documents for all
using (
  exists (
    select 1 from workspace_members wm
    where wm.workspace_id = knowledge_documents.workspace_id and wm.user_id = auth.uid()
  )
  or exists (
    select 1 from workspaces w
    where w.id = knowledge_documents.workspace_id and w.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from workspace_members wm
    where wm.workspace_id = knowledge_documents.workspace_id and wm.user_id = auth.uid()
  )
  or exists (
    select 1 from workspaces w
    where w.id = knowledge_documents.workspace_id and w.owner_id = auth.uid()
  )
);

create policy "workspace members can access sops"
on sops for all
using (
  exists (
    select 1 from workspace_members wm
    where wm.workspace_id = sops.workspace_id and wm.user_id = auth.uid()
  )
  or exists (
    select 1 from workspaces w
    where w.id = sops.workspace_id and w.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from workspace_members wm
    where wm.workspace_id = sops.workspace_id and wm.user_id = auth.uid()
  )
  or exists (
    select 1 from workspaces w
    where w.id = sops.workspace_id and w.owner_id = auth.uid()
  )
);

create policy "workspace members can access ai memories"
on ai_memories for all
using (
  exists (
    select 1 from workspace_members wm
    where wm.workspace_id = ai_memories.workspace_id and wm.user_id = auth.uid()
  )
  or exists (
    select 1 from workspaces w
    where w.id = ai_memories.workspace_id and w.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from workspace_members wm
    where wm.workspace_id = ai_memories.workspace_id and wm.user_id = auth.uid()
  )
  or exists (
    select 1 from workspaces w
    where w.id = ai_memories.workspace_id and w.owner_id = auth.uid()
  )
);

create policy "workspace members can read activity logs"
on activity_logs for select
using (
  exists (
    select 1 from workspace_members wm
    where wm.workspace_id = activity_logs.workspace_id and wm.user_id = auth.uid()
  )
  or exists (
    select 1 from workspaces w
    where w.id = activity_logs.workspace_id and w.owner_id = auth.uid()
  )
);

create policy "workspace members can create activity logs"
on activity_logs for insert
with check (
  exists (
    select 1 from workspace_members wm
    where wm.workspace_id = activity_logs.workspace_id and wm.user_id = auth.uid()
  )
  or exists (
    select 1 from workspaces w
    where w.id = activity_logs.workspace_id and w.owner_id = auth.uid()
  )
);
