-- LegacyOS MVP Core Schema

create table if not exists organizations (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 created_at timestamptz default now()
);

create table if not exists users (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid references organizations(id),
 email text not null,
 role text default 'viewer',
 created_at timestamptz default now()
);

create table if not exists knowledge_items (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid references organizations(id),
 title text not null,
 content text,
 category text,
 version integer default 1,
 created_at timestamptz default now()
);

create table if not exists workflows (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid references organizations(id),
 name text not null,
 steps jsonb,
 created_at timestamptz default now()
);
