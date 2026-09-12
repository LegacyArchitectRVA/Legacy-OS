import assert from "node:assert/strict";
import { buildSuccessorHandoff } from "./successor-handoff.ts";
import { buildSuccessorHandoffReport } from "./successor-handoff-report.ts";
import type { SuccessorAction } from "./successor-action-types";

const action = (overrides: Partial<SuccessorAction> = {}): SuccessorAction => ({
  id: "a",
  title: "Foundation task",
  domain: "Financial & Assets",
  instruction: "Verify the foundation record.",
  state: "open",
  evidenceRequired: false,
  dependencies: [],
  ...overrides,
});

const dependencyBlocked = [action(), action({ id: "b", title: "Downstream task", dependencies: ["a"] })];
const dependencyReport = buildSuccessorHandoffReport(buildSuccessorHandoff(dependencyBlocked), dependencyBlocked);
assert.equal(dependencyReport.blockers[0]?.reason, "dependency");
assert.deepEqual(dependencyReport.blockers[0]?.dependencies.map((item) => item.id), ["a"]);
assert.deepEqual(dependencyReport.nextActions.map((item) => item.id), ["a"]);

const explicitlyBlocked = [action({ id: "a", state: "blocked", evidenceRequired: true })];
const blockedReport = buildSuccessorHandoffReport(buildSuccessorHandoff(explicitlyBlocked), explicitlyBlocked);
assert.equal(blockedReport.blockers[0]?.reason, "blocked");
assert.equal(blockedReport.blockers[0]?.dependencies.length, 0);

const evidenceBlocked = [action({ id: "a", evidenceRequired: true, evidenceConfirmed: false })];
const evidenceReport = buildSuccessorHandoffReport(buildSuccessorHandoff(evidenceBlocked), evidenceBlocked);
assert.equal(evidenceReport.blockers[0]?.reason, "evidence");
assert.equal(evidenceReport.nextActions.length, 0);

const executableInProgress = [action({ id: "a", state: "in_progress" })];
const inProgressReport = buildSuccessorHandoffReport(buildSuccessorHandoff(executableInProgress), executableInProgress);
assert.deepEqual(inProgressReport.nextActions.map((item) => item.id), ["a"]);

const blockedInProgress = [action({ id: "a", state: "in_progress" }), action({ id: "b", dependencies: ["a"] })];
const blockedProgressReport = buildSuccessorHandoffReport(buildSuccessorHandoff(blockedInProgress), blockedInProgress);
assert.deepEqual(blockedProgressReport.nextActions.map((item) => item.id), ["a"]);

console.log("Successor handoff report tests passed.");
