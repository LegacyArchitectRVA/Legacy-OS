begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000021', 'authenticated', 'authenticated', 'recall-owner@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000022', 'authenticated', 'authenticated', 'recall-outsider@test.local', '{}', '{}');

insert into public.legacy_recall_memories
  (id, user_id, context, title, narrative, evidence_class)
values
  ('31000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', 'personal', 'Owner memory', 'Owner memory for evidence ownership tests', 'known'),
  ('32000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000022', 'personal', 'Outsider memory', 'Outsider memory for evidence ownership tests', 'known');

select ok(
  exists (
    select 1
    from pg_constraint
    where conname = 'legacy_recall_evidence_memory_user_fkey'
      and conrelid = 'public.legacy_recall_evidence'::regclass
  ),
  'Recall evidence is constrained to the owning memory user'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000021', true);

select lives_ok(
  $$insert into public.legacy_recall_evidence
    (id,memory_id,user_id,type,label,uri,verification_status)
    values ('33000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000021','document','Owner evidence','memory://owner','verified')$$,
  'owner can attach evidence to their own memory'
);

select is(
  (select provenance_complete from public.legacy_recall_memories where id='31000000-0000-0000-0000-000000000001'),
  true,
  'verified evidence marks the owning memory provenance complete'
);

select throws_ok(
  $$insert into public.legacy_recall_evidence
    (id,memory_id,user_id,type,label,uri)
    values ('34000000-0000-0000-0000-000000000001','32000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000021','document','Forged evidence','memory://outsider')$$,
  '23503',
  null,
  'owner cannot attach evidence to another users memory'
);

select throws_ok(
  $$update public.legacy_recall_evidence
    set memory_id='32000000-0000-0000-0000-000000000001'
    where id='33000000-0000-0000-0000-000000000001'$$,
  '23503',
  null,
  'owner cannot move evidence onto another users memory'
);

select lives_ok(
  $$update public.legacy_recall_evidence
    set verification_status='disputed'
    where id='33000000-0000-0000-0000-000000000001'$$,
  'owner can change evidence verification status'
);

select is(
  (select provenance_complete from public.legacy_recall_memories where id='31000000-0000-0000-0000-000000000001'),
  false,
  'disputed evidence clears memory provenance completeness'
);

select lives_ok(
  $$delete from public.legacy_recall_evidence where id='33000000-0000-0000-0000-000000000001'$$,
  'owner can delete their evidence'
);

select is(
  (select provenance_complete from public.legacy_recall_memories where id='31000000-0000-0000-0000-000000000001'),
  false,
  'deleting the last verified evidence leaves provenance incomplete'
);

select * from finish();
rollback;
