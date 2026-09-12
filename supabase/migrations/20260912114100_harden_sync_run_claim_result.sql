-- Change the claim RPC to return one JSON object and explicitly reject
-- a concurrent loser instead of silently returning no claimed run.
drop function if exists public.claim_legacy_os_sync_run(uuid);

create function public.claim_legacy_os_sync_run(p_sync_run_id uuid)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_workspace_id uuid;
  v_run public.legacy_os_sync_runs%rowtype;
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

  update public.legacy_os_sync_runs as r
  set status = 'running',
      started_at = pg_catalog.now(),
      error_code = null
  where r.id = p_sync_run_id
    and r.status = 'queued'
    and private.user_can_access_workspace(r.workspace_id)
    and exists (
      select 1
      from public.legacy_os_storage_sources as s
      where s.id = r.storage_source_id
        and s.workspace_id = r.workspace_id
        and s.status = 'active'
        and (
          s.device_id is null
          or exists (
            select 1
            from public.legacy_os_devices as d
            where d.id = s.device_id
              and d.workspace_id = s.workspace_id
              and d.status = 'active'
          )
        )
    )
  returning r.* into v_run;

  if not found then
    raise exception 'Synchronization run is not eligible for execution';
  end if;

  return jsonb_build_object(
    'id', v_run.id,
    'workspace_id', v_run.workspace_id,
    'storage_source_id', v_run.storage_source_id,
    'status', v_run.status,
    'started_at', v_run.started_at,
    'completed_at', v_run.completed_at,
    'discovered_count', v_run.discovered_count,
    'indexed_count', v_run.indexed_count,
    'failed_count', v_run.failed_count,
    'error_code', v_run.error_code,
    'created_at', v_run.created_at
  );
end;
$$;

revoke execute on function public.claim_legacy_os_sync_run(uuid) from public, anon;
grant execute on function public.claim_legacy_os_sync_run(uuid) to authenticated;
