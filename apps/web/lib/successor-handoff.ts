import type { SuccessorAction } from "./successor-action-types";

export interface SuccessorActionReadiness {
  actionId: string;
  ready: boolean;
  unresolvedDependencies: string[];
  evidenceRequired: boolean;
  evidenceConfirmed: boolean;
  reason: "ready" | "explicitly_blocked" | "dependency_blocked" | "evidence_required" | "completed";
}

export interface SuccessorHandoff {
  ready: boolean;
  completionPercent: number;
  openActions: SuccessorAction[];
  blockedActions: SuccessorAction[];
  inProgressActions: SuccessorAction[];
  completedActions: SuccessorAction[];
  unresolvedDependencies: Array<{ actionId: string; dependencyId: string }>;
  evidenceOutstanding: SuccessorAction[];
  actionReadiness: SuccessorActionReadiness[];
}

export function buildSuccessorHandoff(actions: SuccessorAction[]): SuccessorHandoff {
  const byId = new Map(actions.map((action) => [action.id, action]));
  const unresolvedDependencies = actions.flatMap((action) => action.dependencies.filter((id) => byId.get(id)?.state !== "complete").map((dependencyId) => ({ actionId: action.id, dependencyId })));
  const evidenceOutstanding = actions.filter((action) => action.evidenceRequired && !action.evidenceConfirmed && action.state !== "complete");
  const blockedActions = actions.filter((action) => action.state === "blocked");
  const completedActions = actions.filter((action) => action.state === "complete");
  const actionReadiness = actions.map((action) => {
    const dependencies = action.dependencies.filter((id) => byId.get(id)?.state !== "complete");
    const evidenceConfirmed = Boolean(action.evidenceConfirmed) || action.state === "complete";
    const ready = action.state === "open" && dependencies.length === 0 && (!action.evidenceRequired || evidenceConfirmed);
    const reason: SuccessorActionReadiness["reason"] = action.state === "complete"
      ? "completed"
      : action.state === "blocked"
        ? "explicitly_blocked"
        : dependencies.length > 0
          ? "dependency_blocked"
          : action.evidenceRequired && !evidenceConfirmed
            ? "evidence_required"
            : "ready";
    return { actionId: action.id, ready, unresolvedDependencies: dependencies, evidenceRequired: action.evidenceRequired, evidenceConfirmed, reason };
  });
  return {
    ready: blockedActions.length === 0 && unresolvedDependencies.length === 0 && evidenceOutstanding.length === 0,
    completionPercent: actions.length ? Math.round((completedActions.length / actions.length) * 100) : 0,
    openActions: actions.filter((action) => action.state === "open"),
    blockedActions,
    inProgressActions: actions.filter((action) => action.state === "in_progress"),
    completedActions,
    unresolvedDependencies,
    evidenceOutstanding,
    actionReadiness,
  };
}
