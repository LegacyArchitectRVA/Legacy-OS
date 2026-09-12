begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000031', 'authenticated', 'authenticated', 'sync-owner@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000032', 'authenticated', 'authenticated', 'sync-member@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000033', 'authenticated', 'authenticated', 'sync-outsider@test.local', '{}', '{}');

insert into public.workspaces (id, name, owner_id)
values ('00000000-0000-0000-0000-000000000131', 'Sync Test Workspace', '00000000-0000-0000-0000-000000000031');
insert into public.workspace_members (workspace_id, user_id, role)
values ('00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000032', 'member');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000031', false);

insert into public.legacy_os_storage_sources
  (id, workspace_id, created_by, name, source_type, status)
values
  ('00000000-0000-0000-0000-000000000331', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000031', 'Active Source', 'provider_api', 'active'),
  ('00000000-0000-0000-0000-000000000332', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000031', 'Paused Source', 'provider_api', 'paused');

insert into public.legacy_os_sync_runs
  (id, workspace_id, storage_source_id, status)
values
  ('00000000-0000-0000-0000-000000000431', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000331', 'queued'),
  ('00000000-0000-0000-0000-000000000432', '00000000-0000-0000-0000-000000000131', '00000000-0000-0000-0000-000000000332', 'queued');

select ok(has_function_privilege('authenticated', 'public.claim_legacy_os_sync_run(uuid)', 'execute'),
  'authenticated users can claim synchronization runs');
select ok(not has_function_privilege('anon', 'public.claim_legacy_os_sync_run(uuid)', 'execute'),
  'anonymous users cannot claim synchronization runs');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000032', false);

select lives_ok($$select * from public.claim_legacy_os_sync_run('00000000-0000-0000-0000-000000000431')$$,
  'workspace member can claim an eligible queued run');
select is((select status from public.legacy_os_sync_runs where id='00000000-0000-0000-0000-000000000431'), 'running',
  'claimed run becomes running');
select ok((select started_at is not null from public.legacy_os_sync_runs where id='00000000-0000-0000-0000-000000000431'),
  'claim records the execution start time');
select throws_ok($$select * from public.claim_legacy_os_sync_run('00000000-0000-0000-0000-000000000431')$$,
  'P0001', null, 'a running run cannot be claimed twice');
select throws_ok($$select * from public.claim_legacy_os_sync_run('00000000-0000-0000-0000-000000000432')$$,
  'P0001', null, 'a run for an inactive source cannot be claimed');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000033', false);
select throws_ok($$select * from public.claim_legacy_os_sync_run('00000000-0000-0000-0000-000000000431')$$,
  'P0001', null, 'an outsider cannot claim another workspace run');

set local role anon;
select throws_ok($$select * from public.claim_legacy_os_sync_run('00000000-0000-0000-0000-000000000431')$$,
  '42501', null, 'anonymous users cannot invoke the claim function');

select * from finish();
rollback;
