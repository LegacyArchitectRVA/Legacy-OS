# LegacyOS AI Memory Model

## Goal

Create business-specific AI context without mixing information between workspaces.

## Memory Layers

### Permanent Memory
Stable business facts:
- Mission
- Brand voice
- Operating principles
- Core procedures

### Operational Memory
Frequently used knowledge:
- SOPs
- Templates
- Workflows
- Decisions

### Session Memory
Temporary context:
- Current task
- User requests
- Active projects

## Retrieval Flow

User request -> Workspace context -> Relevant knowledge -> AI response -> Optional memory update

## Security Requirement

Every memory item must remain isolated to its workspace.
