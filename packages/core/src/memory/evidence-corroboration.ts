import type { MemoryEvidence, MemoryKnowledgeState } from "./model.js";

export interface CorroborationInput {
  statement: string;
  evidence: MemoryEvidence[];
}

export interface CorroboratedFinding {
  statement: string;
  evidenceIds: string[];
  independentSourceCount: number;
  confidence: number;
  knowledgeState: MemoryKnowledgeState;
  gaps: string[];
}

export function corroborate(input: CorroborationInput): CorroboratedFinding {
  const evidence = input.evidence.filter((item) => item.original !== false);
  const sourceIds = new Set(evidence.map((item) => item.sourceId));
  const avgConfidence = evidence.length
    ? evidence.reduce((sum, item) => sum + item.confidence, 0) / evidence.length
    : 0;
  const independentSourceCount = sourceIds.size;

  let confidence = Math.min(1, avgConfidence);
  let knowledgeState: MemoryKnowledgeState = "unknown";

  if (independentSourceCount >= 2 && confidence >= 0.8) {
    knowledgeState = "known";
    confidence = Math.min(1, confidence + 0.1);
  } else if (evidence.length >= 2 && confidence >= 0.55) {
    knowledgeState = "reconstructed";
  } else if (evidence.length === 1 && confidence >= 0.55) {
    knowledgeState = "inferred";
  }

  const gaps: string[] = [];
  if (!evidence.length) gaps.push("No supporting evidence was found.");
  if (evidence.length && independentSourceCount < 2) {
    gaps.push("Only one independent source supports this finding.");
  }

  return {
    statement: input.statement,
    evidenceIds: evidence.map((item) => item.id),
    independentSourceCount,
    confidence,
    knowledgeState,
    gaps,
  };
}
