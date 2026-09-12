-- Remove avoidable security-linter findings while preserving tenant isolation.

alter view public.continuity_readiness set (security_invoker = true);

alter function public.set_recall_memory_provenance_complete()
  set search_path = public;

create index if not exists legacy_recall_evidence_memory_user_idx
  on public.legacy_recall_evidence(memory_id, user_id);

alter policy "continuity pillars workspace access"
  on public.continuity_pillars
  using (
    exists (
      select 1
      from public.workspaces w
      where w.id = continuity_pillars.workspace_id
        and w.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.workspaces w
      where w.id = continuity_pillars.workspace_id
        and w.owner_id = (select auth.uid())
    )
  );

-- legacy_os_clips originally used one consolidated FOR ALL policy. Harden
-- that policy directly rather than assuming four separately named policies
-- exist in every database created from the migration history.
drop policy if exists "legacy clips owner access" on public.legacy_os_clips;
create policy "legacy clips owner access"
  on public.legacy_os_clips
  for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
