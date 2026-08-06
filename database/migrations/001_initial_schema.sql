-- LegacyOS initial schema

create table if not exists organizations (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 created_at timestamptz default now()
);

create table if not exists knowledge_items (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid references organizations(id) on delete cascade,
 title text not null,
 content text,
 category text,
 status text default 'draft',
 created_at timestamptz default now()
);

create table if not exists continuity_records (
 id uuid primary key default gen_random_uuid(),
 organization_id uuid references organizations(id) on delete cascade,
 name text not null,
 category text,
 notes text,
 created_at timestamptz default now()
);
