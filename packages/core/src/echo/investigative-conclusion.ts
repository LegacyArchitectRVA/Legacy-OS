import { rankEvidence, type EvidenceCandidate, type RankedEvidence } from "./evidence-ranking.js";
import type { FactStrength } from "./investigator.js";

export interface ConclusionInput {
  claim: string;
  evidence: EvidenceCandidate[];
  limitation?: string;
}

export interface FactualConclusion {
  claim: string;
  strength: FactStrength;
  evidence: RankedEvidence[];
  explanation: string;
  limitation?: string;
}

export function buildFactualConclusion(input: ConclusionInput): FactualConclusion {
  const evidence = rankEvidence(input.evidence);
  const primary = evidence.filter((item) => item.reliability === "primary");
  const strong = evidence.filter((item) => item.reliability === "strong");

  let strength: FactStrength = "partial";
  if (primary.length > 0 && evidence.length > 1) strength = "corroborated";
  else if (primary.length > 0) strength = "direct";

  const explanation = evidence.length === 0
    ? "No supporting evidence was found."
    : primary.length > 0
      ? `Supported by ${primary.length} primary source${primary.length === 1 ? "" : "s"}${strong.length ? ` and ${strong.length} strong source${strong.length === 1 ? "" : "s"}` : ""}.`
      : `Supported by ${evidence.length} source${evidence.length === 1 ? "" : "s"}, but none qualify as primary evidence.`;

  return {
    claim: input.claim,
    strength,
    evidence,
    explanation,
    limitation: input.limitation,
  };
}
