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
  { ...baseAction, state: "complete" },
  { ...blockedByDependency, state: "open", dependencies: ["a"] },
]);
assert.equal(ready.ready, true);
assert.deepEqual(ready.unresolvedDependencies, []);
assert.equal(ready.actionReadiness.find((item) => item.actionId === "b")?.reason, "ready");
assert.equal(ready.actionReadiness.find((item) => item.actionId === "b")?.title, "Review dependent account");

const dependencyBlocked = buildSuccessorHandoff([
  { ...baseAction, state: "open" },
  { ...blockedByDependency, state: "open" },
]);
assert.equal(dependencyBlocked.ready, false);
assert.deepEqual(dependencyBlocked.unresolvedDependencies, [{ actionId: "b", dependencyId: "a" }]);
assert.equal(dependencyBlocked.actionReadiness.find((item) => item.actionId === "b")?.reason, "dependency_blocked");

const evidenceBlocked = buildSuccessorHandoff([evidenceRequired]);
assert.equal(evidenceBlocked.ready, false);
assert.deepEqual(evidenceBlocked.evidenceOutstanding.map((action) => action.id), ["c"]);
assert.equal(evidenceBlocked.actionReadiness[0].reason, "evidence_required");

const evidenceConfirmed = buildSuccessorHandoff([{ ...evidenceRequired, evidenceConfirmed: true }]);
assert.equal(evidenceConfirmed.ready, true);
assert.equal(evidenceConfirmed.evidenceOutstanding.length, 0);
assert.equal(evidenceConfirmed.actionReadiness[0].reason, "ready");

const explicitlyBlocked = buildSuccessorHandoff([{ ...baseAction, state: "blocked" }]);
assert.equal(explicitlyBlocked.ready, false);
assert.deepEqual(explicitlyBlocked.blockedActions.map((action) => action.id), ["a"]);
assert.equal(explicitlyBlocked.actionReadiness[0].ready, false);
assert.equal(explicitlyBlocked.actionReadiness[0].reason, "explicitly_blocked");

const completed = buildSuccessorHandoff([{ ...baseAction, state: "complete" }]);
assert.equal(completed.actionReadiness[0].reason, "completed");
assert.equal(completed.nextAction, null);

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
assert.equal(noExecutableAction.nextAction, null);

console.log("Successor handoff tests passed.");
