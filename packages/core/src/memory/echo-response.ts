import type { MemoryGraph, MemoryQueryContext, MemoryResponse } from "./model.js";
import { evaluateEchoDisclosure } from "./echo-disclosure.js";

export interface EchoResponseBuilder {
  build(answer: string, context: MemoryQueryContext, graph: MemoryGraph): MemoryResponse;
}

/** Builds a grounded response envelope; prose generation remains provider-specific. */
export function buildGroundedResponse(
  answer: string,
  context: MemoryQueryContext,
  graph: MemoryGraph,
): MemoryResponse {
  const matches = graph.memories
    .filter((memory) => memory.subjectPersonId === context.subjectPersonId)
    .map((memory) => {
      const disclosure = evaluateEchoDisclosure(graph, memory, context);
      return disclosure.allowed
        ? {
            memory,
            score: memory.confidence,
            matchedEvidence: memory.evidence,
            relationshipRelevance: disclosure.relationship ? 1 : 0,
          }
        : null;
    })
    .filter((match): match is NonNullable<typeof match> => match !== null)
    .sort((a, b) => b.score - a.score);

  const best = matches[0];
  return {
    answer,
    matches,
    disclosure: {
      knowledgeState: best?.memory.knowledgeState ?? "unknown",
      confidence: best?.memory.confidence ?? 0,
      evidenceCount: best?.memory.evidence.length ?? 0,
    },
  };
}
