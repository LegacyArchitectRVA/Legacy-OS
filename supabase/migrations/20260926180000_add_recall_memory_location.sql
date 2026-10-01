-- Adds an optional place name to a Recall memory so Legacy Recall can ground
-- a reconstructed answer in real historical context (e.g. weather that day)
-- instead of inventing detail that was never preserved.

alter table public.legacy_recall_memories
  add column if not exists location text;
