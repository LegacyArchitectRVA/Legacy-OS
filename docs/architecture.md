# LegacyOS Architecture

## Overview

LegacyOS is a Next.js App Router application (`apps/web`) backed by Supabase and PostgreSQL. It's the software behind Legacy Architect RVA's Life Manual: a continuity record organized around the manual's seven chapters, with Legacy Recall as the memory layer on top of it.

## Application structure

- `apps/web/app` is the live application. There's no `next.config` file, so Next.js uses its defaults, and `apps/web/proxy.ts` (Next.js 16's `proxy()` convention) handles auth gating at the edge.
- Real, working surfaces: the marketing homepage, `/auth`, `/dashboard` (Legacy Recall, Continuity Readiness, Visual Recreation, Successor Mode, Clip Library), `/os` (command center), and `/successor` (a real `@react-three/fiber` continuity scene, not decorative).
- `apps/web/app/api` holds the backend routes. Every route still in the tree is wired to something real in the UI. Legacy Recall's routes (`recall/evidence`, `recall/memories`, `recall/intake`, `recall/analysis`, `recall/recreation`) do real evidence lookups and, for recreation, a real OpenAI-backed answer grounded in that evidence.

## Data model

See `legacyos-data-model.md`. The canonical schema lives in `database/schema.sql`, with runtime migrations under `supabase/migrations`.

## AI layer

LegacyOS uses OpenAI in two places, both real and both gated behind authentication:

- `/api/chat`, the LegacyOS assistant.
- `/api/recall/recreation`, which answers a memory question from preserved evidence and discloses what's verified versus reconstructed.

Both treat stored memories and continuity state as untrusted data, never as instructions, when they're passed to the model.

## Infrastructure

- Supabase for auth, database, and row-level security.
- Cloudflare for edge and storage needs.
- GitHub for source control and CI (lint, typecheck, tests, and a production build run on every change to main).

## Life Manual alignment

The seven pillars used across the app match the Life Manual's chapter order exactly: Digital Life, Emergency & Successor Access, Financial & Assets, Household Operations, Vital Records, Legacy & Wishes, and Business Continuity (Legacy edition only). The Readiness Check quiz uses its own separate pillar set and should never be reconciled with this one; they answer different questions.
