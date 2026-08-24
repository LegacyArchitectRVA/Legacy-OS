import type { SuccessorAction } from "./successor-action-types";

export interface SuccessorHandoff {
  ready: boolean;
  completionPercent: number;
  openActions: SuccessorAction[];
  blockedActions: SuccessorAction[];
  inProgressActions: SuccessorAction[];
  completedActions: SuccessorAction[];
  unresolvedDependencies: Array<{ actionId: string; dependencyId: string }>;
  evidenceOutstanding: SuccessorAction[];
}

export function buildSuccessorHandoff(actions: SuccessorAction[]): SuccessorHandoff {
  const byId = new Map(actions.map((action) => [action.id, action]));
  const unresolvedDependencies = actions.flatMap((action) => action.dependencies.filter((id) => byId.get(id)?.state !== "complete").map((dependencyId) => ({ actionId: action.id, dependencyId })));
  const evidenceOutstanding = actions.filter((action) => action.evidenceRequired && !action.evidenceConfirmed && action.state !== "complete");
  const completedActions = actions.filter((action) => action.state === "complete");
  return {
    ready: unresolvedDependencies.length === 0 && evidenceOutstanding.length === 0,
    completionPercent: actions.length ? Math.round((completedActions.length / actions.length) * 100) : 0,
    openActions: actions.filter((action) => action.state === "open"),
    blockedActions: actions.filter((action) => action.state === "blocked"),
    inProgressActions: actions.filter((action) => action.state === "in_progress"),
    completedActions,
    unresolvedDependencies,
    evidenceOutstanding,
  };
}
