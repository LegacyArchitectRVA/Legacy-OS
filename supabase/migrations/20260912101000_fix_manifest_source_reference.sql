create or replace function public.ingest_legacy_os_manifest(
  p_sync_run_id uuid,
  p_source_id uuid,
  p_files jsonb,
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
declare
  v_workspace_id uuid;
  v_status text;
  v_count integer;
begin
  if jsonb_typeof(p_files) <> 'array' then
    raise exception 'Manifest files must be an array';
  end if;

  v_count := jsonb_array_length(p_files);
  if v_count < 0 or v_count > 500 then
    raise exception 'Invalid manifest batch size';
  end if;

  select r.workspace_id, r.status
    into v_workspace_id, v_status
  from public.legacy_os_sync_runs as r
  where r.id = p_sync_run_id
    and r.storage_source_id = p_source_id
    and (select private.user_can_access_workspace(r.workspace_id))
  for update;

  if v_workspace_id is null then
    raise exception 'Synchronization run not found';
  end if;
  if v_status not in ('queued', 'running') then
    raise exception 'Synchronization run is no longer writable';
  end if;

  insert into public.legacy_os_files (
    workspace_id,
    storage_source_id,
    external_id,
    path,
    name,
    mime_type,
    size_bytes,
    content_hash,
    modified_at,
    metadata,
    indexed_at
  )
  select
    v_workspace_id,
    p_source_id,
    f.external_id,
    f.path,
    f.name,
    f.mime_type,
    f.size_bytes,
    f.content_hash,
    f.modified_at,
    coalesce(f.metadata, '{}'::jsonb),
    pg_catalog.now()
  from jsonb_to_recordset(p_files) as f(
    external_id text,
    path text,
    name text,
    mime_type text,
    size_bytes bigint,
    content_hash text,
    modified_at timestamptz,
    metadata jsonb
  )
  on conflict on constraint legacy_os_files_source_external_key do update set
    path = excluded.path,
    name = excluded.name,
    mime_type = excluded.mime_type,
    size_bytes = excluded.size_bytes,
    content_hash = excluded.content_hash,
    modified_at = excluded.modified_at,
    metadata = excluded.metadata,
    indexed_at = excluded.indexed_at;

  if p_complete then
    update public.legacy_os_storage_sources as s
    set last_sync_at = pg_catalog.now()
    where s.id = p_source_id and s.workspace_id = v_workspace_id;
  end if;

  return query
  update public.legacy_os_sync_runs as r
  set
    status = case when p_complete then 'completed' else 'running' end,
    started_at = coalesce(r.started_at, pg_catalog.now()),
    completed_at = case when p_complete then pg_catalog.now() else r.completed_at end,
    discovered_count = r.discovered_count + v_count,
    indexed_count = r.indexed_count + v_count
  where r.id = p_sync_run_id
  returning r.id, r.workspace_id, r.storage_source_id, r.status, r.started_at, r.completed_at,
    r.discovered_count, r.indexed_count, r.failed_count, r.error_code, r.created_at;
end;
$$;

revoke execute on function public.ingest_legacy_os_manifest(uuid, uuid, jsonb, boolean) from public, anon;
grant execute on function public.ingest_legacy_os_manifest(uuid, uuid, jsonb, boolean) to authenticated;
