import type { MemoryEvidence, MemoryGraph, MemorySource } from "../memory/model.js";

export type FactStrength = "direct" | "partial" | "corroborated";

export interface InvestigativeFinding {
  claim: string;
  strength: FactStrength;
  confidence: number;
  sourceIds: string[];
  evidenceIds: string[];
  limitation?: string;
}

export interface InvestigationResult {
  question: string;
  findings: InvestigativeFinding[];
  conclusion: string;
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function evidenceForMemory(graph: MemoryGraph, memoryId: string): MemoryEvidence[] {
  return graph.memories.find((memory) => memory.id === memoryId)?.evidence ?? [];
}

function sourceForEvidence(graph: MemoryGraph, evidence: MemoryEvidence): MemorySource | undefined {
  return graph.sources.find((source) => source.id === evidence.sourceId);
}

/**
 * Detective-style retrieval without detective-style speculation.
 * It can connect facts across sources, but every conclusion must identify its evidence
 * and explicitly expose what the evidence cannot establish.
 */
export function investigate(
  graph: MemoryGraph,
  question: string,
  memoryIds: readonly string[],
): InvestigationResult {
  const findings: InvestigativeFinding[] = [];

  for (const memoryId of memoryIds) {
    const memory = graph.memories.find((candidate) => candidate.id === memoryId);
    if (!memory) continue;

    const evidence = evidenceForMemory(graph, memoryId);
    const sources = evidence
      .map((item) => sourceForEvidence(graph, item))
      .filter((source): source is MemorySource => source !== undefined);

    if (evidence.length === 0) continue;

    const direct = evidence.filter((item) => item.confidence >= 0.9);
    const strength: FactStrength = direct.length > 0
      ? (evidence.length > 1 ? "corroborated" : "direct")
      : "partial";

    findings.push({
      claim: memory.summary,
      strength,
      confidence: memory.confidence,
      sourceIds: sources.map((source) => source.id),
      evidenceIds: evidence.map((item) => item.id),
      limitation: strength === "partial"
        ? "The available evidence supports this finding only partially; no unsupported details should be added."
        : undefined,
    });
  }

  if (findings.length === 0) {
    return {
      question,
      findings: [],
      conclusion: "I couldn't find enough evidence to answer that.",
    };
  }

  const strongest = findings.sort((a, b) => b.confidence - a.confidence)[0]!;
  const sourceCount = new Set(findings.flatMap((finding) => finding.sourceIds)).size;

  return {
    question,
    findings,
    conclusion: sourceCount > 1
      ? `I found evidence across ${sourceCount} sources. ${strongest.claim}`
      : strongest.claim,
  };
}

export function isSupportedByEvidence(
  finding: InvestigativeFinding,
  requiredSourceKinds: readonly string[],
  graph: MemoryGraph,
): boolean {
  const kinds = finding.sourceIds
    .map((id) => graph.sources.find((source) => source.id === id)?.kind)
    .filter((kind): kind is string => kind !== undefined);
  return requiredSourceKinds.length === 0 || requiredSourceKinds.some((kind) => kinds.includes(kind));
}

export function questionMatchesFinding(question: string, finding: InvestigativeFinding): boolean {
  const terms = normalize(question).split(/\s+/).filter((term) => term.length > 2);
  const claim = normalize(finding.claim);
  return terms.some((term) => claim.includes(term));
}
