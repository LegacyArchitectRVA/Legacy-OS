# LegacyOS Data Model

This reflects the live schema in `database/schema.sql`. Runtime migrations live under `supabase/migrations`; `database/migrations` is kept as a historical record.

## Workspace
Represents a personal, family, or business workspace.

Fields:
- id
- name
- owner_id
- industry
- created_at

## Workspace Member
Represents a person's access to a workspace.

Fields:
- id
- workspace_id
- user_id
- role (owner, admin, member)
- created_at

## Business Profile
Represents the mission, operating principles, and brand voice tied to a workspace.

Fields:
- id
- workspace_id
- mission
- operating_principles
- brand_voice
- created_at

## Knowledge Document
Represents preserved knowledge tied to a workspace.

Fields:
- id
- workspace_id
- title
- category
- source_type
- content
- embedding_reference
- version
- created_at

## SOP
Represents a documented process tied to a workspace.

Fields:
- id
- workspace_id
- process_name
- department
- steps
- owner
- risk_level
- updated_at

## AI Memory
Represents memory content generated or retrieved for a workspace.

Fields:
- id
- workspace_id
- memory_type
- memory_content
- created_at

## Activity Log
Represents an auditable action tied to a workspace.

Fields:
- id
- workspace_id
- action
- metadata
- created_at
