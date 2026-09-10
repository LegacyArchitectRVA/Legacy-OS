begin;

create extension if not exists pgtap with schema extensions;

select no_plan();

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

insert into public.business_profiles (workspace_id, mission)
values ('10000000-0000-0000-0000-000000000001', 'test mission');

insert into public.knowledge_documents (workspace_id, title, content)
values
  ('10000000-0000-0000-0000-000000000001', 'RLS Test Document', 'test'),
  ('20000000-0000-0000-0000-000000000001', 'Other Document', 'private');

insert into public.sops (workspace_id, process_name, steps)
values ('10000000-0000-0000-0000-000000000001', 'Test Process', 'step one');

insert into public.ai_memories (workspace_id, memory_type, memory_content)
values ('10000000-0000-0000-0000-000000000001', 'test', 'test memory');

insert into public.activity_logs (workspace_id, action, metadata)
values ('10000000-0000-0000-0000-000000000001', 'test', '{"source":"rls-test"}');

-- All canonical workspace tables must have RLS enabled.
select ok(
  not exists (
    select 1
    from (values
      ('workspaces'::text),
      ('workspace_members'::text),
      ('business_profiles'::text),
      ('knowledge_documents'::text),
      ('sops'::text),
      ('ai_memories'::text),
      ('activity_logs'::text)
    ) as expected(table_name)
    where not exists (
      select 1 from pg_class
      where oid = ('public.' || expected.table_name)::regclass
        and relrowsecurity
    )
  ),
  'all canonical workspace tables have RLS enabled'
);

-- Anonymous callers have no direct table grants.
select ok(
  not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee = 'anon'
      and table_name in ('workspaces','workspace_members','business_profiles','knowledge_documents','sops','ai_memories','activity_logs')
  ),
  'anon has no grants on canonical workspace tables'
);

set local role authenticated;

-- Owner: full CRUD on the workspace itself.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select is((select count(*)::integer from public.workspaces), 1, 'owner can select own workspace');
select is((select count(*)::integer from public.knowledge_documents), 1, 'owner can select own documents');
select lives_ok(
  $$insert into public.workspaces (id, name, owner_id) values ('10000000-0000-0000-0000-000000000002', 'Owner Created Workspace', '00000000-0000-0000-0000-000000000001')$$,
  'owner can insert a workspace they own'
);
select lives_ok(
  $$update public.workspaces set name = 'Owner Updated Workspace' where id = '10000000-0000-0000-0000-000000000001'$$,
  'owner can update their workspace'
);
select lives_ok(
  $$delete from public.workspaces where id = '10000000-0000-0000-0000-000000000002'$$,
  'owner can delete their workspace'
);
select throws_ok(
  $$update public.workspaces set owner_id = '00000000-0000-0000-0000-000000000002' where id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null,
  'owner cannot transfer workspace ownership'
);

-- Owner: membership management.
select lives_ok(
  $$insert into public.workspace_members (workspace_id, user_id, role) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'member')$$,
  'owner can add a workspace member'
);
select lives_ok(
  $$update public.workspace_members set role = 'admin' where workspace_id = '10000000-0000-0000-0000-000000000001' and user_id = '00000000-0000-0000-0000-000000000003'$$,
  'owner can update workspace membership'
);
select lives_ok(
  $$delete from public.workspace_members where workspace_id = '10000000-0000-0000-0000-000000000001' and user_id = '00000000-0000-0000-0000-000000000003'$$,
  'owner can delete workspace membership'
);

-- Owner: full CRUD on each member-scoped data table.
select lives_ok(
  $$insert into public.business_profiles (workspace_id, mission) values ('10000000-0000-0000-0000-000000000001', 'owner insert')$$,
  'owner can insert business profile'
);
select lives_ok(
  $$update public.business_profiles set mission = 'owner update' where workspace_id = '10000000-0000-0000-0000-000000000001'$$,
  'owner can update business profile'
);
select lives_ok(
  $$delete from public.business_profiles where workspace_id = '10000000-0000-0000-0000-000000000001' and mission = 'owner update'$$,
  'owner can delete business profile'
);

select lives_ok(
  $$insert into public.knowledge_documents (workspace_id, title) values ('10000000-0000-0000-0000-000000000001', 'Owner Insert')$$,
  'owner can insert knowledge document'
);
select lives_ok(
  $$update public.knowledge_documents set title = 'Owner Updated Document' where workspace_id = '10000000-0000-0000-0000-000000000001' and title = 'Owner Insert'$$,
  'owner can update knowledge document'
);
select lives_ok(
  $$delete from public.knowledge_documents where workspace_id = '10000000-0000-0000-0000-000000000001' and title = 'Owner Updated Document'$$,
  'owner can delete knowledge document'
);

select lives_ok(
  $$insert into public.sops (workspace_id, process_name) values ('10000000-0000-0000-0000-000000000001', 'Owner Insert')$$,
  'owner can insert SOP'
);
select lives_ok(
  $$update public.sops set process_name = 'Owner Updated SOP' where workspace_id = '10000000-0000-0000-0000-000000000001' and process_name = 'Owner Insert'$$,
  'owner can update SOP'
);
select lives_ok(
  $$delete from public.sops where workspace_id = '10000000-0000-0000-0000-000000000001' and process_name = 'Owner Updated SOP'$$,
  'owner can delete SOP'
);

select lives_ok(
  $$insert into public.ai_memories (workspace_id, memory_content) values ('10000000-0000-0000-0000-000000000001', 'Owner Insert')$$,
  'owner can insert AI memory'
);
select lives_ok(
  $$update public.ai_memories set memory_content = 'Owner Updated Memory' where workspace_id = '10000000-0000-0000-0000-000000000001' and memory_content = 'Owner Insert'$$,
  'owner can update AI memory'
);
select lives_ok(
  $$delete from public.ai_memories where workspace_id = '10000000-0000-0000-0000-000000000001' and memory_content = 'Owner Updated Memory'$$,
  'owner can delete AI memory'
);

select is((select count(*)::integer from public.activity_logs), 1, 'owner can select activity logs');
select lives_ok(
  $$insert into public.activity_logs (workspace_id, action) values ('10000000-0000-0000-0000-000000000001', 'owner insert')$$,
  'owner can insert activity log'
);
select throws_ok(
  $$update public.activity_logs set action = 'owner update' where workspace_id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null,
  'owner cannot update activity logs'
);
select throws_ok(
  $$delete from public.activity_logs where workspace_id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null,
  'owner cannot delete activity logs'
);

-- Member: read and CRUD on shared workspace data, but not workspace ownership or membership administration.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select is((select count(*)::integer from public.workspaces), 1, 'member can select shared workspace');
select is((select count(*)::integer from public.workspace_members), 1, 'member can select their membership');
select throws_ok(
  $$insert into public.workspaces (name, owner_id) values ('Member Workspace', '00000000-0000-0000-0000-000000000002')$$,
  '42501', null,
  'member cannot insert a workspace for themselves'
);
select throws_ok(
  $$update public.workspaces set name = 'Member Update' where id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null,
  'member cannot update workspace'
);
select throws_ok(
  $$delete from public.workspaces where id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null,
  'member cannot delete workspace'
);
select throws_ok(
  $$insert into public.workspace_members (workspace_id, user_id, role) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'member')$$,
  '42501', null,
  'member cannot add workspace membership'
);
select throws_ok(
  $$update public.workspace_members set role = 'admin' where workspace_id = '10000000-0000-0000-0000-000000000001' and user_id = '00000000-0000-0000-0000-000000000002'$$,
  '42501', null,
  'member cannot update workspace membership'
);
select throws_ok(
  $$delete from public.workspace_members where workspace_id = '10000000-0000-0000-0000-000000000001' and user_id = '00000000-0000-0000-0000-000000000002'$$,
  '42501', null,
  'member cannot delete workspace membership'
);

select lives_ok(
  $$insert into public.business_profiles (workspace_id, mission) values ('10000000-0000-0000-0000-000000000001', 'member insert')$$,
  'member can insert business profile'
);
select lives_ok(
  $$update public.business_profiles set mission = 'member update' where workspace_id = '10000000-0000-0000-0000-000000000001' and mission = 'member insert'$$,
  'member can update business profile'
);
select lives_ok(
  $$delete from public.business_profiles where workspace_id = '10000000-0000-0000-0000-000000000001' and mission = 'member update'$$,
  'member can delete business profile'
);

select lives_ok(
  $$insert into public.knowledge_documents (workspace_id, title) values ('10000000-0000-0000-0000-000000000001', 'Member Insert')$$,
  'member can insert knowledge document'
);
select lives_ok(
  $$update public.knowledge_documents set title = 'Member Updated Document' where workspace_id = '10000000-0000-0000-0000-000000000001' and title = 'Member Insert'$$,
  'member can update knowledge document'
);
select lives_ok(
  $$delete from public.knowledge_documents where workspace_id = '10000000-0000-0000-0000-000000000001' and title = 'Member Updated Document'$$,
  'member can delete knowledge document'
);

select lives_ok(
  $$insert into public.sops (workspace_id, process_name) values ('10000000-0000-0000-0000-000000000001', 'Member Insert')$$,
  'member can insert SOP'
);
select lives_ok(
  $$update public.sops set process_name = 'Member Updated SOP' where workspace_id = '10000000-0000-0000-0000-000000000001' and process_name = 'Member Insert'$$,
  'member can update SOP'
);
select lives_ok(
  $$delete from public.sops where workspace_id = '10000000-0000-0000-0000-000000000001' and process_name = 'Member Updated SOP'$$,
  'member can delete SOP'
);

select lives_ok(
  $$insert into public.ai_memories (workspace_id, memory_content) values ('10000000-0000-0000-0000-000000000001', 'Member Insert')$$,
  'member can insert AI memory'
);
select lives_ok(
  $$update public.ai_memories set memory_content = 'Member Updated Memory' where workspace_id = '10000000-0000-0000-0000-000000000001' and memory_content = 'Member Insert'$$,
  'member can update AI memory'
);
select lives_ok(
  $$delete from public.ai_memories where workspace_id = '10000000-0000-0000-0000-000000000001' and memory_content = 'Member Updated Memory'$$,
  'member can delete AI memory'
);

select lives_ok(
  $$insert into public.activity_logs (workspace_id, action) values ('10000000-0000-0000-0000-000000000001', 'member insert')$$,
  'member can insert activity log'
);
select throws_ok(
  $$update public.activity_logs set action = 'member update' where workspace_id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null,
  'member cannot update activity logs'
);
select throws_ok(
  $$delete from public.activity_logs where workspace_id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null,
  'member cannot delete activity logs'
);

-- Cross-tenant access: membership in workspace A must not reach workspace B.
select is((select count(*)::integer from public.knowledge_documents where workspace_id = '20000000-0000-0000-0000-000000000001'), 0, 'member cannot read another workspace documents');
select throws_ok(
  $$insert into public.knowledge_documents (workspace_id, title) values ('20000000-0000-0000-0000-000000000001', 'Cross Tenant Insert')$$,
  '42501', null,
  'member cannot insert into another workspace'
);
select throws_ok(
  $$update public.knowledge_documents set title = 'Cross Tenant Update' where workspace_id = '20000000-0000-0000-0000-000000000002'$$,
  '42501', null,
  'member cannot update another workspace'
);
select throws_ok(
  $$delete from public.knowledge_documents where workspace_id = '20000000-0000-0000-0000-000000000001' and title = 'Other Document'$$,
  '42501', null,
  'member cannot delete another workspace document'
);

-- Outsider: no access to workspace A or its data.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
select is((select count(*)::integer from public.workspaces where id = '10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot read workspace');
select is((select count(*)::integer from public.workspace_members where workspace_id = '10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot read membership');
select is((select count(*)::integer from public.business_profiles where workspace_id = '10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot read business profile');
select is((select count(*)::integer from public.knowledge_documents where workspace_id = '10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot read documents');
select is((select count(*)::integer from public.sops where workspace_id = '10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot read SOPs');
select is((select count(*)::integer from public.ai_memories where workspace_id = '10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot read AI memories');
select is((select count(*)::integer from public.activity_logs where workspace_id = '10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot read activity logs');
select throws_ok(
  $$insert into public.knowledge_documents (workspace_id, title) values ('10000000-0000-0000-0000-000000000001', 'Unauthorized Insert')$$,
  '42501', null,
  'outsider cannot insert into workspace data'
);

set local role anon;
select throws_ok($$select count(*) from public.workspaces$$, '42501', null, 'anon cannot read workspaces');
select throws_ok($$insert into public.workspaces (name, owner_id) values ('Anonymous Workspace', '00000000-0000-0000-0000-000000000003')$$, '42501', null, 'anon cannot create workspaces');
select throws_ok($$select count(*) from public.knowledge_documents$$, '42501', null, 'anon cannot read documents');

select * from finish();
rollback;
