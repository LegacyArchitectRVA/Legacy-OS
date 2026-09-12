-- Multi-device and multi-source foundation for Legacy OS.
-- One authenticated workspace can have many simultaneously authorized devices
-- and storage connectors. Secrets/tokens are intentionally not stored here.

create table if not exists public.legacy_os_devices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  registered_by uuid not null references auth.users(id) on delete restrict,
  name text not null,
  platform text not null check (platform in ('windows','macos','linux','android','ios','nas','unknown')),
  device_key_fingerprint text not null,
  status text not null default 'pending' check (status in ('pending','active','revoked')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint legacy_os_devices_workspace_fingerprint_key unique (workspace_id, device_key_fingerprint)
);

create table if not exists public.legacy_os_storage_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  device_id uuid references public.legacy_os_devices(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  name text not null,
  source_type text not null check (source_type in ('local_filesystem','external_drive','nas','cloud_storage','provider_api')),
  provider text,
  root_reference text,
  credential_reference text,
  status text not null default 'pending' check (status in ('pending','active','paused','revoked','error')),
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legacy_os_files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  storage_source_id uuid not null references public.legacy_os_storage_sources(id) on delete cascade,
  external_id text not null,
  path text,
  name text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  content_hash text,
  modified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  indexed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint legacy_os_files_source_external_key unique (storage_source_id, external_id)
);

create table if not exists public.legacy_os_sync_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  storage_source_id uuid not null references public.legacy_os_storage_sources(id) on delete cascade,
  status text not null check (status in ('queued','running','completed','failed','cancelled')),
  started_at timestamptz,
  completed_at timestamptz,
  discovered_count integer not null default 0 check (discovered_count >= 0),
  indexed_count integer not null default 0 check (indexed_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists legacy_os_devices_workspace_idx on public.legacy_os_devices (workspace_id);
create index if not exists legacy_os_storage_sources_workspace_idx on public.legacy_os_storage_sources (workspace_id);
create index if not exists legacy_os_storage_sources_device_idx on public.legacy_os_storage_sources (device_id);
create index if not exists legacy_os_files_workspace_idx on public.legacy_os_files (workspace_id);
create index if not exists legacy_os_files_source_idx on public.legacy_os_files (storage_source_id);
create index if not exists legacy_os_files_hash_idx on public.legacy_os_files (content_hash) where content_hash is not null;
create index if not exists legacy_os_sync_runs_source_idx on public.legacy_os_sync_runs (storage_source_id, created_at desc);

alter table public.legacy_os_devices enable row level security;
alter table public.legacy_os_storage_sources enable row level security;
alter table public.legacy_os_files enable row level security;
alter table public.legacy_os_sync_runs enable row level security;

revoke all on table public.legacy_os_devices, public.legacy_os_storage_sources, public.legacy_os_files, public.legacy_os_sync_runs from anon;
grant select, insert, update, delete on table public.legacy_os_devices to authenticated;
grant select, insert, update, delete on table public.legacy_os_storage_sources to authenticated;
grant select, insert, update, delete on table public.legacy_os_files to authenticated;
grant select, insert, update on table public.legacy_os_sync_runs to authenticated;

create policy "workspace members can access Legacy OS devices"
on public.legacy_os_devices for all to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check (
  (select private.user_can_access_workspace(workspace_id))
  and registered_by = (select auth.uid())
);

create policy "workspace members can access Legacy OS storage sources"
on public.legacy_os_storage_sources for all to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check (
  (select private.user_can_access_workspace(workspace_id))
  and created_by = (select auth.uid())
  and (device_id is null or exists (
    select 1 from public.legacy_os_devices d
    where d.id = device_id and d.workspace_id = legacy_os_storage_sources.workspace_id
  ))
);

create policy "workspace members can access Legacy OS files"
on public.legacy_os_files for all to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check (
  (select private.user_can_access_workspace(workspace_id))
  and exists (
    select 1 from public.legacy_os_storage_sources s
    where s.id = storage_source_id and s.workspace_id = legacy_os_files.workspace_id
  )
);

create policy "workspace members can access Legacy OS sync runs"
on public.legacy_os_sync_runs for all to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check (
  (select private.user_can_access_workspace(workspace_id))
  and exists (
    select 1 from public.legacy_os_storage_sources s
    where s.id = storage_source_id and s.workspace_id = legacy_os_sync_runs.workspace_id
  )
);

-- Keep client-visible metadata bounded and prevent accidental secret storage.
create or replace function private.validate_legacy_os_storage_source()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if length(coalesce(new.name, '')) > 160 then
    raise exception 'Storage source name is too long';
  end if;
  if length(coalesce(new.root_reference, '')) > 2048 then
    raise exception 'Storage root reference is too long';
  end if;
  if length(coalesce(new.credential_reference, '')) > 512 then
    raise exception 'Credential reference is too long';
  end if;
  if new.credential_reference is not null and new.credential_reference ~* '(password|secret|token|api[_-]?key|private[_-]?key)\s*[:=]' then
    raise exception 'Raw credentials must not be stored as a credential reference';
  end if;
  return new;
end;
$$;

revoke execute on function private.validate_legacy_os_storage_source() from public;
grant execute on function private.validate_legacy_os_storage_source() to authenticated;

drop trigger if exists validate_legacy_os_storage_source on public.legacy_os_storage_sources;
create trigger validate_legacy_os_storage_source
before insert or update on public.legacy_os_storage_sources
for each row execute function private.validate_legacy_os_storage_source();
