# Legacy migration history

The files in this directory are retained as historical implementation records.

The deployable Supabase migration source of truth is `supabase/migrations/`.
The canonical workspace migration history uses the production versions already recorded by Supabase:

1. `20260902181132_006_workspace_foundation.sql`
2. `20260902181150_005_harden_workspace_rls.sql`
3. `20260902181233_007_enable_workspace_rls.sql`

The earlier `001-003` migrations belong to the retired organization model and must not be treated as the current LegacyOS workspace bootstrap.
