# Legacy Recall Intake

`POST /api/recall/intake` accepts a validated memory record for personal, family, or business continuity.

Required fields:

- `context`: `personal`, `family`, or `business`
- `title`
- `narrative`
- `evidenceClass`: `known`, `reconstructed`, `inferred`, or `unknown`

Optional fields include `occurredAt`, `people`, `sourceRefs`, and `confidence`.

The endpoint currently validates and normalizes the record. It intentionally does not claim durable storage until the production data store and authorization layer are connected.
