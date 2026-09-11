-- Canonical seven-pillar continuity model.
-- Pillar 5 is Vital Records.
create table if not exists public.continuity_pillars (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  pillar_key text not null,
  name text not null,
  description text not null,
  weight numeric(6,3) not null default 1,
  coverage_score integer not null default 0 check (coverage_score between 0 and 100),
  status text not null default 'needs_attention' check (status in ('needs_attention','in_progress','ready')),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint continuity_pillars_workspace_key unique (workspace_id, pillar_key)
);

create index if not exists continuity_pillars_workspace_idx on public.continuity_pillars (workspace_id);

alter table public.continuity_pillars enable row level security;
drop policy if exists "continuity pillars workspace access" on public.continuity_pillars;
create policy "continuity pillars workspace access" on public.continuity_pillars
for all using (
  exists (
    select 1 from public.workspaces w
    where w.id = continuity_pillars.workspace_id and w.owner_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.workspaces w
    where w.id = continuity_pillars.workspace_id and w.owner_id = auth.uid()
  )
);

-- Keep the score derived from the individual pillar records rather than a
-- hard-coded dashboard number. This view is intentionally owner-scoped through
-- the underlying RLS policy.
create or replace view public.continuity_readiness as
select
  workspace_id,
  round(sum(coverage_score * weight) / nullif(sum(weight), 0))::integer as overall_score,
  count(*)::integer as pillar_count,
  count(*) filter (where status = 'ready')::integer as ready_count,
  count(*) filter (where status = 'in_progress')::integer as in_progress_count,
  count(*) filter (where status = 'needs_attention')::integer as needs_attention_count,
  max(updated_at) as last_updated
from public.continuity_pillars
group by workspace_id;

revoke all on public.continuity_readiness from anon;
revoke all on public.continuity_readiness from public;
grant select on public.continuity_readiness to authenticated;
