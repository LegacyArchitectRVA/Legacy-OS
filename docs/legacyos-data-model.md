# LegacyOS Data Model

## Organization
Represents a business workspace.

Fields:
- id
- name
- industry
- created_at

## Knowledge Item
Represents business memory.

Fields:
- id
- organization_id
- title
- category
- source
- version
- approval_status

## Continuity Record
Represents critical operational information.

Fields:
- id
- organization_id
- pillar
- description
- owner
- status

## Decision Record
Represents Executive Advisor analysis.

Fields:
- id
- organization_id
- decision
- assumptions
- risks
- recommendation
