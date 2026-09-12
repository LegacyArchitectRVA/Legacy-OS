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

-- Recompute provenance for the affected memory on every evidence mutation.
-- UPDATE can move evidence between memories, so the old memory must also be
-- recomputed when memory_id changes.
create or replace function public.set_recall_memory_provenance_complete()
returns trigger
language plpgsql
security invoker
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
