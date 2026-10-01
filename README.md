# LegacyOS

## Continuity for life, family, and business

LegacyOS is the software behind Legacy Architect RVA's Life Manual. It helps preserve the knowledge, memories, relationships, assets, responsibilities, systems, and decisions that matter to a person, a family, or a business, so none of it disappears just because someone becomes unavailable, circumstances change, or time passes.

LegacyOS runs in three contexts. The same continuity infrastructure helps someone organize their own life, helps a family preserve and navigate what matters, or helps a business keep running when key people are unavailable.

## Core layers

- **Continuity Vault**: the critical personal, family, and business information that makes up a continuity record, and how ready that record is.
- **Legacy Recall**: the human memory layer for stories, relationships, voice, images, video, and evidence-grounded memory experiences.
- **Legacy Score**: a measure of continuity and readiness across the record.

## Legacy Recall

Legacy Recall is the human memory layer of LegacyOS. It preserves meaningful stories, memories, relationships, voice, visual history, and personal context while people are alive, then makes that material discoverable to authorized people later.

Recall is evidence-grounded. It distinguishes documented information from reconstruction and inference, and it never presents an AI answer as the actual person. Every recalled memory carries a disclosure and the evidence it drew from, so the people using it later know exactly what's confirmed and what's a best guess.

## Continuity by context

### Personal

Organize the information, responsibilities, relationships, memories, accounts, property, documents, and decisions that make up a person's life.

### Family

Preserve shared knowledge, family history, important instructions, memories, relationships, and the information loved ones may need now or later.

### Business

Preserve knowledge, procedures, workflows, responsibilities, and operational dependencies so the business can keep running when leadership or key people are unavailable.

## Technology stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Supabase
- PostgreSQL

### AI layer
- OpenAI, for Legacy Recall's memory answers and the chat assistant, gated behind authentication and treated as untrusted input for anything it's shown

### Infrastructure
- Cloudflare
- GitHub for source control

## Product philosophy

LegacyOS runs on the same continuity philosophy as Legacy Architect RVA's Life Manual:

**What matters should stay understandable, discoverable, and usable when someone important is unavailable.**

LegacyOS isn't only a business continuity system and it isn't only a memory product. It's continuity infrastructure for the parts of life and work people don't want lost.

LegacyOS organizes information. It doesn't replace legal, financial, medical, or other licensed professional advice.

## Status

Foundation phase.

CI validation (lint, typecheck, tests, and production build) runs on every change to main.
