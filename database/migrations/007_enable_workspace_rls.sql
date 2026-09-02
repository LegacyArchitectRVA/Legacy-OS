-- RLS enablement is kept as a separate migration so the production
-- migration history remains explicit and auditable.

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.business_profiles enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.sops enable row level security;
alter table public.ai_memories enable row level security;
alter table public.activity_logs enable row level security;
