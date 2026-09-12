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

alter policy "legacy_os_clips_owner_delete"
  on public.legacy_os_clips
  using (user_id = (select auth.uid()));

alter policy "legacy_os_clips_owner_insert"
  on public.legacy_os_clips
  with check (user_id = (select auth.uid()));

alter policy "legacy_os_clips_owner_select"
  on public.legacy_os_clips
  using (user_id = (select auth.uid()));

alter policy "legacy_os_clips_owner_update"
  on public.legacy_os_clips
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
