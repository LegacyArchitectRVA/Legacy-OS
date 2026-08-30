export type EvidenceKind = "photo" | "video" | "audio" | "document" | "story" | "memory" | "relationship";
export type EvidenceConfidence = "verified" | "supported" | "reconstructed";

export type ReconstructionEvidence = {
  id: string;
  personId: string;
  kind: EvidenceKind;
  title: string;
  description?: string;
  sourceUri?: string;
  confidence: EvidenceConfidence;
  capturedAt?: string;
  createdBy?: string;
  tags: string[];
};

export function summarizeEvidence(evidence: ReconstructionEvidence[]) {
  const counts = evidence.reduce<Record<EvidenceKind, number>>((result, item) => {
    result[item.kind] = (result[item.kind] ?? 0) + 1;
    return result;
  }, {} as Record<EvidenceKind, number>);
  const verified = evidence.filter((item) => item.confidence === "verified").length;
  const supported = evidence.filter((item) => item.confidence === "supported").length;
  return { total: evidence.length, verified, supported, reconstructed: evidence.length - verified - supported, counts };
}
