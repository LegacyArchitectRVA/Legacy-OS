import type { SuccessorAction } from "./successor-action-types";
import { buildSuccessorDependencyGraph } from "./successor-dependency";

export interface SuccessorWorkspace {
  actions: SuccessorAction[];
  ready: SuccessorAction[];
  blocked: SuccessorAction[];
  completed: SuccessorAction[];
  dependencies: ReturnType<typeof buildSuccessorDependencyGraph>;
}

export function buildSuccessorWorkspace(actions: SuccessorAction[]): SuccessorWorkspace {
  const byId = new Map<string, SuccessorAction>();
  for (const action of actions) {
    if (!action.id.trim() || byId.has(action.id)) throw new Error(`Duplicate or empty successor action id: ${action.id || "(empty)"}`);
    byId.set(action.id, action);
  }
  for (const action of actions) {
    for (const dependencyId of action.dependencies) {
      if (dependencyId === action.id) throw new Error(`Successor action cannot depend on itself: ${action.id}`);
      if (!byId.has(dependencyId)) throw new Error(`Unknown successor action dependency: ${dependencyId}`);
    }
  }

  const dependencies = buildSuccessorDependencyGraph(actions.map((action) => ({
    id: action.id,
    dependencyIds: action.dependencies,
    status: action.state,
    evidenceRequired: action.evidenceRequired,
    evidenceConfirmed: action.evidenceConfirmed,
  })));
  const blockedIds = new Set(dependencies.blockedActionIds);
  const completed = actions.filter((action) => action.state === "complete");
  const blocked = actions.filter((action) => action.state !== "complete" && blockedIds.has(action.id));
  const ready = actions.filter((action) => action.state !== "complete" && !blockedIds.has(action.id));
  return { actions, ready, blocked, completed, dependencies };
}
