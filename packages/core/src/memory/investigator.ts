import type { Memory, MemoryEvidence, MemoryKnowledgeState, MemoryResponse } from "./model.js";

export interface InvestigatorFinding {
  memoryId: string;
  evidenceIds: string[];
  statement: string;
  confidence: number;
}

export interface InvestigatorResult extends MemoryResponse {
  findings: InvestigatorFinding[];
  gaps: string[];
}

function relevance(memory: Memory, query: string): number {
  const haystack = [memory.title, memory.summary, memory.location, ...memory.tags]
    .filter(Boolean).join(" ").toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return 0;
  return terms.filter((term) => haystack.includes(term)).length / terms.length;
}

function evidenceFor(memory: Memory, query: string): MemoryEvidence[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return memory.evidence.filter((evidence) => {
    const text = `${evidence.excerpt ?? ""} ${evidence.kind}`.toLowerCase();
    return terms.some((term) => text.includes(term));
  });
}

function stateFor(confidence: number, evidenceCount: number): MemoryKnowledgeState {
  if (!evidenceCount) return "unknown";
  if (confidence >= 0.85) return "known";
  if (confidence >= 0.55) return "reconstructed";
  return "inferred";
}

export function investigate(memories: Memory[], query: string): InvestigatorResult {
  const matches = memories.map((memory) => {
    const matchedEvidence = evidenceFor(memory, query);
    const score = Math.min(1, relevance(memory, query) * 0.6 + (matchedEvidence.length ? 0.4 : 0));
    return { memory, score, matchedEvidence, relationshipRelevance: 0 };
  })
    // A summary alone is never enough for an investigator claim.
    .filter((match) => match.matchedEvidence.length > 0)
    .sort((a, b) => b.score - a.score);

  const findings = matches.map((match) => ({
    memoryId: match.memory.id,
    evidenceIds: match.matchedEvidence.map((evidence) => evidence.id),
    statement: match.memory.summary,
    confidence: Math.min(match.score, match.memory.confidence),
  }));

  const bestConfidence = findings.length ? Math.max(...findings.map((finding) => finding.confidence)) : 0;
  const evidenceCount = findings.reduce((count, finding) => count + finding.evidenceIds.length, 0);

  return {
    answer: findings[0]?.statement ?? "I couldn't find enough evidence to answer that.",
    matches,
    disclosure: { knowledgeState: stateFor(bestConfidence, evidenceCount), confidence: bestConfidence, evidenceCount },
    findings,
    gaps: findings.length ? [] : ["No matching evidence was found in the authorized memory set."],
  };
}
