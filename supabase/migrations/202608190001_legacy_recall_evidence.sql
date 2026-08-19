create table if not exists public.legacy_recall_evidence (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.legacy_recall_memories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('document', 'photo', 'audio', 'video', 'link', 'note')),
  label text not null check (char_length(trim(label)) >= 1),
  uri text not null check (char_length(trim(uri)) >= 1),
  description text,
  captured_at timestamptz,
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
