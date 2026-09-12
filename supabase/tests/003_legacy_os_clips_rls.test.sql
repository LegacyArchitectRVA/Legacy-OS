begin;

create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000021', 'authenticated', 'authenticated', 'clip-owner@test.local', '{}', '{}'),
  ('00000000-0000-0000-0000-000000000022', 'authenticated', 'authenticated', 'clip-outsider@test.local', '{}', '{}');

insert into public.legacy_successor_actions
  (id, user_id, title, domain, instruction)
values
  ('11000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000021', 'Owner action', 'Household & Property', 'Owner-only clip action'),
  ('22000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000022', 'Private action', 'Financial & Assets', 'Outsider-only clip action');

insert into public.legacy_os_clips
  (id, user_id, title, kind, storage_path, duration_seconds, successor_action_id)
values
  ('33000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000021', 'Owner clip', 'audio', '00000000-0000-0000-0000-000000000021/owner.webm', 12, '11000000-0000-0000-0000-000000000021');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.legacy_os_clips'::regclass),
  'legacy OS clips have RLS enabled'
);

select ok(
  exists (
    select 1
    from pg_trigger
    where tgrelid = 'public.legacy_os_clips'::regclass
      and tgname = 'validate_clip_successor_action_owner'
      and not tgisinternal
  ),
  'clip successor ownership trigger exists'
);

select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.legacy_os_clips'::regclass
      and contype = 'f'
      and confrelid = 'public.legacy_successor_actions'::regclass
  ),
  'clip successor link has a foreign key'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000021', true);

select is(
  (select count(*)::integer from public.legacy_os_clips),
  1,
  'clip owner sees only their clips'
);

select lives_ok(
  $$insert into public.legacy_os_clips (id,user_id,title,kind,storage_path,duration_seconds,successor_action_id) values ('33000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000021','Owner second clip','video','00000000-0000-0000-0000-000000000021/owner.mp4',5,'11000000-0000-0000-0000-000000000021')$$,
  'owner can link a clip to their own successor action'
);

select throws_ok(
  $$insert into public.legacy_os_clips (id,user_id,title,kind,storage_path,duration_seconds,successor_action_id) values ('33000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000021','Forged clip','audio','00000000-0000-0000-0000-000000000021/forged.webm',4,'22000000-0000-0000-0000-000000000022')$$,
  'P0001',
  null,
  'clip owner cannot link to another users successor action'
);

select throws_ok(
  $$insert into public.legacy_os_clips (id,user_id,title,kind,storage_path,duration_seconds) values ('33000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000022','Forged owner clip','audio','00000000-0000-0000-0000-000000000022/forged.webm',3)$$,
  '42501',
  null,
  'clip owner cannot insert a clip for another user'
);

select set_config('request.jwt.claim.sub', '', true);
set local role anon;
select is(
  (select count(*)::integer from public.legacy_os_clips),
  0,
  'anon cannot see clips'
);

select * from finish();
rollback;
