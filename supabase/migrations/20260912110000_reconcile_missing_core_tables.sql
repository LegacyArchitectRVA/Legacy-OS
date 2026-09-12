-- Reconcile production when older Recall/successor migrations were not applied.
-- Idempotent by design so this is safe against partially provisioned environments.

create table if not exists public.legacy_recall_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  context text not null check (context in ('personal', 'family', 'business')),
  title text not null check (char_length(trim(title)) >= 2),
  narrative text not null check (char_length(trim(narrative)) >= 2),
  occurred_at timestamptz,
  people jsonb not null default '[]'::jsonb,
  source_refs jsonb not null default '[]'::jsonb,
  evidence_class text not null check (evidence_class in ('known', 'reconstructed', 'inferred', 'unknown')),
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  provenance_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists legacy_recall_memories_user_context_idx
  on public.legacy_recall_memories(user_id, context, created_at desc);
create unique index if not exists legacy_recall_memories_id_user_uidx
  on public.legacy_recall_memories(id, user_id);

create table if not exists public.legacy_recall_evidence (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('document', 'photo', 'audio', 'video', 'link', 'note')),
  label text not null check (char_length(trim(label)) >= 1),
  uri text not null check (char_length(trim(uri)) >= 1),
  description text,
  captured_at timestamptz,
  provenance jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'verified', 'disputed')),
  created_at timestamptz not null default now(),
  constraint legacy_recall_evidence_memory_user_fkey
    foreign key (memory_id, user_id)
    references public.legacy_recall_memories(id, user_id)
    on delete cascade
);

create index if not exists legacy_recall_evidence_memory_idx
  on public.legacy_recall_evidence(memory_id, created_at desc);
create index if not exists legacy_recall_evidence_user_idx
  on public.legacy_recall_evidence(user_id, created_at desc);

alter table public.legacy_recall_memories enable row level security;
alter table public.legacy_recall_evidence enable row level security;

revoke all on table public.legacy_recall_memories, public.legacy_recall_evidence from anon, authenticated;
grant select, insert, update, delete on table public.legacy_recall_memories, public.legacy_recall_evidence to authenticated;

drop policy if exists "Users can read their own Recall memories" on public.legacy_recall_memories;
drop policy if exists "Users can create their own Recall memories" on public.legacy_recall_memories;
drop policy if exists "Users can update their own Recall memories" on public.legacy_recall_memories;
drop policy if exists "Users can delete their own Recall memories" on public.legacy_recall_memories;
create policy "Users can access their own Recall memories"
  on public.legacy_recall_memories for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own Recall evidence" on public.legacy_recall_evidence;
drop policy if exists "Users can create their own Recall evidence" on public.legacy_recall_evidence;
drop policy if exists "Users can update their own Recall evidence" on public.legacy_recall_evidence;
drop policy if exists "Users can delete their own Recall evidence" on public.legacy_recall_evidence;
create policy "Users can access their own Recall evidence"
  on public.legacy_recall_evidence for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

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
      select 1 from public.legacy_recall_evidence e
      where e.memory_id = old_memory_id
        and e.verification_status = 'verified'
    )
    where id = old_memory_id;
  end if;

  if new_memory_id is not null then
    update public.legacy_recall_memories
    set provenance_complete = exists (
      select 1 from public.legacy_recall_evidence e
      where e.memory_id = new_memory_id
        and e.verification_status = 'verified'
    )
    where id = new_memory_id;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists legacy_recall_evidence_provenance_trigger on public.legacy_recall_evidence;
create trigger legacy_recall_evidence_provenance_trigger
after insert or update or delete on public.legacy_recall_evidence
for each row execute function public.set_recall_memory_provenance_complete();

create table if not exists public.legacy_successor_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  domain text not null,
  instruction text not null,
  state text not null default 'open' check (state in ('open','in_progress','blocked','complete')),
  evidence_required boolean not null default false,
  evidence_confirmed boolean not null default false,
  dependencies text[] not null default '{}',
  notes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists legacy_successor_actions_user_id_idx on public.legacy_successor_actions(user_id);
create index if not exists legacy_successor_actions_state_idx on public.legacy_successor_actions(user_id,state);
create index if not exists legacy_successor_actions_user_updated_idx
  on public.legacy_successor_actions(user_id, updated_at desc);

alter table public.legacy_successor_actions enable row level security;
revoke all on table public.legacy_successor_actions from anon, authenticated;
grant select, insert, update, delete on table public.legacy_successor_actions to authenticated;
drop policy if exists "successor actions owner access" on public.legacy_successor_actions;
drop policy if exists "authenticated users can access their successor actions" on public.legacy_successor_actions;
create policy "authenticated users can access their successor actions"
  on public.legacy_successor_actions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
