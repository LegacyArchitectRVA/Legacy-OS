export type EvidenceReliability = "primary" | "strong" | "supporting" | "weak";

export interface EvidenceCandidate {
  id: string;
  kind: string;
  confidence: number;
  original: boolean;
  timestamp?: string;
  sourceHash?: string;
}

export interface RankedEvidence extends EvidenceCandidate {
  reliability: EvidenceReliability;
  score: number;
  reasons: string[];
}

const KIND_WEIGHT: Record<string, number> = {
  receipt: 1,
  document: 0.95,
  bank: 0.9,
  email: 0.85,
  message: 0.85,
  photo: 0.8,
  video: 0.8,
  audio: 0.75,
  note: 0.65,
  social: 0.55,
};

export function rankEvidence(candidates: readonly EvidenceCandidate[]): RankedEvidence[] {
  return candidates
    .map((candidate) => {
      const reasons: string[] = [];
      let score = Math.max(0, Math.min(1, candidate.confidence));
      const kindWeight = KIND_WEIGHT[candidate.kind] ?? 0.5;
      score = score * 0.55 + kindWeight * 0.3;

      if (candidate.original) {
        score += 0.1;
        reasons.push("original-source");
      } else {
        reasons.push("non-original-source");
      }

      if (candidate.sourceHash) {
        score += 0.05;
        reasons.push("content-hash-present");
      }

      score = Math.min(1, score);
      const reliability: EvidenceReliability = score >= 0.9
        ? "primary"
        : score >= 0.75
          ? "strong"
          : score >= 0.55
            ? "supporting"
            : "weak";

      return { ...candidate, reliability, score, reasons };
    })
    .sort((a, b) => b.score - a.score);
}
