begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000031', 'authenticated', 'authenticated', 'craig@legacyarchitectrva.com', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000032', 'authenticated', 'authenticated', 'ordinary@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000033', 'authenticated', 'authenticated', 'outsider2@test.local', '{}', '{}');

insert into public.workspaces (id, name, owner_id)
values
  ('31000000-0000-0000-0000-000000000001', 'Master Workspace', '00000000-0000-0000-0000-000000000032'),
  ('32000000-0000-0000-0000-000000000001', 'Second Workspace', '00000000-0000-0000-0000-000000000033');

insert into public.workspace_members (workspace_id, user_id, role)
values ('31000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000032', 'owner');

insert into public.business_profiles (workspace_id, mission)
values ('31000000-0000-0000-0000-000000000001', 'master-visible');
insert into public.knowledge_documents (workspace_id, title)
values
  ('31000000-0000-0000-0000-000000000001', 'First'),
  ('32000000-0000-0000-0000-000000000001', 'Second');
insert into public.sops (workspace_id, process_name)
values ('32000000-0000-0000-0000-000000000001', 'Second SOP');
insert into public.ai_memories (workspace_id, memory_content)
values ('32000000-0000-0000-0000-000000000001', 'Second memory');
insert into public.activity_logs (workspace_id, action)
values ('32000000-0000-0000-0000-000000000001', 'Second activity');

set local role authenticated;

-- The exact bootstrap identity can activate itself, but another account cannot.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000032', true);
select is(public.bootstrap_legacy_os_master_account(), false, 'non-master email cannot bootstrap master access');
select is(private.is_legacy_os_master(), false, 'ordinary user is not master');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000031', true);
select is(public.bootstrap_legacy_os_master_account(), true, 'configured master email bootstraps master access');
select is(private.is_legacy_os_master(), true, 'configured account is recognized as master');

-- Master can see every workspace and every canonical workspace-scoped resource.
select is((select count(*)::integer from public.workspaces), 2, 'master can read every workspace');
select is((select count(*)::integer from public.workspace_members), 1, 'master can read every membership row');
select is((select count(*)::integer from public.business_profiles), 1, 'master can read business profiles');
select is((select count(*)::integer from public.knowledge_documents), 2, 'master can read documents across workspaces');
select is((select count(*)::integer from public.sops), 1, 'master can read SOPs across workspaces');
select is((select count(*)::integer from public.ai_memories), 1, 'master can read AI memories across workspaces');
select is((select count(*)::integer from public.activity_logs), 1, 'master can read activity logs across workspaces');

-- Master can administer membership without becoming the owner of the workspace.
select lives_ok($$insert into public.workspace_members (workspace_id,user_id,role) values ('32000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000031','admin')$$, 'master can add membership to another workspace');
select lives_ok($$update public.workspace_members set role='member' where workspace_id='32000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000031'$$, 'master can update membership');
select lives_ok($$delete from public.workspace_members where workspace_id='32000000-0000-0000-0000-000000000001' and user_id='00000000-0000-0000-0000-000000000031'$$, 'master can remove membership');

-- Master can administer workspace data through the same canonical RLS helper.
select lives_ok($$insert into public.knowledge_documents (workspace_id,title) values ('32000000-0000-0000-0000-000000000001','Master Insert')$$, 'master can insert into another workspace');
select lives_ok($$update public.knowledge_documents set title='Master Update' where workspace_id='32000000-0000-0000-0000-000000000001' and title='Master Insert'$$, 'master can update another workspace');
select lives_ok($$delete from public.knowledge_documents where workspace_id='32000000-0000-0000-0000-000000000001' and title='Master Update'$$, 'master can delete another workspace document');

-- Master administration must not transfer ownership accidentally.
select lives_ok($$update public.workspaces set name='Master Renamed' where id='32000000-0000-0000-0000-000000000001'$$, 'master can administer workspace metadata');
select is((select owner_id from public.workspaces where id='32000000-0000-0000-0000-000000000001'), '00000000-0000-0000-0000-000000000033'::uuid, 'master cannot change ownership through an ordinary name update');
select throws_ok($$update public.workspaces set owner_id='00000000-0000-0000-0000-000000000031' where id='32000000-0000-0000-0000-000000000001'$$, 'P0001', 'Workspace ownership transfer requires the dedicated ownership workflow', 'master cannot transfer ownership through ordinary workspace CRUD');

-- The protected master binding cannot be deleted through ordinary client privileges.
select throws_ok($$delete from public.legacy_os_master_accounts where user_id='00000000-0000-0000-0000-000000000031'$$, '42501', null, 'master cannot directly delete its protected binding');
select is(private.is_legacy_os_master(), true, 'protected master binding remains active');

-- A non-master user cannot write the protected master table directly.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000032', true);
select throws_ok($$insert into public.legacy_os_master_accounts (user_id) values ('00000000-0000-0000-0000-000000000032')$$, '42501', null, 'ordinary user cannot insert master binding');
select is(private.is_legacy_os_master(), false, 'ordinary user remains non-master');
select is((select count(*)::integer from public.workspaces), 1, 'ordinary user remains isolated to owned workspace');

-- Anonymous callers cannot bootstrap or inspect protected master state.
set local role anon;
select throws_ok($$select public.bootstrap_legacy_os_master_account()$$, '42501', null, 'anonymous caller cannot bootstrap master access');

rollback;
