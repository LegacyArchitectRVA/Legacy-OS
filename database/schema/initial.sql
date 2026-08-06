-- LegacyOS initial database schema

create table organizations (
 id uuid primary key default gen_random_uuid(),
 name text not null,
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
 description text,
 status text default 'active',
 created_at timestamptz default now()
);

create table ai_sessions (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid references organizations(id),
 agent_name text,
 messages jsonb,
 created_at timestamptz default now()
);
