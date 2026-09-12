-- Harden multi-device/source ownership and lifecycle controls.
-- Workspace membership authorizes management, while creator identity remains immutable.

create or replace function private.protect_legacy_os_ownership()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.workspace_id <> old.workspace_id then
    raise exception 'Legacy OS workspace ownership cannot be changed';
  end if;
  if new.registered_by is distinct from old.registered_by then
    raise exception 'Legacy OS device creator cannot be changed';
  end if;
  return new;
end;
$$;

revoke execute on function private.protect_legacy_os_ownership() from public;
grant execute on function private.protect_legacy_os_ownership() to authenticated;

drop trigger if exists protect_legacy_os_device_ownership on public.legacy_os_devices;
create trigger protect_legacy_os_device_ownership
before update on public.legacy_os_devices
for each row execute function private.protect_legacy_os_ownership();

create or replace function private.protect_legacy_os_storage_ownership()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.workspace_id <> old.workspace_id then
    raise exception 'Legacy OS workspace ownership cannot be changed';
  end if;
  if new.created_by is distinct from old.created_by then
    raise exception 'Legacy OS source creator cannot be changed';
  end if;
  return new;
end;
$$;

revoke execute on function private.protect_legacy_os_storage_ownership() from public;
grant execute on function private.protect_legacy_os_storage_ownership() to authenticated;

drop trigger if exists protect_legacy_os_storage_ownership on public.legacy_os_storage_sources;
create trigger protect_legacy_os_storage_ownership
before update on public.legacy_os_storage_sources
for each row execute function private.protect_legacy_os_storage_ownership();

-- Management is workspace-scoped. Inserts still bind creator identity to auth.uid().
drop policy if exists "workspace members can access Legacy OS devices" on public.legacy_os_devices;
create policy "workspace members can read Legacy OS devices"
on public.legacy_os_devices for select to authenticated
using ((select private.user_can_access_workspace(workspace_id)));

create policy "workspace members can register Legacy OS devices"
on public.legacy_os_devices for insert to authenticated
with check (
  (select private.user_can_access_workspace(workspace_id))
  and registered_by = (select auth.uid())
);

create policy "workspace members can manage Legacy OS devices"
on public.legacy_os_devices for update to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check ((select private.user_can_access_workspace(workspace_id)));

-- Revocation is the lifecycle control; prevent direct deletion from the client role.
revoke delete on table public.legacy_os_devices from authenticated;

drop policy if exists "workspace members can access Legacy OS storage sources" on public.legacy_os_storage_sources;
create policy "workspace members can read Legacy OS storage sources"
on public.legacy_os_storage_sources for select to authenticated
using ((select private.user_can_access_workspace(workspace_id)));

create policy "workspace members can register Legacy OS storage sources"
on public.legacy_os_storage_sources for insert to authenticated
with check (
  (select private.user_can_access_workspace(workspace_id))
  and created_by = (select auth.uid())
  and (device_id is null or exists (
    select 1 from public.legacy_os_devices d
    where d.id = device_id and d.workspace_id = legacy_os_storage_sources.workspace_id
  ))
);

create policy "workspace members can manage Legacy OS storage sources"
on public.legacy_os_storage_sources for update to authenticated
using ((select private.user_can_access_workspace(workspace_id)))
with check (
  (select private.user_can_access_workspace(workspace_id))
  and (device_id is null or exists (
    select 1 from public.legacy_os_devices d
    where d.id = device_id and d.workspace_id = legacy_os_storage_sources.workspace_id
  ))
);

revoke delete on table public.legacy_os_storage_sources from authenticated;

-- Bound high-volume client metadata before it reaches the index.
create or replace function private.validate_legacy_os_file_metadata()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if length(coalesce(new.external_id, '')) > 2048 then
    raise exception 'External file identifier is too long';
  end if;
  if length(coalesce(new.name, '')) > 512 then
    raise exception 'File name is too long';
  end if;
  if length(coalesce(new.path, '')) > 8192 then
    raise exception 'File path is too long';
  end if;
  if length(coalesce(new.mime_type, '')) > 255 then
    raise exception 'MIME type is too long';
  end if;
  if length(coalesce(new.content_hash, '')) > 256 then
    raise exception 'Content hash is too long';
  end if;
  if octet_length(coalesce(new.metadata, '{}'::jsonb)::text) > 65536 then
    raise exception 'File metadata is too large';
  end if;
  return new;
end;
$$;

revoke execute on function private.validate_legacy_os_file_metadata() from public;
grant execute on function private.validate_legacy_os_file_metadata() to authenticated;

drop trigger if exists validate_legacy_os_file_metadata on public.legacy_os_files;
create trigger validate_legacy_os_file_metadata
before insert or update on public.legacy_os_files
for each row execute function private.validate_legacy_os_file_metadata();
