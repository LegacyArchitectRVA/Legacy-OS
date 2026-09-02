# Security Policy

## Scope

LegacyOS handles operational knowledge and continuity data. Security issues affecting authentication, authorization, tenant isolation, secrets, data exposure, dependency vulnerabilities, or production configuration are treated as high priority.

## Reporting

Do not disclose suspected vulnerabilities in a public issue. Report them privately to the repository owner through GitHub's private vulnerability reporting when available.

Include:
- affected component or route
- reproduction steps
- expected and actual behavior
- security impact
- any relevant logs or screenshots that do not contain secrets or personal data

Never include passwords, API keys, service-role credentials, session tokens, or other secrets in a report.

## Engineering standard

Changes should pass type checking, linting, regression tests, production build validation, dependency auditing, and the repository security/deprecation gate before release. Tenant data must remain protected by server-side authorization and database Row Level Security where applicable.
