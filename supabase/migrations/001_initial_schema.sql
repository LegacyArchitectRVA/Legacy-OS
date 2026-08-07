create extension if not exists vector;

create table if not exists workspaces (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 created_at timestamptz default now()
);

create table if not exists knowledge_items (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid references workspaces(id),
 title text not null,
 type text not null,
 content text,
 created_at timestamptz default now()
);

create table if not exists knowledge_chunks (
 id uuid primary key default gen_random_uuid(),
 knowledge_id uuid references knowledge_items(id),
 content text not null,
 embedding vector(1536)
);
