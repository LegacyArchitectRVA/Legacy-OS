-- Prevent duplicate queued/running synchronization jobs for one storage source.
-- The API also checks for an existing run, while this unique index closes the race.
create unique index if not exists legacy_os_sync_runs_one_active_per_source_idx
  on public.legacy_os_sync_runs (storage_source_id)
  where status in ('queued', 'running');
