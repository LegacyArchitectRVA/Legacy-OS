-- LegacyOS Continuity Vault

create table if not exists continuity_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  category text not null,
  title text not null,
  description text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists continuity_records_org_idx on continuity_records(organization_id);
