-- Harden multi-device source authorization.

create or replace function private.enforce_legacy_os_creator_identity()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_table_name = 'legacy_os_devices' and new.registered_by <> old.registered_by then
    raise exception 'Device registration owner cannot be changed';
  end if;
  if tg_table_name = 'legacy_os_storage_sources' and new.created_by <> old.created_by then
    raise exception 'Storage source creator cannot be changed';
  end if;
  return new;
end;
$$;

revoke execute on function private.enforce_legacy_os_creator_identity() from public;
grant execute on function private.enforce_legacy_os_creator_identity() to authenticated;

drop trigger if exists enforce_legacy_os_device_creator on public.legacy_os_devices;
create trigger enforce_legacy_os_device_creator before update on public.legacy_os_devices
for each row execute function private.enforce_legacy_os_creator_identity();

drop trigger if exists enforce_legacy_os_source_creator on public.legacy_os_storage_sources;
create trigger enforce_legacy_os_source_creator before update on public.legacy_os_storage_sources
for each row execute function private.enforce_legacy_os_creator_identity();

drop policy if exists "workspace members can access Legacy OS devices" on public.legacy_os_devices;
drop policy if exists "workspace members can access Legacy OS storage sources" on public.legacy_os_storage_sources;

create policy "workspace members can read Legacy OS devices" on public.legacy_os_devices
for select to authenticated using ((select private.user_can_access_workspace(workspace_id)));
create policy "workspace members can register Legacy OS devices" on public.legacy_os_devices
for insert to authenticated with check ((select private.user_can_access_workspace(workspace_id)) and registered_by = (select auth.uid()));
create policy "workspace members can manage Legacy OS devices" on public.legacy_os_devices
for update to authenticated using ((select private.user_can_access_workspace(workspace_id))) with check ((select private.user_can_access_workspace(workspace_id)));
create policy "workspace members can revoke Legacy OS devices" on public.legacy_os_devices
for delete to authenticated using ((select private.user_can_access_workspace(workspace_id)));

create policy "workspace members can read Legacy OS storage sources" on public.legacy_os_storage_sources
for select to authenticated using ((select private.user_can_access_workspace(workspace_id)));
create policy "workspace members can register Legacy OS storage sources" on public.legacy_os_storage_sources
for insert to authenticated with check (
  (select private.user_can_access_workspace(workspace_id)) and created_by = (select auth.uid())
  and (device_id is null or exists (select 1 from public.legacy_os_devices d where d.id = device_id and d.workspace_id = legacy_os_storage_sources.workspace_id))
);
create policy "workspace members can manage Legacy OS storage sources" on public.legacy_os_storage_sources
for update to authenticated using ((select private.user_can_access_workspace(workspace_id))) with check (
  (select private.user_can_access_workspace(workspace_id))
  and (device_id is null or exists (select 1 from public.legacy_os_devices d where d.id = device_id and d.workspace_id = legacy_os_storage_sources.workspace_id))
);
create policy "workspace members can revoke Legacy OS storage sources" on public.legacy_os_storage_sources
for delete to authenticated using ((select private.user_can_access_workspace(workspace_id)));
