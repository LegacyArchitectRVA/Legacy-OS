export interface SuccessorDependency { actionId: string; dependsOn: string[]; blocks: string[]; reason: string; }
export interface SuccessorDependencyGraph { dependencies: SuccessorDependency[]; blockedActionIds: string[]; readyActionIds: string[]; }
export function buildSuccessorDependencyGraph(actions: Array<{ id: string; dependencyIds?: string[]; status?: string; evidenceRequired?: boolean; evidenceConfirmed?: boolean }>): SuccessorDependencyGraph {
  const byId = new Map(actions.map((action) => [action.id, action]));
  const dependencies = actions.map((action) => { const dependsOn = (action.dependencyIds ?? []).filter((id) => byId.has(id)); const blocks = actions.filter((candidate) => (candidate.dependencyIds ?? []).includes(action.id)).map((candidate) => candidate.id); return { actionId: action.id, dependsOn, blocks, reason: dependsOn.length ? "This action depends on another successor action." : "No explicit action dependency is recorded." }; });
  const blockedActionIds = actions.filter((action) => (action.dependencyIds ?? []).some((id) => byId.get(id)?.status !== "complete") || (action.evidenceRequired && !action.evidenceConfirmed)).map((action) => action.id);
  const readyActionIds = actions.filter((action) => !blockedActionIds.includes(action.id) && action.status !== "complete").map((action) => action.id);
  return { dependencies, blockedActionIds, readyActionIds };
}
