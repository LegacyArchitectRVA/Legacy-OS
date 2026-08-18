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

alter table public.legacy_recall_memories enable row level security;

drop policy if exists "Users can read their own Recall memories" on public.legacy_recall_memories;
create policy "Users can read their own Recall memories"
  on public.legacy_recall_memories for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own Recall memories" on public.legacy_recall_memories;
create policy "Users can create their own Recall memories"
  on public.legacy_recall_memories for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own Recall memories" on public.legacy_recall_memories;
create policy "Users can update their own Recall memories"
  on public.legacy_recall_memories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own Recall memories" on public.legacy_recall_memories;
create policy "Users can delete their own Recall memories"
  on public.legacy_recall_memories for delete
  using (auth.uid() = user_id);
