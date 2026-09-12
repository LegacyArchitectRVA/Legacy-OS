import assert from "node:assert/strict";
import { buildSuccessorHandoff } from "./successor-handoff.ts";
import type { SuccessorAction } from "./successor-action-types";

const baseAction: SuccessorAction = {
  id: "a",
  title: "Verify account inventory",
  domain: "Financial & Assets",
  instruction: "Confirm the account inventory and its source.",
  state: "open",
  evidenceRequired: false,
  dependencies: [],
};

const blockedByDependency: SuccessorAction = {
  id: "b",
  title: "Review dependent account",
  domain: "Financial & Assets",
  instruction: "Review the account after the inventory is verified.",
  state: "open",
  evidenceRequired: false,
  dependencies: ["a"],
};

const evidenceRequired: SuccessorAction = {
  id: "c",
  title: "Confirm property record",
  domain: "Household & Property",
  instruction: "Confirm the record and document where it was verified.",
  state: "open",
  evidenceRequired: true,
  evidenceConfirmed: false,
  dependencies: [],
};

const ready = buildSuccessorHandoff([
  { ...baseAction, state: "complete", evidenceConfirmed: true },
  { ...blockedByDependency, state: "open", dependencies: ["a"] },
]);
assert.equal(ready.ready, true);
assert.deepEqual(ready.unresolvedDependencies, []);
assert.equal(ready.actionReadiness.find((item) => item.actionId === "b")?.reason, "ready");
assert.equal(ready.actionReadiness.find((item) => item.actionId === "b")?.title, "Review dependent account");
assert.deepEqual(ready.actionReadiness.find((item) => item.actionId === "b")?.dependencyDetails, [{ actionId: "a", title: "Verify account inventory", state: "complete", resolved: true }]);

const dependencyBlocked = buildSuccessorHandoff([
  { ...baseAction, state: "open" },
  { ...blockedByDependency, state: "open" },
]);
assert.equal(dependencyBlocked.ready, false);
assert.deepEqual(dependencyBlocked.unresolvedDependencies, [{ actionId: "b", dependencyId: "a" }]);
assert.equal(dependencyBlocked.actionReadiness.find((item) => item.actionId === "b")?.reason, "dependency_blocked");
assert.deepEqual(dependencyBlocked.actionReadiness.find((item) => item.actionId === "b")?.dependencyDetails, [{ actionId: "a", title: "Verify account inventory", state: "open", resolved: false }]);

const evidenceBlocked = buildSuccessorHandoff([evidenceRequired]);
assert.equal(evidenceBlocked.ready, false);
assert.deepEqual(evidenceBlocked.evidenceOutstanding.map((action) => action.id), ["c"]);
assert.equal(evidenceBlocked.actionReadiness[0].reason, "evidence_required");
assert.deepEqual(evidenceBlocked.nextAction, { actionId: "c", reason: "resolve_evidence_gap", downstreamCount: 0 });

const evidenceConfirmed = buildSuccessorHandoff([{ ...evidenceRequired, evidenceConfirmed: true }]);
assert.equal(evidenceConfirmed.ready, true);
assert.equal(evidenceConfirmed.evidenceOutstanding.length, 0);
assert.equal(evidenceConfirmed.actionReadiness[0].reason, "ready");

const explicitlyBlocked = buildSuccessorHandoff([{ ...baseAction, state: "blocked" }]);
assert.equal(explicitlyBlocked.ready, false);
assert.deepEqual(explicitlyBlocked.blockedActions.map((action) => action.id), ["a"]);
assert.equal(explicitlyBlocked.actionReadiness[0].ready, false);
assert.equal(explicitlyBlocked.actionReadiness[0].reason, "explicitly_blocked");

const completed = buildSuccessorHandoff([{ ...baseAction, state: "complete", evidenceConfirmed: true }]);
assert.equal(completed.actionReadiness[0].reason, "completed");
assert.deepEqual(completed.completedActions.map((action) => action.id), ["a"]);
assert.equal(completed.invalidCompletedActions.length, 0);
assert.equal(completed.nextAction, null);

const invalidCompletedEvidence = buildSuccessorHandoff([{ ...evidenceRequired, state: "complete", evidenceConfirmed: false }]);
assert.equal(invalidCompletedEvidence.ready, false);
assert.deepEqual(invalidCompletedEvidence.completedActions, []);
assert.deepEqual(invalidCompletedEvidence.invalidCompletedActions.map((action) => action.id), ["c"]);
assert.equal(invalidCompletedEvidence.completionPercent, 0);
assert.equal(invalidCompletedEvidence.actionReadiness[0].reason, "completion_invalid");
assert.equal(invalidCompletedEvidence.actionReadiness[0].evidenceConfirmed, false);
assert.equal(invalidCompletedEvidence.nextAction, null);

const invalidCompletedDependency = buildSuccessorHandoff([
  { ...baseAction, state: "open" },
  { ...blockedByDependency, state: "complete", evidenceConfirmed: true },
]);
assert.equal(invalidCompletedDependency.ready, false);
assert.deepEqual(invalidCompletedDependency.invalidCompletedActions.map((action) => action.id), ["b"]);
assert.equal(invalidCompletedDependency.completionPercent, 0);
assert.deepEqual(invalidCompletedDependency.actionReadiness.find((item) => item.actionId === "b")?.unresolvedDependencies, ["a"]);
assert.equal(invalidCompletedDependency.actionReadiness.find((item) => item.actionId === "b")?.reason, "completion_invalid");

const prioritized = buildSuccessorHandoff([
  { ...baseAction, id: "a", title: "Foundation task" },
  { ...baseAction, id: "b", title: "Downstream task 1", dependencies: ["a"] },
  { ...baseAction, id: "c", title: "Downstream task 2", dependencies: ["a"] },
  { ...baseAction, id: "d", title: "Blocked alternative", state: "blocked" },
]);
assert.deepEqual(prioritized.nextAction, { actionId: "a", reason: "unblocks_downstream_work", downstreamCount: 2 });

const inProgressFallback = buildSuccessorHandoff([{ ...baseAction, state: "in_progress" }]);
assert.deepEqual(inProgressFallback.nextAction, { actionId: "a", reason: "continue_in_progress", downstreamCount: 0 });

const noExecutableAction = buildSuccessorHandoff([
  { ...baseAction, state: "blocked" },
  { ...evidenceRequired },
]);
assert.deepEqual(noExecutableAction.nextAction, { actionId: "c", reason: "resolve_evidence_gap", downstreamCount: 0 });

const missingDependency = buildSuccessorHandoff([{ ...blockedByDependency, dependencies: ["missing"] }]);
assert.deepEqual(missingDependency.actionReadiness[0].dependencyDetails, [{ actionId: "missing", title: "Missing action", state: "missing", resolved: false }]);
assert.equal(missingDependency.actionReadiness[0].reason, "dependency_blocked");

console.log("Successor handoff tests passed.");
