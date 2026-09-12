begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000031', 'authenticated', 'authenticated', 'recall-delete@test.local', '{}', '{}');

insert into public.legacy_recall_memories
  (id, user_id, context, title, narrative, evidence_class)
values
  ('41000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000031', 'personal', 'Delete trigger memory', 'Delete trigger regression test memory', 'known');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000031', true);

insert into public.legacy_recall_evidence
  (id, memory_id, user_id, type, label, uri, verification_status)
values
  ('42000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000031', 'document', 'Verified evidence', 'memory://verified', 'verified');

select is(
  (select provenance_complete from public.legacy_recall_memories where id='41000000-0000-0000-0000-000000000001'),
  true,
  'verified evidence marks provenance complete before deletion'
);

select lives_ok(
  $$delete from public.legacy_recall_evidence where id='42000000-0000-0000-0000-000000000001'$$,
  'deleting verified evidence does not fail the trigger'
);

select is(
  (select provenance_complete from public.legacy_recall_memories where id='41000000-0000-0000-0000-000000000001'),
  false,
  'delete trigger recomputes provenance completeness from remaining evidence'
);

select * from finish();
rollback;
