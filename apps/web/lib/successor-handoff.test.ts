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

const dependencyBlocked = buildSuccessorHandoff([
  { ...baseAction, state: "open" },
  { ...blockedByDependency, state: "open" },
]);
assert.equal(dependencyBlocked.ready, false);
assert.deepEqual(dependencyBlocked.unresolvedDependencies, [{ actionId: "b", dependencyId: "a" }]);

const evidenceBlocked = buildSuccessorHandoff([evidenceRequired]);
assert.equal(evidenceBlocked.ready, false);
assert.deepEqual(evidenceBlocked.evidenceOutstanding.map((action) => action.id), ["c"]);

const evidenceConfirmed = buildSuccessorHandoff([{ ...evidenceRequired, evidenceConfirmed: true }]);
assert.equal(evidenceConfirmed.ready, true);
assert.equal(evidenceConfirmed.evidenceOutstanding.length, 0);

const explicitlyBlocked = buildSuccessorHandoff([{ ...baseAction, state: "blocked" }]);
assert.equal(explicitlyBlocked.ready, false);
assert.deepEqual(explicitlyBlocked.blockedActions.map((action) => action.id), ["a"]);
assert.equal(explicitlyBlocked.actionReadiness[0].ready, false);

console.log("Successor handoff tests passed.");
