# LegacyOS Security Model

## Principles

LegacyOS follows a continuity-first security model.

Core rules:
- Never store credentials.
- Encrypt sensitive business data.
- Use least-privilege access.
- Maintain audit history.

## Data Separation

Business knowledge, user identity, and application secrets remain separated.

## Planned Controls

- Supabase Row Level Security
- Role-based access
- Encrypted document storage
- Audit logs
- Secure AI retrieval boundaries
