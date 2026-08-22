import type { SuccessorAction } from "./successor-action-types";
import { buildSuccessorDependencyGraph } from "./successor-dependency";

export interface SuccessorWorkspace { actions: SuccessorAction[]; ready: SuccessorAction[]; blocked: SuccessorAction[]; completed: SuccessorAction[]; dependencies: ReturnType<typeof buildSuccessorDependencyGraph>; }

export function buildSuccessorWorkspace(actions: SuccessorAction[]): SuccessorWorkspace {
  const dependencies = buildSuccessorDependencyGraph(actions.map((action) => ({ id: action.id, dependencyIds: action.dependencies, status: action.state, evidenceRequired: action.evidenceRequired, evidenceConfirmed: action.evidenceConfirmed })));
  const readyIds = new Set(dependencies.readyActionIds);
  const blockedIds = new Set(dependencies.blockedActionIds);
  return { actions, ready: actions.filter((action) => readyIds.has(action.id)), blocked: actions.filter((action) => blockedIds.has(action.id)), completed: actions.filter((action) => action.state === "complete"), dependencies };
}
