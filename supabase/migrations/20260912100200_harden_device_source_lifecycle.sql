-- Harden device/source lifecycle authorization.
-- Registration identity is immutable; revocation/pausing is the lifecycle control.

create or replace function private.prevent_legacy_os_creator_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.registered_by is distinct from old.registered_by then
    raise exception 'Device creator cannot be changed';
  end if;
  return new;
end;
$$;

create or replace function private.prevent_legacy_os_source_creator_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.created_by is distinct from old.created_by then
    raise exception 'Storage source creator cannot be changed';
  end if;
  return new;
end;
$$;

revoke execute on function private.prevent_legacy_os_creator_change() from public;
revoke execute on function private.prevent_legacy_os_source_creator_change() from public;
grant execute on function private.prevent_legacy_os_creator_change() to authenticated;
grant execute on function private.prevent_legacy_os_source_creator_change() to authenticated;

drop trigger if exists prevent_legacy_os_creator_change on public.legacy_os_devices;
create trigger prevent_legacy_os_creator_change
before update on public.legacy_os_devices
for each row execute function private.prevent_legacy_os_creator_change();

drop trigger if exists prevent_legacy_os_source_creator_change on public.legacy_os_storage_sources;
create trigger prevent_legacy_os_source_creator_change
before update on public.legacy_os_storage_sources
for each row execute function private.prevent_legacy_os_source_creator_change();

drop policy if exists "workspace members can access Legacy OS devices" on public.legacy_os_devices;
drop policy if exists "workspace members can access Legacy OS storage sources" on public.legacy_os_storage_sources;

grant select, insert, update on table public.legacy_os_devices to authenticated;
grant select, insert, update on table public.legacy_os_storage_sources to authenticated;
revoke delete on table public.legacy_os_devices, public.legacy_os_storage_sources from authenticated;

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
