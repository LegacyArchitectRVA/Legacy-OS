import assert from "node:assert/strict";
import { buildSuccessorDependencyGraph } from "../lib/successor-dependency.ts";
import { summarizeSuccessorActions } from "../lib/successor-workspace-model.ts";

const actions = [
  { id: "a", state: "complete", evidenceRequired: false, dependencies: [] },
  { id: "b", state: "open", evidenceRequired: false, dependencies: ["a"] },
  { id: "c", state: "open", evidenceRequired: true, evidenceConfirmed: false, dependencies: [] },
  { id: "d", state: "open", evidenceRequired: false, dependencies: ["c"] },
  { id: "e", state: "in_progress", evidenceRequired: true, evidenceConfirmed: true, dependencies: [] },
];

const graph = buildSuccessorDependencyGraph(actions.map(({ id, dependencies, state, evidenceRequired, evidenceConfirmed }) => ({ id, dependencyIds: dependencies, status: state, evidenceRequired, evidenceConfirmed })));
assert.deepEqual(graph.blockedActionIds.sort(), ["c", "d"]);
assert.deepEqual(graph.readyActionIds, ["b", "e"]);

const summary = summarizeSuccessorActions(actions);
assert.deepEqual(summary, {
  total: 5,
  ready: 2,
  blocked: 0,
  inProgress: 1,
  complete: 1,
  evidenceRequired: 2,
  evidenceConfirmed: 1,
  evidenceGaps: 1,
});

console.log("Successor workspace regression checks passed.");
