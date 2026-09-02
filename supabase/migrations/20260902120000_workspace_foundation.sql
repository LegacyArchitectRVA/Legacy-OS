-- Canonical LegacyOS workspace foundation.
-- Replaces the retired organization model represented by database/migrations/001-003.

create extension if not exists "uuid-ossp";

create table if not exists public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  industry text,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  constraint workspace_members_workspace_user_key unique (workspace_id, user_id),
  constraint workspace_members_role_check check (role in ('owner', 'admin', 'member'))
);

create table if not exists public.business_profiles (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  mission text,
  operating_principles text,
  brand_voice text,
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_documents (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  category text,
  source_type text,
  content text,
  embedding_reference text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  constraint knowledge_documents_version_check check (version > 0)
);

create table if not exists public.sops (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  process_name text not null,
  department text,
  steps text,
  owner text,
  risk_level text,
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_memories (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  memory_type text,
  memory_content text,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  action text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workspaces_owner_id_idx on public.workspaces (owner_id);
create index if not exists workspace_members_workspace_user_idx on public.workspace_members (workspace_id, user_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members (user_id);
create index if not exists business_profiles_workspace_id_idx on public.business_profiles (workspace_id);
create index if not exists knowledge_documents_workspace_id_idx on public.knowledge_documents (workspace_id);
create index if not exists sops_workspace_id_idx on public.sops (workspace_id);
create index if not exists ai_memories_workspace_id_idx on public.ai_memories (workspace_id);
create index if not exists activity_logs_workspace_id_idx on public.activity_logs (workspace_id);
