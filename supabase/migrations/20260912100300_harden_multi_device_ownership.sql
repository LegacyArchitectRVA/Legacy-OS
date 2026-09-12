-- Harden multi-device/source ownership and file metadata boundaries.
-- Workspace membership authorizes management; ownership fields remain immutable.

create or replace function private.protect_legacy_os_device_ownership()
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

revoke execute on function private.protect_legacy_os_device_ownership() from public;
grant execute on function private.protect_legacy_os_device_ownership() to authenticated;

drop trigger if exists protect_legacy_os_device_ownership on public.legacy_os_devices;
create trigger protect_legacy_os_device_ownership
before update on public.legacy_os_devices
for each row execute function private.protect_legacy_os_device_ownership();

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
