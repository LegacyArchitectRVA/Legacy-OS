import assert from "node:assert/strict";
import { buildSuccessorHandoff } from "./successor-handoff.ts";

const incompleteEvidence = {
  id: "evidence",
  title: "Evidence task",
  domain: "Financial & Assets",
  instruction: "Confirm the record.",
  state: "complete" as const,
  evidenceRequired: true,
  evidenceConfirmed: false,
  dependencies: [],
};

const result = buildSuccessorHandoff([incompleteEvidence]);
assert.equal(result.ready, false);
assert.equal(result.completionPercent, 0);
assert.deepEqual(result.completedActions, []);
assert.deepEqual(result.invalidCompletedActions.map((action) => action.id), ["evidence"]);
assert.equal(result.actionReadiness[0].reason, "completion_invalid");

console.log("Successor completion integrity regression passed.");
