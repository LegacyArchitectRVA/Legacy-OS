-- LegacyOS Workspace Foundation
-- Initial operational memory data model

create extension if not exists "uuid-ossp";

create table if not exists workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid,
  industry text,
  created_at timestamptz default now()
);

create table if not exists workspace_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid not null,
  role text default 'member',
  created_at timestamptz default now()
);

create table if not exists business_profiles (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  mission text,
  operating_principles text,
  brand_voice text,
  created_at timestamptz default now()
);

create table if not exists knowledge_documents (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  title text not null,
  category text,
  source_type text,
  content text,
  embedding_reference text,
  version integer default 1,
  created_at timestamptz default now()
);

create table if not exists sops (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  process_name text not null,
  department text,
  steps text,
  owner text,
  risk_level text,
  updated_at timestamptz default now()
);

create table if not exists ai_memories (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  memory_type text,
  memory_content text,
  created_at timestamptz default now()
);

create table if not exists activity_logs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade,
  action text,
  metadata jsonb,
  created_at timestamptz default now()
);
