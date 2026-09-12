-- Prevent Recall evidence from ever pointing at another user's memory.
-- The RLS policy protects the evidence row's user_id, but a plain FK on
-- memory_id alone does not prove that memory_id belongs to the same user.
create unique index if not exists legacy_recall_memories_id_user_uidx
  on public.legacy_recall_memories(id, user_id);

alter table public.legacy_recall_evidence
  drop constraint if exists legacy_recall_evidence_memory_id_fkey;

alter table public.legacy_recall_evidence
  add constraint legacy_recall_evidence_memory_user_fkey
  foreign key (memory_id, user_id)
  references public.legacy_recall_memories(id, user_id)
  on delete cascade;

-- Recompute provenance against the affected memory for every mutation. DELETE
-- triggers expose OLD, not NEW, so use the appropriate row for each operation.
create or replace function public.set_recall_memory_provenance_complete()
returns trigger
language plpgsql
security invoker
as $$
declare
  affected_memory_id uuid;
begin
  affected_memory_id := case
    when tg_op = 'DELETE' then old.memory_id
    else new.memory_id
  end;

  update public.legacy_recall_memories
  set provenance_complete = exists (
    select 1
    from public.legacy_recall_evidence e
    where e.memory_id = affected_memory_id
      and e.verification_status = 'verified'
  )
  where id = affected_memory_id;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
