-- Database-enforced global Master Account authorization.
-- The bootstrap email is only used to bind the authenticated identity once.
-- All subsequent authorization is UUID-based through legacy_os_master_accounts.

create table if not exists public.legacy_os_master_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

alter table public.legacy_os_master_accounts enable row level security;
revoke all on table public.legacy_os_master_accounts from public, anon, authenticated;

create or replace function private.is_legacy_os_master()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.legacy_os_master_accounts m
    where m.user_id = (select auth.uid())
      and m.active = true
  );
$$;

revoke execute on function private.is_legacy_os_master() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_legacy_os_master() to authenticated;

create or replace function public.bootstrap_legacy_os_master_account()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_email text;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if exists (
    select 1
    from public.legacy_os_master_accounts m
    where m.user_id = current_user_id
      and m.active = true
  ) then
    return true;
  end if;

  select lower(u.email)
    into current_email
  from auth.users u
  where u.id = current_user_id;

  if current_email is distinct from 'craig@legacyarchitectrva.com' then
    return false;
  end if;

  insert into public.legacy_os_master_accounts (user_id, active)
  values (current_user_id, true)
  on conflict (user_id) do update
    set active = true,
        updated_at = pg_catalog.now();

  return true;
end;
$$;

revoke execute on function public.bootstrap_legacy_os_master_account() from public, anon;
grant execute on function public.bootstrap_legacy_os_master_account() to authenticated;

create or replace function private.user_can_access_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_legacy_os_master()
  or exists (
    select 1
    from public.workspaces w
    where w.id = target_workspace_id
      and w.owner_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = (select auth.uid())
  );
$$;

revoke execute on function private.user_can_access_workspace(uuid) from public;
grant execute on function private.user_can_access_workspace(uuid) to authenticated;

drop policy if exists "authenticated users can read workspace membership" on public.workspace_members;
drop policy if exists "workspace owners can manage membership" on public.workspace_members;
drop policy if exists "workspace owners can update membership" on public.workspace_members;
drop policy if exists "workspace owners can delete membership" on public.workspace_members;

create policy "authenticated users can read workspace membership"
on public.workspace_members for select to authenticated
using (
  (select private.is_legacy_os_master())
  or user_id = (select auth.uid())
  or exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = (select auth.uid())
  )
);

create policy "workspace owners or master can manage membership"
on public.workspace_members for insert to authenticated
with check (
  (select private.is_legacy_os_master())
  or exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = (select auth.uid())
  )
);

create policy "workspace owners or master can update membership"
on public.workspace_members for update to authenticated
using (
  (select private.is_legacy_os_master())
  or exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = (select auth.uid())
  )
)
with check (
  (select private.is_legacy_os_master())
  or exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = (select auth.uid())
  )
);

create policy "workspace owners or master can delete membership"
on public.workspace_members for delete to authenticated
using (
  (select private.is_legacy_os_master())
  or exists (
    select 1 from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = (select auth.uid())
  )
);

drop policy if exists "workspace owners can update their workspace" on public.workspaces;
drop policy if exists "workspace owners can delete their workspace" on public.workspaces;

create policy "workspace owners or master can update their workspace"
on public.workspaces for update to authenticated
using (
  (select private.is_legacy_os_master())
  or (select auth.uid()) = owner_id
)
with check (
  (select private.is_legacy_os_master())
  or (select auth.uid()) = owner_id
);

create policy "workspace owners or master can delete their workspace"
on public.workspaces for delete to authenticated
using (
  (select private.is_legacy_os_master())
  or (select auth.uid()) = owner_id
);

-- Master administration cannot silently transfer ownership through normal CRUD.
create or replace function private.prevent_master_workspace_owner_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.owner_id is distinct from new.owner_id then
    raise exception 'Workspace ownership transfer requires the dedicated ownership workflow';
  end if;
  return new;
end;
$$;

revoke execute on function private.prevent_master_workspace_owner_change() from public;
grant execute on function private.prevent_master_workspace_owner_change() to authenticated;

drop trigger if exists prevent_master_workspace_owner_change on public.workspaces;
create trigger prevent_master_workspace_owner_change
before update on public.workspaces
for each row
when (old.owner_id is distinct from new.owner_id)
execute function private.prevent_master_workspace_owner_change();
