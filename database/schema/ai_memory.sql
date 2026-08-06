create table if not exists ai_memory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  memory_type text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists ai_memory_org_idx on ai_memory(organization_id);
