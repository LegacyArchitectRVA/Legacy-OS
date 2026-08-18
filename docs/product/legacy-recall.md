# LegacyOS Recall

## Product Thesis

**Recall what matters.**

LegacyOS Recall is the human memory layer of LegacyOS: an evidence-grounded, conversational representation of a person's stories, memories, voice, relationships, and personality. It is designed to preserve meaningful human context while the person is alive and make that context discoverable by authorized loved ones and successors later.

LegacyOS does not bring a person back, and it must never present an AI reconstruction as the actual person. The system preserves and reconstructs documented memories so an authorized person can experience someone's story through an explicitly identified AI legacy representation.

## The Signature Experience

A loved one asks:

> "Dad, do you remember the first time we went fishing at Smith Mountain Lake?"

LegacyOS recognizes the viewer, understands their relationship to Dad, retrieves the relevant evidence, and constructs a **Memory Experience**.

The experience may include:

- A lifelike 3D representation with authorized voice, facial expressions, conversational mannerisms, and natural movement.
- A reconstructed setting based on available evidence.
- Original photographs and videos displayed alongside or within the scene.
- Relevant messages, notes, journals, emails, and social posts surfaced as contextual evidence.
- Audio recordings and other original media when available.
- Relationship-aware conversation that can connect the memory to other documented experiences.

The avatar should not merely narrate the memory. It should **live out the documented memory as a reconstructed scene**, while preserving clear provenance underneath the experience.

## Memory Integrity

Memory integrity is non-negotiable. LegacyOS must distinguish between:

### Known

Information directly supported by source evidence.

### Reconstructed

A visual, audio, environmental, or behavioral reconstruction derived from available evidence.

### Inferred

Information inferred from multiple pieces of evidence but not directly documented.

### Unknown

Information for which there is insufficient evidence.

The system must never fabricate an uncertain event and present it as historical fact.

When evidence is insufficient, LegacyOS should say so and surface the available material instead:

> "I don't have enough material to reconstruct that moment accurately, but I found three things Dad saved about it."

## Memory Sources

With appropriate authorization and consent, the Memory Engine can incorporate:

- Photographs
- Video
- Voice recordings
- Social posts
- Messages
- Notes and journals
- Emails
- Letters
- Saved conversations
- Family-submitted memories
- Documents
- Locations and dates
- Existing Life Manual information

Every memory should retain provenance, source, timestamp, participants, relationship context, confidence, and verification state.

## Relationship-Aware Memory

LegacyOS should maintain a Relationship Graph rather than simply a contact list.

Example:

> Craig → father of → Sarah  
> Craig → coached → Sarah's soccer team  
> Sarah → calls Craig → Dad  
> Craig → traveled with → Sarah  
> Sarah → shares memory → 2011 fishing trip

This allows the same underlying memory to be experienced differently by a spouse, child, sibling, grandchild, friend, or successor.

The system should understand who is asking, how they relate to the person, what they are authorized to access, and which memories are relevant to that relationship.

## Memory Experience Architecture

```text
Sources
  ↓
Authorization & Consent
  ↓
Ingestion
  ↓
Normalization
  ↓
Evidence & Provenance
  ↓
Memory Graph + Relationship Graph
  ↓
Legacy AI
  ↓
Memory Experience Orchestrator
  ↓
3D Avatar + Voice + Scene + Original Media
  ↓
Conversational Recall
```

The 3D avatar is an interface layer, not the source of truth. The Memory Graph and Evidence Engine remain authoritative.

## Recalls

**Recalls** are curated or spontaneously surfaced memories that a loved one might otherwise never encounter.

Example:

> **A Recall from Dad**  
> "There's something you may want to see."

LegacyOS can combine a photograph, recording, note, story, and contextual relationship into a short experience. This makes LegacyOS useful during a person's lifetime, not only after death.

## Living Legacy

LegacyOS should be built for people and families to create memories together while they are alive.

A grandmother can answer questions from grandchildren. A father can record stories about growing up. A couple can preserve how they met. A business owner can explain why the company exists and how important decisions were made.

The system turns these moments into structured, searchable, contextualized memories that remain useful across generations.

## Product Positioning

LegacyOS Recall is not a digital resurrection product.

It is not merely a chatbot, avatar, estate vault, document repository, or personal AI.

It is **a human memory layer within continuity infrastructure for life, family, and business**.

The core system preserves what matters, understands how it relates, detects what is missing, and helps authorized people continue what the original person could no longer carry themselves.

Recall gives that infrastructure a human interface for memories, stories, relationships, and lived experience.

## Product Stack

```text
                    LEGACYOS
                       │
             ┌─────────┴─────────┐
             │                   │
       CONTINUITY LAYER      RECALL LAYER
             │                   │
      Life / Family /       Person / Stories
          Business          Relationships
      Assets / Duties       Experiences
      Documents             Voice / Video
             │                   │
             └─────────┬─────────┘
                       │
                CONTINUITY GRAPH
                       │
              ┌────────┴────────┐
              │                 │
        Evidence Engine    Relationship Engine
              │                 │
              └────────┬────────┘
                       │
                 LEGACY AI
                       │
             ┌─────────┴─────────┐
             │                   │
        Conversational       3D Recall
             │                   │
             └─────────┬─────────┘
                       │
                 SUCCESSOR MODE
```

## Design Principle

A photograph tells you what happened.

A video shows you what someone looked like.

A recording lets you hear their voice.

A journal tells you what they wrote.

LegacyOS connects those pieces into an evidence-grounded experience that can preserve the human context around them.

The goal is not to make someone believe the person has returned.

The goal is to make the person's stories, wisdom, relationships, and memories continue to reach the people they loved.

**Recall what matters.**
