create table if not exists knowledge_chunks (
 id uuid primary key default gen_random_uuid(),
 knowledge_id uuid,
 content text not null,
 embedding vector(1536),
 metadata jsonb default '{}'::jsonb,
 created_at timestamptz default now()
);

create index if not exists knowledge_chunks_embedding_idx
on knowledge_chunks using ivfflat (embedding vector_cosine_ops);
