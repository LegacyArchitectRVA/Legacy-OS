begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000021', 'authenticated', 'authenticated', 'device-owner@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000022', 'authenticated', 'authenticated', 'device-member@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000023', 'authenticated', 'authenticated', 'device-outsider@test.local', '{}', '{}');

insert into public.workspaces (id, name, owner_id)
values ('00000000-0000-0000-0000-000000000121', 'Device Test Workspace', '00000000-0000-0000-0000-000000000021');
insert into public.workspace_members (workspace_id, user_id, role)
values ('00000000-0000-0000-0000-000000000121', '00000000-0000-0000-0000-000000000022', 'member');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.legacy_os_devices'::regclass),
  'device registry has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.legacy_os_storage_sources'::regclass),
  'storage sources have RLS enabled'
);
select ok(
  not exists (
    select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='legacy_os_devices' and grantee='anon'
  ),
  'anon has no direct device grants'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000022', true);

select lives_ok($$insert into public.legacy_os_devices (id,workspace_id,registered_by,name,platform,device_key_fingerprint,status) values ('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000121','00000000-0000-0000-0000-000000000022','Member Laptop','windows','fp-member','active')$$, 'workspace member can register a device');
select is((select count(*)::integer from public.legacy_os_devices), 1, 'workspace member sees the device');
select lives_ok($$insert into public.legacy_os_storage_sources (id,workspace_id,device_id,created_by,name,source_type,provider,status) values ('00000000-0000-0000-0000-000000000301','00000000-0000-0000-0000-000000000121','00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000022','Laptop Documents','local_filesystem',null,'active')$$, 'workspace member can register a storage source');
select lives_ok($$insert into public.legacy_os_files (id,workspace_id,storage_source_id,external_id,name,path) values ('00000000-0000-0000-0000-000000000401','00000000-0000-0000-0000-000000000121','00000000-0000-0000-0000-000000000301','file-1','Will.pdf','/Documents/Will.pdf')$$, 'workspace member can index a file for their source');

select lives_ok($$update public.legacy_os_devices set status='revoked' where id='00000000-0000-0000-0000-000000000201'$$, 'workspace member can revoke a device');
select lives_ok($$update public.legacy_os_storage_sources set status='paused' where id='00000000-0000-0000-0000-000000000301'$$, 'workspace member can pause a source');
select throws_ok($$delete from public.legacy_os_devices where id='00000000-0000-0000-0000-000000000201'$$, '42501', null, 'client cannot delete a device; revocation preserves lifecycle history');
select throws_ok($$delete from public.legacy_os_storage_sources where id='00000000-0000-0000-0000-000000000301'$$, '42501', null, 'client cannot delete a storage source; revocation preserves lifecycle history');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000021', true);
select lives_ok($$update public.legacy_os_devices set name='Renamed by workspace owner' where id='00000000-0000-0000-0000-000000000201'$$, 'another workspace member can manage an existing device');
select lives_ok($$update public.legacy_os_storage_sources set name='Renamed by workspace owner' where id='00000000-0000-0000-0000-000000000301'$$, 'another workspace member can manage an existing source');
select throws_ok($$update public.legacy_os_devices set registered_by='00000000-0000-0000-0000-000000000021' where id='00000000-0000-0000-0000-000000000201'$$, 'P0001', null, 'device creator identity cannot be changed');
select throws_ok($$update public.legacy_os_storage_sources set created_by='00000000-0000-0000-0000-000000000021' where id='00000000-0000-0000-0000-000000000301'$$, 'P0001', null, 'storage source creator identity cannot be changed');
select throws_ok($$insert into public.legacy_os_storage_sources (workspace_id,device_id,created_by,name,source_type) values ('00000000-0000-0000-0000-000000000121','00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000021','Owner-created','local_filesystem')$$, '42501', null, 'workspace member cannot spoof another user as source creator');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000023', true);
select is((select count(*)::integer from public.legacy_os_devices), 0, 'outsider cannot see another workspace devices');
select is((select count(*)::integer from public.legacy_os_storage_sources), 0, 'outsider cannot see another workspace sources');
select is((select count(*)::integer from public.legacy_os_files), 0, 'outsider cannot see another workspace files');
select throws_ok($$insert into public.legacy_os_devices (workspace_id,registered_by,name,platform,device_key_fingerprint) values ('00000000-0000-0000-0000-000000000121','00000000-0000-0000-0000-000000000023','Forged','windows','fp-outsider')$$, '42501', null, 'outsider cannot register a device in another workspace');

set local role anon;
select throws_ok($$select count(*) from public.legacy_os_devices$$, '42501', null, 'anon cannot read device registry');

select * from finish();
rollback;
