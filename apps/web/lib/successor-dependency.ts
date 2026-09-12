export interface SuccessorDependency {
  actionId: string;
  dependsOn: string[];
  blocks: string[];
  reason: string;
}

export interface SuccessorDependencyGraph {
  dependencies: SuccessorDependency[];
  blockedActionIds: string[];
  readyActionIds: string[];
}

type DependencyAction = {
  id: string;
  dependencyIds?: string[];
  status?: string;
  evidenceRequired?: boolean;
  evidenceConfirmed?: boolean;
};

function assertValidGraph(actions: DependencyAction[], byId: Map<string, DependencyAction>): void {
  for (const action of actions) {
    const dependencies = action.dependencyIds ?? [];
    if (new Set(dependencies).size !== dependencies.length) throw new Error(`Duplicate successor action dependency: ${action.id}`);
    if (dependencies.includes(action.id)) throw new Error(`Successor action cannot depend on itself: ${action.id}`);
    for (const dependencyId of dependencies) {
      if (!byId.has(dependencyId)) throw new Error(`Unknown successor action dependency: ${dependencyId}`);
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) throw new Error(`Circular successor action dependency: ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependencyId of byId.get(id)?.dependencyIds ?? []) visit(dependencyId);
    visiting.delete(id);
    visited.add(id);
  };
  for (const action of actions) visit(action.id);
}

export function buildSuccessorDependencyGraph(actions: DependencyAction[]): SuccessorDependencyGraph {
  const byId = new Map<string, DependencyAction>();
  for (const action of actions) {
    if (!action.id.trim() || byId.has(action.id)) throw new Error(`Duplicate or empty successor action id: ${action.id || "(empty)"}`);
    byId.set(action.id, action);
  }
  assertValidGraph(actions, byId);
  const dependencies = actions.map((action) => {
    const dependsOn = [...(action.dependencyIds ?? [])];
    const blocks = actions.filter((candidate) => (candidate.dependencyIds ?? []).includes(action.id)).map((candidate) => candidate.id);
    return { actionId: action.id, dependsOn, blocks, reason: dependsOn.length ? "This action depends on another successor action." : "No explicit action dependency is recorded." };
  });
  const blockedActionIds = actions.filter((action) => action.status === "blocked" || (action.dependencyIds ?? []).some((id) => byId.get(id)?.status !== "complete") || (action.evidenceRequired === true && action.evidenceConfirmed !== true)).map((action) => action.id);
  const blocked = new Set(blockedActionIds);
  const readyActionIds = actions.filter((action) => !blocked.has(action.id) && action.status !== "complete").map((action) => action.id);
  return { dependencies, blockedActionIds, readyActionIds };
}
