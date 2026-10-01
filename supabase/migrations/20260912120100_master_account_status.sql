create or replace function public.get_legacy_os_master_status()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_legacy_os_master();
$$;

revoke execute on function public.get_legacy_os_master_status() from public, anon;
grant execute on function public.get_legacy_os_master_status() to authenticated;
