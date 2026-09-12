-- Atomically claim one queued sync run for execution.
create or replace function public.claim_legacy_os_sync_run(p_sync_run_id uuid)
returns table (
  id uuid,
  workspace_id uuid,
  storage_source_id uuid,
  status text,
  started_at timestamptz,
  completed_at timestamptz,
  discovered_count integer,
  indexed_count integer,
  failed_count integer,
  error_code text,
  created_at timestamptz
)
language plpgsql
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_workspace_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select r.workspace_id into v_workspace_id
  from public.legacy_os_sync_runs as r
  where r.id = p_sync_run_id
    and private.user_can_access_workspace(r.workspace_id);

  if v_workspace_id is null then
    raise exception 'Synchronization run not found';
  end if;

  if not exists (
    select 1
    from public.legacy_os_sync_runs as r
    join public.legacy_os_storage_sources as s
      on s.id = r.storage_source_id
     and s.workspace_id = r.workspace_id
    left join public.legacy_os_devices as d
      on d.id = s.device_id
     and d.workspace_id = s.workspace_id
    where r.id = p_sync_run_id
      and r.status = 'queued'
      and s.status = 'active'
      and (s.device_id is null or d.status = 'active')
  ) then
    raise exception 'Synchronization run is not eligible for execution';
  end if;

  return query
  update public.legacy_os_sync_runs as r
  set status = 'running',
      started_at = pg_catalog.now(),
      error_code = null
  where r.id = p_sync_run_id
    and r.status = 'queued'
    and private.user_can_access_workspace(r.workspace_id)
  returning r.id, r.workspace_id, r.storage_source_id, r.status,
            r.started_at, r.completed_at, r.discovered_count,
            r.indexed_count, r.failed_count, r.error_code, r.created_at;
end;
$$;

revoke execute on function public.claim_legacy_os_sync_run(uuid) from public, anon;
grant execute on function public.claim_legacy_os_sync_run(uuid) to authenticated;
