import assert from "node:assert/strict";
import { buildContinuityIntelligence } from "./continuity-intelligence.ts";
import type { ContinuityPillarCoverage } from "./continuity";
import type { RecallMemoryRecord } from "./recall";

const pillars: ContinuityPillarCoverage[] = [
  { pillarKey: "digital_life", name: "Digital Life", coverageScore: 20, status: "needs_attention", matchedMemories: 0 },
  { pillarKey: "financial_assets", name: "Financial & Assets", coverageScore: 80, status: "ready", matchedMemories: 3 },
  { pillarKey: "household_property", name: "Household & Property", coverageScore: 60, status: "in_progress", matchedMemories: 1 },
  { pillarKey: "health_medical", name: "Health & Medical", coverageScore: 70, status: "in_progress", matchedMemories: 2 },
  { pillarKey: "vital_records", name: "Vital Records", coverageScore: 50, status: "in_progress", matchedMemories: 1 },
  { pillarKey: "business_continuity", name: "Business Continuity", coverageScore: 90, status: "ready", matchedMemories: 4 },
  { pillarKey: "legacy_wishes", name: "Legacy & Wishes", coverageScore: 75, status: "ready", matchedMemories: 2 },
];

function memory(overrides: Partial<RecallMemoryRecord> = {}): RecallMemoryRecord {
  return {
    id: "memory-1",
    context: "personal",
    title: "Verified record",
    narrative: "A verified continuity record.",
    evidenceClass: "known",
    confidence: 1,
    sourceRefs: ["source-1"],
    people: [],
    createdAt: "2026-09-01T00:00:00.000Z",
    occurredAt: "2026-09-01T00:00:00.000Z",
    provenanceComplete: true,
    ...overrides,
  };
}

const intelligence = buildContinuityIntelligence(pillars, [memory()], new Date("2026-09-11T00:00:00.000Z"));
assert.equal(intelligence.topRisks[0]?.pillarKey, "digital_life");
assert.equal(intelligence.topRisks[0]?.level, "critical");
assert.equal(intelligence.staleEvidenceCount, 0);
assert.ok(intelligence.confidenceScore > 0);
assert.ok(intelligence.nextBestAction);

const stale = buildContinuityIntelligence(
  pillars,
  [memory({ occurredAt: "2024-01-01T00:00:00.000Z", createdAt: "2024-01-01T00:00:00.000Z" })],
  new Date("2026-09-11T00:00:00.000Z"),
);
assert.equal(stale.staleEvidenceCount, 1);
assert.ok(stale.freshnessScore < 100);

const weak = buildContinuityIntelligence(
  pillars,
  [memory({ evidenceClass: "unknown", confidence: 0, sourceRefs: [], provenanceComplete: false })],
  new Date("2026-09-11T00:00:00.000Z"),
);
assert.ok(weak.evidenceQualityScore < intelligence.evidenceQualityScore);
console.log("Continuity intelligence tests passed.");
