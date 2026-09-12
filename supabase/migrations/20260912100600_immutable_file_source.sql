create or replace function private.protect_legacy_os_file_source()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.workspace_id <> old.workspace_id then
    raise exception 'Legacy OS file workspace cannot be changed';
  end if;
  if new.storage_source_id <> old.storage_source_id then
    raise exception 'Legacy OS file source cannot be changed';
  end if;
  return new;
end;
$$;

revoke execute on function private.protect_legacy_os_file_source() from public;
grant execute on function private.protect_legacy_os_file_source() to authenticated;

drop trigger if exists protect_legacy_os_file_source on public.legacy_os_files;
create trigger protect_legacy_os_file_source
before update on public.legacy_os_files
for each row execute function private.protect_legacy_os_file_source();
