-- LegacyOS initial database schema

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key,
  organization_id uuid references organizations(id),
  full_name text,
  role text,
  created_at timestamptz default now()
);

create table knowledge_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  title text not null,
  content text,
  category text,
  created_at timestamptz default now()
);

create table workflows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  name text not null,
  steps jsonb,
  created_at timestamptz default now()
);

create table continuity_scores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  score integer,
  recommendations jsonb,
  created_at timestamptz default now()
);
