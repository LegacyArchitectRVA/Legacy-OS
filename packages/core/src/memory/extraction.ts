import type { Memory, MemoryEvidence, MemoryGraph, MemoryEvidenceKind, MemoryKnowledgeState } from "./model.js";
import type { IngestionRecord } from "./ingestion.js";

export interface ExtractedEntity {
  type: "person" | "place" | "event" | "date";
  value: string;
  confidence: number;
}

export interface ExtractionResult {
  sourceId: string;
  entities: ExtractedEntity[];
  candidate?: {
    title: string;
    summary: string;
    subjectPersonId: string;
    participantIds: string[];
    tags: string[];
    confidence: number;
    knowledgeState: MemoryKnowledgeState;
  };
}

export interface ExtractionAdapter {
  extract(record: IngestionRecord): ExtractionResult;
}

const STOP_WORDS = new Set(["the", "and", "with", "from", "that", "this", "were", "was", "our", "about", "into"]);

function meaningfulTerms(text: string): string[] {
  return [...new Set(text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])].filter((term) => !STOP_WORDS.has(term));
}

/** Deterministic baseline extractor. Provider-backed extraction can implement the same adapter. */
export const baselineExtractor: ExtractionAdapter = {
  extract(record) {
    const text = record.source.title;
    const terms = meaningfulTerms(text);
    return {
      sourceId: record.source.id,
      entities: terms.map((value) => ({ type: "event" as const, value, confidence: 0.5 })),
    };
  },
};

export function commitCandidateMemory(
  graph: MemoryGraph,
  record: IngestionRecord,
  result: ExtractionResult,
): MemoryGraph {
  if (!result.candidate) return graph;
  const candidate = result.candidate;
  const evidence: MemoryEvidence = {
    id: `evidence:${record.source.id}`,
    sourceId: record.source.id,
    kind: record.source.kind as MemoryEvidenceKind,
    confidence: candidate.confidence,
  };
  const memory: Memory = {
    id: `memory:${record.source.id}`,
    subjectPersonId: candidate.subjectPersonId,
    title: candidate.title,
    summary: candidate.summary,
    participantIds: candidate.participantIds,
    evidence: [evidence],
    knowledgeState: candidate.knowledgeState,
    confidence: candidate.confidence,
    visibility: "private",
    tags: candidate.tags,
    createdAt: record.source.capturedAt ?? record.source.importedAt,
    updatedAt: record.source.importedAt,
  };
  return { ...graph, memories: [...graph.memories, memory] };
}
