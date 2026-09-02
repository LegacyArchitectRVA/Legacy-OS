# LegacyOS database security status

## Production verification

Verified against the connected Supabase project on 2026-09-02:

- Workspace tables exist: `workspaces`, `workspace_members`, `business_profiles`, `knowledge_documents`, `sops`, `ai_memories`, `activity_logs`.
- Row Level Security is enabled on all seven workspace tables.
- `anon` has no table privileges on the workspace tables.
- `authenticated` has explicit CRUD grants matching the current application model; activity logs are select/insert only.
- Workspace membership has a unique `(workspace_id, user_id)` constraint.
- Workspace foreign-key columns have supporting indexes.
- The `private.user_can_access_workspace(uuid)` helper is `SECURITY DEFINER` with an empty `search_path`.
- The production database currently contains zero workspace/application rows after verification fixtures were rolled back.

## Migration architecture

The original `database/migrations/001-003` files belong to a retired organization model. The canonical workspace model therefore begins with `006_workspace_foundation.sql` and `007_enable_workspace_rls.sql` rather than pretending the retired migrations create the current workspace schema.

## Remaining requirement

The next security gate is automated RLS regression testing. Supabase recommends pgTAP tests covering schema/RLS state and positive and negative CRUD cases for anonymous users, members, owners, and non-members. Those tests must run in CI against a reproducible database before database security is considered complete.
