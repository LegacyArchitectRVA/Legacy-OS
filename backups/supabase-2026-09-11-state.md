# Supabase state backup

Backup date: 2026-09-11
Project: LegacyArchitectRVA's Project
Project ref: xeqmivqvtumsifwkxpcm
Region: us-west-2
Postgres: 17.6.1.147
Status at backup: ACTIVE_HEALTHY

## Data state

The production database currently contains zero rows in the application tables checked during backup, including `workspaces` and `continuity_pillars`. No customer workspace data was present to export.

## Applied migrations

- 20260902181132 / 006_workspace_foundation
- 20260902181150 / 005_harden_workspace_rls
- 20260902181233 / 007_enable_workspace_rls
- 20260904233242 / readiness_telemetry_and_elara_logs
- 20260911185236 / continuity_pillar_table
- 20260911185247 / continuity_pillar_security
- 20260911185255 / continuity_readiness_view

## Schema source of truth

The repository's `supabase/migrations/` directory contains the migration source used to recreate the database schema. The current TypeScript schema was regenerated from the live project during this backup and should be regenerated again after future migrations.

## Seven continuity pillars

1. Digital Life (`digital_life`)
2. Financial & Assets (`financial_assets`)
3. Household & Property (`household_property`)
4. Health & Medical (`health_medical`)
5. Vital Records (`vital_records`)
6. Business Continuity (`business_continuity`)
7. Legacy & Wishes (`legacy_wishes`)

## Recovery note

This is a schema/state backup, not a binary database dump. Because the production application tables were empty at backup time, the migration files are the authoritative recovery path for the database structure. Before introducing customer data, establish a scheduled database backup/export process.
