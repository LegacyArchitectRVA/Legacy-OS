-- LegacyOS Business Brain foundation

create table if not exists knowledge_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  title text not null,
  category text not null,
  content text,
  source_file text,
  version integer default 1,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists knowledge_items_org_idx on knowledge_items(organization_id);
