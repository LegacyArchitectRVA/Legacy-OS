begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000031', 'authenticated', 'authenticated', 'manifest-owner@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000032', 'authenticated', 'authenticated', 'manifest-outsider@test.local', '{}', '{}');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000031', false);

insert into public.workspaces (id, name, owner_id)
values ('00000000-0000-0000-0000-000000000131', 'Manifest Test Workspace', '00000000-0000-0000-0000-000000000031');

insert into public.legacy_os_storage_sources (id, workspace_id, created_by, name, source_type, status)
values ('00000000-0000-0000-0000-000000000331', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000031', 'Manifest Source', 'provider_api', 'active');

insert into public.legacy_os_sync_runs (id, workspace_id, storage_source_id, status)
values ('00000000-0000-0000-0000-000000000531', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000331', 'queued');

select lives_ok($$select * from public.ingest_legacy_os_manifest(
  '00000000-0000-0000-0000-000000000531',
  '00000000-0000-0000-0000-000000000331',
  '[{"external_id":"a","name":"A.txt","metadata":{}},{"external_id":"b","name":"B.txt","metadata":{}}]'::jsonb,
  false
)$$, 'authorized user can atomically ingest a manifest');
select is((select discovered_count from public.legacy_os_sync_runs where id='00000000-0000-0000-0000-000000000531'), 2, 'manifest ingestion increments discovered count atomically');
select is((select indexed_count from public.legacy_os_sync_runs where id='00000000-0000-0000-0000-000000000531'), 2, 'manifest ingestion increments indexed count atomically');
select is((select count(*)::integer from public.legacy_os_files where storage_source_id='00000000-0000-0000-0000-000000000331'), 2, 'manifest ingestion indexes every file in one transaction');

select lives_ok($$select * from public.ingest_legacy_os_manifest(
  '00000000-0000-0000-0000-000000000531',
  '00000000-0000-0000-0000-000000000331',
  '[{"external_id":"c","name":"C.txt","metadata":{}}]'::jsonb,
  true
)$$, 'authorized user can complete a manifest');
select is((select status from public.legacy_os_sync_runs where id='00000000-0000-0000-0000-000000000531'), 'completed', 'completed manifest transitions run to completed');
select ok((select last_sync_at is not null from public.legacy_os_storage_sources where id='00000000-0000-0000-0000-000000000331'), 'completed manifest records source synchronization time');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000032', false);
select throws_ok($$select * from public.ingest_legacy_os_manifest(
  '00000000-0000-0000-0000-000000000531',
  '00000000-0000-0000-0000-000000000331',
  '[]'::jsonb,
  false
)$$, 'P0001', null, 'outsider cannot use another workspace synchronization run');

select * from finish();
rollback;
