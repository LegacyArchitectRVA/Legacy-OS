begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

-- Test users are transaction-scoped and are rolled back with this test.
insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'owner@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'member@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'outsider@test.local', '{}', '{}');

insert into public.workspaces (id, name, owner_id)
values
  ('10000000-0000-0000-0000-000000000001', 'RLS Test Workspace', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001', 'Other Workspace', '00000000-0000-0000-0000-000000000003');

insert into public.workspace_members (workspace_id, user_id, role)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'member');

insert into public.knowledge_documents (workspace_id, title, content)
values
  ('10000000-0000-0000-0000-000000000001', 'RLS Test Document', 'test'),
  ('20000000-0000-0000-0000-000000000001', 'Other Document', 'private');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.workspaces'::regclass),
  'workspaces has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.knowledge_documents'::regclass),
  'knowledge_documents has RLS enabled'
);
select ok(
  not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public' and table_name = 'workspaces' and grantee = 'anon'
  ),
  'anon has no table grants on workspaces'
);
select ok(
  not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public' and table_name = 'knowledge_documents' and grantee = 'anon'
  ),
  'anon has no table grants on knowledge_documents'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select is((select count(*)::integer from public.workspaces), 1, 'owner can read owned workspace');
select is((select count(*)::integer from public.knowledge_documents), 1, 'owner can read workspace document');
select is((select count(*)::integer from public.workspace_members), 1, 'owner can read workspace membership');
select lives_ok(
  $$insert into public.knowledge_documents (workspace_id, title) values ('10000000-0000-0000-0000-000000000001', 'Owner Insert')$$,
  'owner can insert workspace document'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select is((select count(*)::integer from public.workspaces), 1, 'member can read workspace');
select is((select count(*)::integer from public.knowledge_documents), 2, 'member can read workspace documents');
select lives_ok(
  $$insert into public.knowledge_documents (workspace_id, title) values ('10000000-0000-0000-0000-000000000001', 'Member Insert')$$,
  'member can insert workspace document'
);
select throws_ok(
  $$insert into public.knowledge_documents (workspace_id, title) values ('20000000-0000-0000-0000-000000000001', 'Cross Tenant Insert')$$,
  '42501',
  null,
  'member cannot insert into another workspace'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
select is((select count(*)::integer from public.workspaces), 1, 'non-member only sees own workspace');
select is((select count(*)::integer from public.knowledge_documents), 1, 'non-member only sees own workspace documents');
select throws_ok(
  $$insert into public.knowledge_documents (workspace_id, title) values ('10000000-0000-0000-0000-000000000001', 'Unauthorized Insert')$$,
  '42501',
  null,
  'non-member cannot insert into another workspace'
);
select is((select count(*)::integer from public.workspace_members), 0, 'non-member cannot read another workspace membership');

set local role anon;
select throws_ok(
  $$select count(*) from public.workspaces$$,
  '42501',
  null,
  'anonymous role cannot read workspaces'
);
select throws_ok(
  $$insert into public.workspaces (name, owner_id) values ('Anonymous Workspace', '00000000-0000-0000-0000-000000000003')$$,
  '42501',
  null,
  'anonymous role cannot create workspaces'
);

select * from finish();
rollback;
