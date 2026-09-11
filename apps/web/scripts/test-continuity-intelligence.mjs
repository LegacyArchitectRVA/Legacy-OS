import assert from "node:assert/strict";
import { buildContinuityIntelligence } from "../lib/continuity-intelligence.ts";

const pillars = [
  { pillarKey: "digital_life", coverageScore: 90, status: "ready", matchedMemories: 4 },
  { pillarKey: "financial_assets", coverageScore: 35, status: "needs_attention", matchedMemories: 1 },
  { pillarKey: "household_property", coverageScore: 0, status: "needs_attention", matchedMemories: 0 },
  { pillarKey: "health_medical", coverageScore: 70, status: "in_progress", matchedMemories: 2 },
  { pillarKey: "vital_records", coverageScore: 80, status: "ready", matchedMemories: 3 },
  { pillarKey: "business_continuity", coverageScore: 55, status: "in_progress", matchedMemories: 2 },
  { pillarKey: "legacy_wishes", coverageScore: 45, status: "in_progress", matchedMemories: 1 },
];

const now = new Date("2026-09-11T00:00:00.000Z");
const intelligence = buildContinuityIntelligence(pillars, [
  {
    id: "1",
    context: "personal",
    title: "Verified records",
    narrative: "Current records with source documentation.",
    evidenceClass: "known",
    confidence: 1,
    sourceRefs: ["source-1"],
    people: [],
    occurredAt: "2026-09-01T00:00:00.000Z",
    createdAt: "2026-09-01T00:00:00.000Z",
    provenanceComplete: true,
  },
  {
    id: "2",
    context: "family",
    title: "Old record",
    narrative: "Needs verification.",
    evidenceClass: "inferred",
    confidence: 0.5,
    sourceRefs: [],
    people: [],
    occurredAt: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    provenanceComplete: false,
  },
], now);

assert.equal(intelligence.topRisks[0].pillarKey, "household_property");
assert.ok(intelligence.topRisks[0].score >= 75);
assert.ok(intelligence.staleEvidenceCount >= 1);
assert.ok(intelligence.freshnessScore < 100);
assert.ok(intelligence.evidenceQualityScore < 100);
assert.ok(intelligence.confidenceScore < 100);
assert.equal(typeof intelligence.nextBestAction, "string");
console.log("Continuity intelligence tests passed.");
