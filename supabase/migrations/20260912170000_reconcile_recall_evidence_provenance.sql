-- The original evidence migration created the base table, while the later
-- provenance migration used CREATE TABLE IF NOT EXISTS. Because the table
-- already existed, PostgreSQL correctly skipped the column additions.
-- Reconcile the schema explicitly so fresh and upgraded databases share the
-- same Recall evidence contract.
alter table public.legacy_recall_evidence
  add column if not exists provenance jsonb not null default '{}'::jsonb,
  add column if not exists verification_status text not null default 'unverified';

alter table public.legacy_recall_evidence
  drop constraint if exists legacy_recall_evidence_verification_status_check;

alter table public.legacy_recall_evidence
  add constraint legacy_recall_evidence_verification_status_check
  check (verification_status in ('unverified', 'verified', 'disputed'));

create index if not exists legacy_recall_evidence_memory_user_idx
  on public.legacy_recall_evidence(memory_id, user_id, created_at desc);

create or replace function public.set_recall_memory_provenance_complete()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  old_memory_id uuid;
  new_memory_id uuid;
begin
  old_memory_id := case when tg_op in ('UPDATE', 'DELETE') then old.memory_id end;
  new_memory_id := case when tg_op in ('INSERT', 'UPDATE') then new.memory_id end;

  if old_memory_id is not null and (tg_op = 'DELETE' or old_memory_id is distinct from new_memory_id) then
    update public.legacy_recall_memories
    set provenance_complete = exists (
      select 1
      from public.legacy_recall_evidence e
      where e.memory_id = old_memory_id
        and e.verification_status = 'verified'
    )
    where id = old_memory_id;
  end if;

  if new_memory_id is not null then
    update public.legacy_recall_memories
    set provenance_complete = exists (
      select 1
      from public.legacy_recall_evidence e
      where e.memory_id = new_memory_id
        and e.verification_status = 'verified'
    )
    where id = new_memory_id;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
