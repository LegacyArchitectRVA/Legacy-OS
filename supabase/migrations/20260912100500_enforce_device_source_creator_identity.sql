-- Enforce creator identity at the database boundary.
-- RLS remains the primary authorization layer; these triggers close spoofing paths
-- that can arise from privileged test contexts or future policy changes.

create or replace function private.enforce_legacy_os_device_creator()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.registered_by is distinct from auth.uid() then
    raise insufficient_privilege using message = 'Device creator must match authenticated user.';
  end if;
  return new;
end;
$$;

revoke execute on function private.enforce_legacy_os_device_creator() from public;
grant execute on function private.enforce_legacy_os_device_creator() to authenticated;

drop trigger if exists enforce_legacy_os_device_creator on public.legacy_os_devices;
create trigger enforce_legacy_os_device_creator
before insert on public.legacy_os_devices
for each row execute function private.enforce_legacy_os_device_creator();

create or replace function private.enforce_legacy_os_source_creator()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.created_by is distinct from auth.uid() then
    raise insufficient_privilege using message = 'Storage source creator must match authenticated user.';
  end if;
  return new;
end;
$$;

revoke execute on function private.enforce_legacy_os_source_creator() from public;
grant execute on function private.enforce_legacy_os_source_creator() to authenticated;

drop trigger if exists enforce_legacy_os_source_creator on public.legacy_os_storage_sources;
create trigger enforce_legacy_os_source_creator
before insert on public.legacy_os_storage_sources
for each row execute function private.enforce_legacy_os_source_creator();
