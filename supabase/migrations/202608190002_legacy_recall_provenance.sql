create table if not exists public.legacy_recall_evidence (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.legacy_recall_memories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('document', 'photo', 'audio', 'video', 'link', 'note')),
  label text not null check (char_length(trim(label)) >= 1),
  uri text not null check (char_length(trim(uri)) >= 1),
  description text,
  captured_at timestamptz,
  provenance jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'verified', 'disputed')),
  created_at timestamptz not null default now()
);

create index if not exists legacy_recall_evidence_memory_idx
  on public.legacy_recall_evidence(memory_id, created_at desc);

create index if not exists legacy_recall_evidence_user_idx
  on public.legacy_recall_evidence(user_id, created_at desc);

alter table public.legacy_recall_evidence enable row level security;

drop policy if exists "Users can read their own Recall evidence" on public.legacy_recall_evidence;
create policy "Users can read their own Recall evidence"
  on public.legacy_recall_evidence for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own Recall evidence" on public.legacy_recall_evidence;
create policy "Users can create their own Recall evidence"
  on public.legacy_recall_evidence for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own Recall evidence" on public.legacy_recall_evidence;
create policy "Users can update their own Recall evidence"
  on public.legacy_recall_evidence for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own Recall evidence" on public.legacy_recall_evidence;
create policy "Users can delete their own Recall evidence"
  on public.legacy_recall_evidence for delete
  using (auth.uid() = user_id);

create or replace function public.set_recall_memory_provenance_complete()
returns trigger
language plpgsql
security invoker
as $$
begin
  update public.legacy_recall_memories
  set provenance_complete = exists (
    select 1 from public.legacy_recall_evidence e
    where e.memory_id = new.memory_id
      and e.verification_status = 'verified'
  )
  where id = new.memory_id;
  return new;
end;
$$;

drop trigger if exists legacy_recall_evidence_provenance_trigger on public.legacy_recall_evidence;
create trigger legacy_recall_evidence_provenance_trigger
after insert or update or delete on public.legacy_recall_evidence
for each row execute function public.set_recall_memory_provenance_complete();
