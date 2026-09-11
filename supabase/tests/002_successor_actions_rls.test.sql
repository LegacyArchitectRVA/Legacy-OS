begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000011', 'authenticated', 'authenticated', 'successor-owner@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000012', 'authenticated', 'authenticated', 'successor-outsider@test.local', '{}', '{}');

insert into public.legacy_successor_actions
  (id, user_id, title, domain, instruction)
values
  ('11000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'Owner action', 'Household & Property', 'Owner-only test action'),
  ('22000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 'Private action', 'Financial & Assets', 'Outsider-only test action');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.legacy_successor_actions'::regclass),
  'successor actions have RLS enabled'
);

select ok(
  not exists (
    select 1
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name = 'legacy_successor_actions'
      and grantee = 'anon'
  ),
  'anon has no direct grants on successor actions'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000011', true);

select is(
  (select count(*)::integer from public.legacy_successor_actions),
  1,
  'owner sees only their successor actions'
);
select lives_ok(
  $$update public.legacy_successor_actions set notes='owner note' where id='11000000-0000-0000-0000-000000000001'$$,
  'owner can update their successor action'
);
select lives_ok(
  $$delete from public.legacy_successor_actions where id='11000000-0000-0000-0000-000000000001'$$,
  'owner can delete their successor action'
);
select is(
  (select count(*)::integer from public.legacy_successor_actions where id='22000000-0000-0000-0000-000000000001'),
  0,
  'owner cannot see another users successor action'
);
select throws_ok(
  $$insert into public.legacy_successor_actions (id,user_id,title,domain,instruction) values ('33000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012','forged','test','forbidden')$$,
  '42501',
  null,
  'owner cannot insert an action for another user'
);

set local role anon;
select throws_ok(
  $$select count(*) from public.legacy_successor_actions$$,
  '42501',
  null,
  'anon cannot select successor actions'
);

select * from finish();
rollback;
