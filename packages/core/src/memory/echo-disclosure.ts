import type { Memory, MemoryGraph, MemoryKnowledgeState, MemoryQueryContext } from "./model.js";
import { getRelationshipLabel } from "./relationship.js";

export interface DisclosureDecision {
  allowed: boolean;
  knowledgeState: MemoryKnowledgeState;
  confidence: number;
  relationship?: string;
  reason: "authorized" | "not-subject" | "no-relationship" | "insufficient-confidence";
}

export function evaluateEchoDisclosure(
  graph: MemoryGraph,
  memory: Memory,
  context: MemoryQueryContext,
): DisclosureDecision {
  if (memory.subjectPersonId !== context.subjectPersonId) {
    return { allowed: false, knowledgeState: memory.knowledgeState, confidence: memory.confidence, reason: "not-subject" };
  }

  const relationship = getRelationshipLabel(graph, context.subjectPersonId, context.viewerPersonId);
  if (!relationship && context.viewerPersonId !== context.subjectPersonId) {
    return { allowed: false, knowledgeState: memory.knowledgeState, confidence: memory.confidence, reason: "no-relationship" };
  }

  if (memory.confidence < 0.7) {
    return { allowed: false, knowledgeState: memory.knowledgeState, confidence: memory.confidence, relationship, reason: "insufficient-confidence" };
  }

  return { allowed: true, knowledgeState: memory.knowledgeState, confidence: memory.confidence, relationship, reason: "authorized" };
}
