import assert from "node:assert/strict";
import { buildLifeManualDocument } from "./life-manual.ts";
import type { ContinuityPillarCoverage, ContinuitySnapshot } from "./continuity";
import type { RecallMemoryRecord } from "./recall";
import type { SuccessorAction } from "./successor-action-types";

const continuity: ContinuitySnapshot = {
  totalMemories: 1,
  domains: ["family", "business"],
  gaps: [{ domain: "digital", severity: "critical", title: "Digital continuity is unclear", reason: "Access instructions are missing." }],
  readiness: 65,
};

const pillars: ContinuityPillarCoverage[] = [
  { pillarKey: "digital_life", coverageScore: 20, status: "needs_attention", matchedMemories: 0 },
  { pillarKey: "financial_assets", coverageScore: 80, status: "ready", matchedMemories: 3 },
  { pillarKey: "household_property", coverageScore: 60, status: "in_progress", matchedMemories: 1 },
  { pillarKey: "health_medical", coverageScore: 70, status: "in_progress", matchedMemories: 2 },
  { pillarKey: "vital_records", coverageScore: 50, status: "in_progress", matchedMemories: 1 },
  { pillarKey: "business_continuity", coverageScore: 90, status: "ready", matchedMemories: 4 },
  { pillarKey: "legacy_wishes", coverageScore: 75, status: "in_progress", matchedMemories: 2 },
];

const memories: RecallMemoryRecord[] = [{
  id: "memory-1",
  context: "business",
  title: "Vendor decision",
  narrative: "Keep the primary vendor relationship active.",
  evidenceClass: "known",
  confidence: 1,
  sourceRefs: ["source-1"],
  people: [],
  createdAt: "2026-09-11T00:00:00.000Z",
  provenanceComplete: true,
}];

const actions: SuccessorAction[] = [
  {
    id: "action-1",
    title: "Confirm vendor contact",
    domain: "business",
    instruction: "Contact the primary vendor and confirm the account status.",
    state: "open",
    evidenceRequired: true,
    evidenceConfirmed: false,
    dependencies: [],
    notes: "Use the latest contact record.",
  },
  {
    id: "action-2",
    title: "Prepare vendor handoff",
    domain: "business",
    instruction: "Prepare the vendor handoff package.",
    state: "open",
    evidenceRequired: false,
    evidenceConfirmed: false,
    dependencies: ["action-1"],
  },
  {
    id: "action-3",
    title: "Correct invalid completion",
    domain: "business",
    instruction: "Review and correct the completion record.",
    state: "complete",
    evidenceRequired: true,
    evidenceConfirmed: false,
    dependencies: [],
  },
];

const document = buildLifeManualDocument({
  continuity,
  pillars,
  actions,
  memories,
  generatedAt: "2026-09-11T00:00:00.000Z",
  revision: "2026-09-11",
});

assert.equal(document.title, "Life Manual");
assert.equal(document.readiness.score, 65);
assert.equal(document.readiness.status, "in_progress");
assert.equal(document.pillars.length, 7);
assert.equal(document.pillars[4]?.title, "Vital Records");
assert.equal(document.actions[0]?.evidenceConfirmed, false);
assert.ok(document.openIssues.some((issue) => issue.includes("Digital continuity")));
assert.ok(document.openIssues.some((issue) => issue.includes("evidence required")));
assert.ok(document.openIssues.some((issue) => issue.includes("completed status needs correction")));
assert.ok(document.openIssues.some((issue) => issue.includes("waiting on Prepare vendor handoff")));
assert.equal(document.importantDecisions[0], "Keep the primary vendor relationship active.");
assert.equal(document.memories[0]?.provenanceComplete, true);
assert.equal(document.handoff.ready, false);
assert.equal(document.handoff.evidenceOutstanding, 1);
assert.equal(document.handoff.invalidCompleted, 1);
assert.equal(document.handoff.unresolvedDependencies, 1);
assert.equal(document.handoff.nextAction?.actionId, "action-1");
assert.equal(document.handoff.nextAction?.reason, "unblocks_downstream_work");
assert.ok(document.first72Hours[0]?.includes("Contact the primary vendor"));

console.log("Life Manual tests passed.");
