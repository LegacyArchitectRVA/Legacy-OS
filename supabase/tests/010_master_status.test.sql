begin;

create extension if not exists pgtap with schema extensions;
select plan(6);

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000041', 'authenticated', 'authenticated', 'craig@legacyarchitectrva.com', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000042', 'authenticated', 'authenticated', 'ordinary-status@test.local', '{}', '{}');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000042', true);
select is(public.get_legacy_os_master_status(), false, 'ordinary authenticated user receives false master status');
select is(public.bootstrap_legacy_os_master_account(), false, 'ordinary authenticated user cannot bootstrap master status');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000041', true);
select is(public.get_legacy_os_master_status(), false, 'configured account is not master before bootstrap');
select is(public.bootstrap_legacy_os_master_account(), true, 'configured account can bootstrap itself');
select is(public.get_legacy_os_master_status(), true, 'configured account receives true master status');

set local role anon;
select throws_ok($$select public.get_legacy_os_master_status()$$, '42501', null, 'anonymous user cannot read master status');

select * from finish();
rollback;
