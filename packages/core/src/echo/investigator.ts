import type { MemoryEvidence, MemoryGraph, MemorySource } from "../memory/model.js";

export type FactStrength = "direct" | "partial" | "corroborated" | "contradictory";

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
  contradictions: Contradiction[];
}

export interface Contradiction {
  claimA: string;
  claimB: string;
  sourceIds: string[];
  reason: string;
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

function contradictionPair(a: string, b: string): boolean {
  const left = normalize(a);
  const right = normalize(b);
  return (
    (left.includes(" ate ") && right.includes(" did not eat ")) ||
    (left.includes(" did not eat ") && right.includes(" ate ")) ||
    (left.includes(" was at ") && right.includes(" was not at ")) ||
    (left.includes(" was not at ") && right.includes(" was at "))
  );
}

export function detectContradictions(findings: readonly InvestigativeFinding[]): Contradiction[] {
  const contradictions: Contradiction[] = [];
  for (let i = 0; i < findings.length; i += 1) {
    for (let j = i + 1; j < findings.length; j += 1) {
      const a = findings[i]!;
      const b = findings[j]!;
      if (!contradictionPair(a.claim, b.claim)) continue;
      contradictions.push({
        claimA: a.claim,
        claimB: b.claim,
        sourceIds: [...new Set([...a.sourceIds, ...b.sourceIds])],
        reason: "The available sources make incompatible claims; Echo will not choose between them without stronger evidence.",
      });
    }
  }
  return contradictions;
}

/** Detective-style retrieval without detective-style speculation. */
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
    return { question, findings: [], conclusion: "I couldn't find enough evidence to answer that.", contradictions: [] };
  }

  const contradictions = detectContradictions(findings);
  const uniqueSourceIds = new Set(findings.flatMap((finding) => finding.sourceIds));
  const strongest = [...findings].sort((a, b) => b.confidence - a.confidence)[0]!;
  const sourceKinds = [...uniqueSourceIds]
    .map((id) => graph.sources.find((source) => source.id === id)?.kind)
    .filter((kind): kind is MemorySource["kind"] => kind !== undefined);

  if (contradictions.length > 0) {
    return {
      question,
      findings: findings.map((finding) => ({ ...finding, strength: "contradictory" })),
      conclusion: "I found conflicting evidence, so I can't reliably choose one version of events.",
      contradictions,
    };
  }

  return {
    question,
    findings: findings.sort((a, b) => b.confidence - a.confidence),
    conclusion: uniqueSourceIds.size > 1
      ? `I found evidence across ${uniqueSourceIds.size} sources (${[...new Set(sourceKinds)].join(", ")}). ${strongest.claim}`
      : strongest.claim,
    contradictions: [],
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
