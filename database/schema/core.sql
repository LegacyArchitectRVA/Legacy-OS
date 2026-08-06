create extension if not exists "uuid-ossp";

create table if not exists organizations (
 id uuid primary key default uuid_generate_v4(),
 name text not null,
 created_at timestamptz default now()
);

create table if not exists knowledge_items (
 id uuid primary key default uuid_generate_v4(),
 organization_id uuid references organizations(id),
 title text not null,
 content text,
 source text,
 created_at timestamptz default now()
);

create table if not exists workflows (
 id uuid primary key default uuid_generate_v4(),
 organization_id uuid references organizations(id),
 name text not null,
 status text default 'draft',
 created_at timestamptz default now()
);