import type { MemoryGraph, MemoryMatch, MemoryResponse } from "../memory/model.js";
import { authorizeEchoAccess, type EchoAuthorization } from "../memory/access.js";
import { buildFactualConclusion } from "./investigative-conclusion.js";
import { rankEvidence } from "./evidence-ranking.js";
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

function retrieve(graph: MemoryGraph, query: EchoQuery, authorization: EchoAuthorization): MemoryMatch[] {
  const queryTerms = terms(query.query);
  if (!authorization.relationshipVerified) return [];

  return graph.memories
    .filter((memory) => memory.subjectPersonId === query.subjectPersonId)
    .filter((memory) => memory.visibility !== "private" || memory.subjectPersonId === query.viewerPersonId)
    .map((memory) => {
      const haystack = terms(`${memory.title} ${memory.summary} ${memory.tags.join(" ")}`);
      const overlap = queryTerms.filter((term) => haystack.includes(term)).length;
      const relationshipRelevance = query.relationship && memory.participantIds.includes(query.viewerPersonId) ? 1 : 0;
      const evidenceScore = rankEvidence(memory.evidence.map((evidence) => ({
        id: evidence.id,
        kind: evidence.kind,
        confidence: evidence.confidence,
        original: true,
      }))).reduce((total, evidence) => total + evidence.score, 0) / Math.max(memory.evidence.length, 1);
      return {
        memory,
        score: overlap / Math.max(queryTerms.length, 1) + relationshipRelevance * 0.25 + evidenceScore * 0.25,
        matchedEvidence: memory.evidence,
        relationshipRelevance,
      };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function orchestrateEcho(graph: MemoryGraph, query: EchoQuery): EchoResult {
  const authorization = authorizeEchoAccess(graph, {
    viewerPersonId: query.viewerPersonId,
    subjectPersonId: query.subjectPersonId,
    query: query.query,
    relationship: query.relationship,
  });

  const matches = retrieve(graph, query, authorization);
  if (matches.length === 0) {
    return {
      response: {
        answer: authorization.relationshipVerified
          ? "I don't have enough evidence to answer that."
          : "I can't share that person's private legacy information with you.",
        matches: [],
        disclosure: { knowledgeState: "unknown", confidence: 0, evidenceCount: 0 },
      },
    };
  }

  const best = matches[0]!;
  const evidence = best.matchedEvidence.map((item) => ({
    id: item.id,
    kind: item.kind,
    confidence: item.confidence,
    original: true,
  }));
  const conclusion = buildFactualConclusion({
    claim: best.memory.summary,
    evidence,
  });
  const experience = authorizeExperiencePlan(
    createExperiencePlan(query.subjectPersonId, query.viewerPersonId, best.memory.id, best.memory.evidence.map((e) => e.sourceId)),
    query.consent,
  );

  return {
    response: {
      answer: `${conclusion.claim} ${conclusion.explanation}`,
      matches,
      disclosure: {
        knowledgeState: best.memory.knowledgeState,
        confidence: conclusion.evidence[0]?.score ?? best.memory.confidence,
        evidenceCount: best.memory.evidence.length,
      },
    },
    experience,
  };
}
