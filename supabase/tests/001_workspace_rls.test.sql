begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'owner@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'member@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'outsider@test.local', '{}', '{}');

insert into public.workspaces (id, name, owner_id)
values
  ('10000000-0000-0000-0000-000000000001', 'Test Workspace', '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000001', 'Other Workspace', '00000000-0000-0000-0000-000000000003');

insert into public.workspace_members (workspace_id, user_id, role)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'member');

insert into public.business_profiles (workspace_id, mission) values ('10000000-0000-0000-0000-000000000001', 'test');
insert into public.knowledge_documents (workspace_id, title, content) values
  ('10000000-0000-0000-0000-000000000001', 'Test Document', 'test'),
  ('20000000-0000-0000-0000-000000000001', 'Private Document', 'private');
insert into public.sops (workspace_id, process_name) values ('10000000-0000-0000-0000-000000000001', 'Test SOP');
insert into public.ai_memories (workspace_id, memory_type, memory_content) values ('10000000-0000-0000-0000-000000000001', 'test', 'test');
insert into public.activity_logs (workspace_id, action) values ('10000000-0000-0000-0000-000000000001', 'test');

select ok(
  not exists (
    select 1 from (values
      ('workspaces'::text), ('workspace_members'), ('business_profiles'),
      ('knowledge_documents'), ('sops'), ('ai_memories'), ('activity_logs')
    ) expected(table_name)
    where not exists (
      select 1 from pg_class
      where oid = ('public.' || expected.table_name)::regclass and relrowsecurity
    )
  ),
  'all canonical workspace tables have RLS enabled'
);
select ok(
  not exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'
      and table_name in ('workspaces','workspace_members','business_profiles','knowledge_documents','sops','ai_memories','activity_logs')
  ),
  'anon has no direct grants on canonical workspace tables'
);

set local role authenticated;

-- Owner: workspace and membership CRUD.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select is((select count(*)::integer from public.workspaces), 1, 'owner can select workspace');
select lives_ok($$insert into public.workspaces (id,name,owner_id) values ('10000000-0000-0000-0000-000000000002','Created','00000000-0000-0000-0000-000000000001')$$, 'owner can insert workspace');
select lives_ok($$update public.workspaces set name='Updated' where id='10000000-0000-0000-0000-000000000001'$$, 'owner can update workspace');
select lives_ok($$delete from public.workspaces where id='10000000-0000-0000-0000-000000000002'$$, 'owner can delete workspace');
select throws_ok($$update public.workspaces set owner_id='00000000-0000-0000-0000-000000000002' where id='10000000-0000-0000-0000-000000000001'$$, '42501', null, 'owner cannot transfer ownership');
select lives_ok($$insert into public.workspace_members (workspace_id,user_id,role) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','member')$$, 'owner can insert membership');
select lives_ok($$update public.workspace_members set role='admin' where workspace_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000003'$$, 'owner can update membership');
select lives_ok($$delete from public.workspace_members where workspace_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000003'$$, 'owner can delete membership');

-- Owner: CRUD on all workspace data except append-only activity logs.
select lives_ok($$insert into public.business_profiles (workspace_id,mission) values ('10000000-0000-0000-0000-000000000001','owner insert')$$, 'owner can insert business profile');
select lives_ok($$update public.business_profiles set mission='owner update' where workspace_id='10000000-0000-0000-0000-000000000001' and mission='owner insert'$$, 'owner can update business profile');
select lives_ok($$delete from public.business_profiles where workspace_id='10000000-0000-0000-0000-000000000001' and mission='owner update'$$, 'owner can delete business profile');
select lives_ok($$insert into public.knowledge_documents (workspace_id,title) values ('10000000-0000-0000-0000-000000000001','owner insert')$$, 'owner can insert document');
select lives_ok($$update public.knowledge_documents set title='owner update' where workspace_id='10000000-0000-0000-0000-000000000001' and title='owner insert'$$, 'owner can update document');
select lives_ok($$delete from public.knowledge_documents where workspace_id='10000000-0000-0000-0000-000000000001' and title='owner update'$$, 'owner can delete document');
select lives_ok($$insert into public.sops (workspace_id,process_name) values ('10000000-0000-0000-0000-000000000001','owner insert')$$, 'owner can insert SOP');
select lives_ok($$update public.sops set process_name='owner update' where workspace_id='10000000-0000-0000-0000-000000000001' and process_name='owner insert'$$, 'owner can update SOP');
select lives_ok($$delete from public.sops where workspace_id='10000000-0000-0000-0000-000000000001' and process_name='owner update'$$, 'owner can delete SOP');
select lives_ok($$insert into public.ai_memories (workspace_id,memory_content) values ('10000000-0000-0000-0000-000000000001','owner insert')$$, 'owner can insert AI memory');
select lives_ok($$update public.ai_memories set memory_content='owner update' where workspace_id='10000000-0000-0000-0000-000000000001' and memory_content='owner insert'$$, 'owner can update AI memory');
select lives_ok($$delete from public.ai_memories where workspace_id='10000000-0000-0000-0000-000000000001' and memory_content='owner update'$$, 'owner can delete AI memory');
select lives_ok($$insert into public.activity_logs (workspace_id,action) values ('10000000-0000-0000-0000-000000000001','owner insert')$$, 'owner can insert activity log');
select throws_ok($$update public.activity_logs set action='owner update' where workspace_id='10000000-0000-0000-0000-000000000001'$$, '42501', null, 'owner cannot update activity log');
select throws_ok($$delete from public.activity_logs where workspace_id='10000000-0000-0000-0000-000000000001'$$, '42501', null, 'owner cannot delete activity log');

-- Member: shared data CRUD, but no workspace or membership administration.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select is((select count(*)::integer from public.workspaces), 1, 'member can select shared workspace');
select is((select count(*)::integer from public.workspace_members), 1, 'member can select own membership');
select lives_ok($$insert into public.workspaces (name,owner_id) values ('Member Workspace','00000000-0000-0000-0000-000000000002')$$, 'member can create own workspace');
select is((select count(*)::integer from public.workspaces where owner_id='00000000-0000-0000-0000-000000000002'), 1, 'member can read own created workspace');
select lives_ok($$update public.workspaces set name='member update' where id='10000000-0000-0000-0000-000000000001'$$, 'member update against protected workspace is safely denied');
select is((select count(*)::integer from public.workspaces where id='10000000-0000-0000-0000-000000000001' and name='Updated'), 1, 'member cannot modify protected workspace');
select lives_ok($$delete from public.workspaces where id='10000000-0000-0000-0000-000000000001'$$, 'member delete against protected workspace is safely denied');
select is((select count(*)::integer from public.workspaces where id='10000000-0000-0000-0000-000000000001'), 1, 'member cannot delete protected workspace');
select throws_ok($$insert into public.workspace_members (workspace_id,user_id,role) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','member')$$, '42501', null, 'member cannot insert membership');
select lives_ok($$update public.workspace_members set role='admin' where workspace_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000002'$$, 'member update membership is safely denied');
select is((select role from public.workspace_members where workspace_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000002'), 'member', 'member cannot change membership role');
select lives_ok($$delete from public.workspace_members where workspace_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000002'$$, 'member delete membership is safely denied');
select is((select count(*)::integer from public.workspace_members where workspace_id='10000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000002'), 1, 'member cannot delete membership');
select lives_ok($$insert into public.knowledge_documents (workspace_id,title) values ('10000000-0000-0000-0000-000000000001','member insert')$$, 'member can insert document');
select lives_ok($$update public.knowledge_documents set title='member update' where workspace_id='10000000-0000-0000-0000-000000000001' and title='member insert'$$, 'member can update document');
select lives_ok($$delete from public.knowledge_documents where workspace_id='10000000-0000-0000-0000-000000000001' and title='member update'$$, 'member can delete document');
select lives_ok($$insert into public.sops (workspace_id,process_name) values ('10000000-0000-0000-0000-000000000001','member insert')$$, 'member can insert SOP');
select lives_ok($$update public.sops set process_name='member update' where workspace_id='10000000-0000-0000-0000-000000000001' and process_name='member insert'$$, 'member can update SOP');
select lives_ok($$delete from public.sops where workspace_id='10000000-0000-0000-0000-000000000001' and process_name='member update'$$, 'member can delete SOP');
select lives_ok($$insert into public.ai_memories (workspace_id,memory_content) values ('10000000-0000-0000-0000-000000000001','member insert')$$, 'member can insert AI memory');
select lives_ok($$update public.ai_memories set memory_content='member update' where workspace_id='10000000-0000-0000-0000-000000000001' and memory_content='member insert'$$, 'member can update AI memory');
select lives_ok($$delete from public.ai_memories where workspace_id='10000000-0000-0000-0000-000000000001' and memory_content='member update'$$, 'member can delete AI memory');
select lives_ok($$insert into public.activity_logs (workspace_id,action) values ('10000000-0000-0000-0000-000000000001','member insert')$$, 'member can insert activity log');
select throws_ok($$update public.activity_logs set action='member update' where workspace_id='10000000-0000-0000-0000-000000000001'$$, '42501', null, 'member cannot update activity log');
select throws_ok($$delete from public.activity_logs where workspace_id='10000000-0000-0000-0000-000000000001'$$, '42501', null, 'member cannot delete activity log');

-- Cross-tenant protection uses rows that actually exist in the other workspace.
select is((select count(*)::integer from public.knowledge_documents where workspace_id='20000000-0000-0000-0000-000000000001'), 0, 'member cannot select another workspace document');
select throws_ok($$insert into public.knowledge_documents (workspace_id,title) values ('20000000-0000-0000-0000-000000000001','cross insert')$$, '42501', null, 'member cannot insert another workspace document');
select lives_ok($$update public.knowledge_documents set title='cross update' where workspace_id='20000000-0000-0000-0000-000000000001' and title='Private Document'$$, 'member cross-workspace update is safely denied');
select is((select title from public.knowledge_documents where workspace_id='20000000-0000-0000-0000-000000000001'), 'Private Document', 'member cannot modify another workspace document');
select lives_ok($$delete from public.knowledge_documents where workspace_id='20000000-0000-0000-0000-000000000001' and title='Private Document'$$, 'member cross-workspace delete is safely denied');
select is((select count(*)::integer from public.knowledge_documents where workspace_id='20000000-0000-0000-0000-000000000001'), 0, 'member cannot delete another workspace document');

-- Outsider cannot reach workspace A.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
select is((select count(*)::integer from public.workspaces where id='10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot select workspace');
select is((select count(*)::integer from public.workspace_members where workspace_id='10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot select membership');
select is((select count(*)::integer from public.business_profiles where workspace_id='10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot select business profile');
select is((select count(*)::integer from public.knowledge_documents where workspace_id='10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot select documents');
select is((select count(*)::integer from public.sops where workspace_id='10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot select SOPs');
select is((select count(*)::integer from public.ai_memories where workspace_id='10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot select AI memories');
select is((select count(*)::integer from public.activity_logs where workspace_id='10000000-0000-0000-0000-000000000001'), 0, 'outsider cannot select activity logs');
select throws_ok($$insert into public.knowledge_documents (workspace_id,title) values ('10000000-0000-0000-0000-000000000001','outsider insert')$$, '42501', null, 'outsider cannot insert workspace document');

set local role anon;
select throws_ok($$select count(*) from public.workspaces$$, '42501', null, 'anon cannot select workspaces');
select throws_ok($$insert into public.workspaces (name,owner_id) values ('anon','00000000-0000-0000-0000-000000000003')$$, '42501', null, 'anon cannot insert workspaces');
select throws_ok($$select count(*) from public.knowledge_documents$$, '42501', null, 'anon cannot select documents');

select * from finish();
rollback;
