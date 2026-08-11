import type { MemoryGraph, MemoryMatch, MemoryResponse } from "../memory/model.js";
import { createExperiencePlan, authorizeExperiencePlan, type EchoExperiencePlan, type ReconstructionConsent } from "./reconstruction.js";

export interface EchoQuery {
  viewerPersonId: string;
  subjectPersonId: string;
  query: string;
  relationship?: string;
  consent: ReconstructionConsent;
}

export interface EchoResult {
  response: MemoryResponse;
  experience?: EchoExperiencePlan;
}

const terms = (value: string): string[] =>
  [...new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])];

function retrieve(graph: MemoryGraph, query: EchoQuery): MemoryMatch[] {
  const queryTerms = terms(query.query);
  return graph.memories
    .filter((memory) => memory.subjectPersonId === query.subjectPersonId)
    .filter((memory) => memory.visibility !== "private" || memory.subjectPersonId === query.viewerPersonId)
    .map((memory) => {
      const haystack = terms(`${memory.title} ${memory.summary} ${memory.tags.join(" ")}`);
      const overlap = queryTerms.filter((term) => haystack.includes(term)).length;
      const relationshipRelevance = query.relationship && memory.participantIds.includes(query.viewerPersonId) ? 1 : 0;
      return {
        memory,
        score: overlap / Math.max(queryTerms.length, 1) + relationshipRelevance * 0.25,
        matchedEvidence: memory.evidence,
        relationshipRelevance,
      };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function orchestrateEcho(graph: MemoryGraph, query: EchoQuery): EchoResult {
  const matches = retrieve(graph, query);
  if (matches.length === 0) {
    return {
      response: {
        answer: "I don't have enough evidence to answer that.",
        matches: [],
        disclosure: { knowledgeState: "unknown", confidence: 0, evidenceCount: 0 },
      },
    };
  }

  const best = matches[0]!;
  const experience = authorizeExperiencePlan(
    createExperiencePlan(query.subjectPersonId, query.viewerPersonId, best.memory.id, best.memory.evidence.map((e) => e.sourceId)),
    query.consent,
  );

  return {
    response: {
      answer: best.memory.summary,
      matches,
      disclosure: {
        knowledgeState: best.memory.knowledgeState,
        confidence: best.memory.confidence,
        evidenceCount: best.memory.evidence.length,
      },
    },
    experience,
  };
}
