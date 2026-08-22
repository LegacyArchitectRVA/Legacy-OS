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
alter table public.legacy_successor_actions enable row level security;
drop policy if exists "successor actions owner access" on public.legacy_successor_actions;
create policy "successor actions owner access" on public.legacy_successor_actions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
