create or replace function public.advance_legacy_os_sync_run(
  p_sync_run_id uuid,
  p_file_count integer,
  p_complete boolean default false
)
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
begin
  if p_file_count < 0 or p_file_count > 500 then
    raise exception 'Invalid synchronization batch size';
  end if;

  return query
  update public.legacy_os_sync_runs as r
  set
    status = case when p_complete then 'completed' else 'running' end,
    started_at = coalesce(r.started_at, pg_catalog.now()),
    completed_at = case when p_complete then pg_catalog.now() else r.completed_at end,
    discovered_count = r.discovered_count + p_file_count,
    indexed_count = r.indexed_count + p_file_count
  where r.id = p_sync_run_id
    and r.status in ('queued', 'running')
    and (select private.user_can_access_workspace(r.workspace_id))
  returning r.id, r.workspace_id, r.storage_source_id, r.status, r.started_at, r.completed_at,
    r.discovered_count, r.indexed_count, r.failed_count, r.error_code, r.created_at;
end;
$$;

revoke execute on function public.advance_legacy_os_sync_run(uuid, integer, boolean) from public, anon;
grant execute on function public.advance_legacy_os_sync_run(uuid, integer, boolean) to authenticated;
