create table if not exists public.legacy_os_clips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled clip',
  kind text not null check (kind in ('audio', 'video')),
  storage_path text,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  pillar_key text,
  life_manual_section text,
  created_at timestamptz not null default now()
);

alter table public.legacy_os_clips
  add column if not exists pillar_key text,
  add column if not exists life_manual_section text,
  add column if not exists storage_path text,
  add column if not exists duration_seconds integer,
  add column if not exists created_at timestamptz not null default now();

create index if not exists legacy_os_clips_user_id_idx
  on public.legacy_os_clips (user_id, created_at desc);

alter table public.legacy_os_clips enable row level security;

drop policy if exists "legacy clips owner access" on public.legacy_os_clips;
create policy "legacy clips owner access"
  on public.legacy_os_clips
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
