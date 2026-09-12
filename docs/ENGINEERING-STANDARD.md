# Legacy OS Engineering Standard

Legacy OS is a continuity system. The engineering standard therefore applies to every surface, not only the newest feature.

## 1. Current supported technology

- Production frameworks and SDKs stay on supported LTS or current stable releases.
- Security releases are applied before feature upgrades when the security release is available.
- Pre-release, beta, canary, and experimental packages are not production dependencies unless a documented exception is approved and isolated.
- Dependency versions are reproducible through the lockfile and continuously monitored by Dependabot.
- Deprecated packages and APIs are removed rather than carried forward indefinitely.

## 2. Security by default

- Every authenticated server operation derives identity from the authenticated session, never from client-supplied ownership fields.
- Sensitive responses are private and non-cacheable unless a route explicitly proves that public caching is safe.
- Database access is protected by owner-scoped RLS and tested for cross-user isolation.
- Secrets never enter source control, generated media, logs, browser bundles, or user-visible errors.
- Uploads and generated artifacts receive explicit type, size, ownership, provenance, and access controls.
- Security headers, transport security, dependency auditing, static analysis, type checking, and database linting are CI requirements.

## 3. AI and media quality

All generated or transformed media must be treated as an auditable artifact, not an opaque blob.

Every production media workflow must preserve, where applicable:

- source references
- rights and authorization state
- generation or transformation intent
- model/provider identity
- prompt or instruction provenance
- output identity/hash
- creation time
- quality and safety checks
- revision lineage

Accuracy, factual grounding, fidelity, accessibility, privacy, and provenance take priority over visual novelty.

## 4. Recreation and transformation

Transformative workflows must preserve source attribution and authorization. The system must distinguish original source material from generated output and must never silently represent generated material as an original recording or document.

## 5. Resilience

- Domain logic is deterministic and unit tested.
- External providers are isolated behind narrow interfaces.
- Provider failures must not corrupt durable continuity data.
- Retries are bounded and idempotent.
- Long-running generation work must be resumable from durable job state.
- Generated artifacts are immutable after publication; revisions create new lineage records.

## 6. Accessibility and portability

User-facing artifacts must be usable in light mode, print, mobile layouts, screen readers, and ordinary export workflows where the format supports them.

Documents should remain meaningful without the application whenever practical.

## 7. CI is the gate

A change is not production-ready until the relevant checks pass:

- dependency/security audit
- lint
- typecheck
- unit and integration tests
- database lint and pgTAP
- production build
- accessibility checks
- visual smoke checks for affected UI

A green build is evidence of the current commit only. A newer commit requires a fresh verification run.

## 8. Upgrade policy

When a supported stable release supersedes a direct dependency, upgrade it deliberately, regenerate the lockfile with the package manager, run the complete CI matrix, and keep the upgrade as an auditable commit.

Security patches take precedence over feature work.
