import type { Memory, MemoryEvidence, MemoryGraph } from "./model.js";

export interface EvidenceObservation {
  sourceId: string;
  kind: MemoryEvidence["kind"];
  text: string;
  occurredAt?: string;
  location?: string;
  merchant?: string;
  amount?: number;
}

export interface EvidenceAnswer {
  answer: string;
  memoryId?: string;
  sourceIds: string[];
  evidenceCount: number;
  certainty: "direct" | "partial" | "insufficient";
}

function terms(value: string): string[] {
  return [...new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])];
}

function overlap(query: string, value: string): number {
  const q = new Set(terms(query));
  const v = new Set(terms(value));
  if (!q.size || !v.size) return 0;
  let hits = 0;
  for (const term of q) if (v.has(term)) hits += 1;
  return hits / q.size;
}

/**
 * Retrieves facts from evidence without upgrading a transaction into a meal/order fact.
 * A receipt can establish that a person visited a merchant; an itemized receipt is
 * required before claiming what they ordered.
 */
export function answerFromEvidence(
  graph: MemoryGraph,
  subjectPersonId: string,
  query: string,
): EvidenceAnswer {
  const candidates: Array<{ memory: Memory; score: number }> = [];

  for (const memory of graph.memories) {
    if (memory.subjectPersonId !== subjectPersonId) continue;
    const score = overlap(query, `${memory.title} ${memory.summary} ${memory.tags.join(" ")} ${memory.location ?? ""}`);
    if (score > 0) candidates.push({ memory, score });
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best) {
    return { answer: "I don't have enough evidence to answer that.", sourceIds: [], evidenceCount: 0, certainty: "insufficient" };
  }

  const sourceIds = best.memory.evidence.map((evidence) => evidence.sourceId);
  const receiptEvidence = best.memory.evidence.filter((evidence) =>
    evidence.kind === "document" || evidence.kind === "family-submission",
  );
  const hasItemizedExcerpt = receiptEvidence.some((evidence) =>
    Boolean(evidence.excerpt && /ordered|item|menu|meal|dish|food/i.test(evidence.excerpt)),
  );

  if (receiptEvidence.length > 0 && !hasItemizedExcerpt) {
    const location = best.memory.location ?? best.memory.summary;
    return {
      answer: `I found evidence that he was at ${location}, but there's not enough information in the records to determine what was ordered.`,
      memoryId: best.memory.id,
      sourceIds,
      evidenceCount: sourceIds.length,
      certainty: "partial",
    };
  }

  return {
    answer: best.memory.summary,
    memoryId: best.memory.id,
    sourceIds,
    evidenceCount: sourceIds.length,
    certainty: best.memory.knowledgeState === "known" ? "direct" : "partial",
  };
}
