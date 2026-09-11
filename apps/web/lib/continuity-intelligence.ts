import type { ContinuityPillarKey, ContinuityPillarCoverage } from "./continuity";
import type { RecallMemoryRecord } from "./recall";

export type ContinuityRiskLevel = "critical" | "elevated" | "watch" | "low";

export interface ContinuityRisk {
  pillarKey: ContinuityPillarKey;
  level: ContinuityRiskLevel;
  score: number;
  reason: string;
  nextAction: string;
}

export interface ContinuityIntelligence {
  overallRisk: ContinuityRiskLevel;
  confidenceScore: number;
  freshnessScore: number;
  evidenceQualityScore: number;
  staleEvidenceCount: number;
  topRisks: ContinuityRisk[];
  nextBestAction: string | null;
}

const EVIDENCE_STRENGTH: Record<RecallMemoryRecord["evidenceClass"], number> = {
  known: 1,
  reconstructed: 0.8,
  inferred: 0.6,
  unknown: 0.25,
};

const PILLAR_LABELS: Record<ContinuityPillarKey, string> = {
  digital_life: "Digital Life",
  financial_assets: "Financial & Assets",
  household_property: "Household & Property",
  health_medical: "Health & Medical",
  vital_records: "Vital Records",
  business_continuity: "Business Continuity",
  legacy_wishes: "Legacy & Wishes",
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ageDays(date: string, nowMs: number) {
  const parsed = Date.parse(date);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, (nowMs - parsed) / 86_400_000);
}

function riskLevel(score: number): ContinuityRiskLevel {
  if (score >= 75) return "critical";
  if (score >= 50) return "elevated";
  if (score >= 25) return "watch";
  return "low";
}

export function buildContinuityIntelligence(
  pillars: ContinuityPillarCoverage[],
  memories: RecallMemoryRecord[],
  now = new Date(),
): ContinuityIntelligence {
  const nowMs = now.getTime();
  const datedMemories = memories
    .map((memory) => ({ memory, age: ageDays(memory.occurredAt ?? memory.createdAt, nowMs) }))
    .filter((item): item is { memory: RecallMemoryRecord; age: number } => item.age !== null);

  const staleEvidenceCount = datedMemories.filter((item) => item.age > 365).length;
  const freshnessScore = datedMemories.length
    ? clamp(datedMemories.reduce((sum, item) => sum + Math.max(0, 100 - (item.age / 365) * 100), 0) / datedMemories.length)
    : 0;

  const evidenceQualityScore = memories.length
    ? clamp((memories.reduce((sum, memory) => {
        const confidence = memory.confidence ?? 0.5;
        const strength = EVIDENCE_STRENGTH[memory.evidenceClass];
        const provenance = memory.provenanceComplete ? 1 : 0.55;
        return sum + confidence * strength * provenance * 100;
      }, 0) / memories.length))
    : 0;

  const confidenceScore = clamp(evidenceQualityScore * 0.7 + freshnessScore * 0.3);
  const topRisks = [...pillars]
    .map((pillar) => {
      const coverageRisk = 100 - pillar.coverageScore;
      const sparseEvidencePenalty = pillar.matchedMemories === 0 ? 20 : pillar.matchedMemories < 2 ? 10 : 0;
      const score = clamp(coverageRisk * 0.85 + sparseEvidencePenalty);
      const level = riskLevel(score);
      const label = PILLAR_LABELS[pillar.pillarKey];
      return {
        pillarKey: pillar.pillarKey,
        level,
        score,
        reason: pillar.matchedMemories === 0
          ? `${label} has no continuity evidence yet.`
          : `${label} is only ${pillar.coverageScore}% covered with ${pillar.matchedMemories} evidence item${pillar.matchedMemories === 1 ? "" : "s"}.`,
        nextAction: pillar.matchedMemories === 0
          ? `Add the first verified ${label} record.`
          : `Review ${label} evidence and close the highest-impact gap.`,
      } satisfies ContinuityRisk;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const overallRiskScore = topRisks.length ? topRisks.reduce((sum, risk) => sum + risk.score, 0) / topRisks.length : 100;
  const overallRisk = riskLevel(overallRiskScore);
  return {
    overallRisk,
    confidenceScore,
    freshnessScore,
    evidenceQualityScore,
    staleEvidenceCount,
    topRisks,
    nextBestAction: topRisks[0]?.nextAction ?? null,
  };
}
