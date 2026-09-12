import type { SuccessorAction } from "./successor-action-types";

export interface SuccessorDependencyReadiness {
  actionId: string;
  title: string;
  state: SuccessorAction["state"] | "missing";
  resolved: boolean;
}

export interface SuccessorActionReadiness {
  actionId: string;
  title: string;
  domain: string;
  instruction: string;
  ready: boolean;
  unresolvedDependencies: string[];
  dependencyDetails: SuccessorDependencyReadiness[];
  evidenceRequired: boolean;
  evidenceConfirmed: boolean;
  reason: "ready" | "explicitly_blocked" | "dependency_blocked" | "evidence_required" | "completed" | "completion_invalid";
}

export interface SuccessorNextAction {
  actionId: string;
  reason: "unblocks_downstream_work" | "resolve_evidence_gap" | "continue_in_progress";
  downstreamCount: number;
}

export interface SuccessorHandoff {
  ready: boolean;
  completionPercent: number;
  openActions: SuccessorAction[];
  blockedActions: SuccessorAction[];
  inProgressActions: SuccessorAction[];
  completedActions: SuccessorAction[];
  invalidCompletedActions: SuccessorAction[];
  unresolvedDependencies: Array<{ actionId: string; dependencyId: string }>;
  evidenceOutstanding: SuccessorAction[];
  actionReadiness: SuccessorActionReadiness[];
  nextAction: SuccessorNextAction | null;
}

function downstreamCounts(actions: SuccessorAction[]): Map<string, number> {
  const counts = new Map(actions.map((action) => [action.id, 0]));
  const byId = new Map(actions.map((action) => [action.id, action]));

  for (const action of actions) {
    const seen = new Set<string>();
    const visit = (id: string) => {
      const dependency = byId.get(id);
      if (!dependency || seen.has(id)) return;
      seen.add(id);
      counts.set(id, (counts.get(id) ?? 0) + 1);
      for (const dependencyId of dependency.dependencies) visit(dependencyId);
    };
    for (const dependencyId of action.dependencies) visit(dependencyId);
  }

  return counts;
}

export function buildSuccessorHandoff(actions: SuccessorAction[]): SuccessorHandoff {
  const byId = new Map(actions.map((action) => [action.id, action]));
  const unresolvedDependencies = actions.flatMap((action) => action.dependencies.filter((id) => byId.get(id)?.state !== "complete").map((dependencyId) => ({ actionId: action.id, dependencyId })));

  const readinessInputs = actions.map((action) => {
    const dependencyDetails = action.dependencies.map((dependencyId): SuccessorDependencyReadiness => {
      const dependency = byId.get(dependencyId);
      const state: SuccessorDependencyReadiness["state"] = dependency?.state ?? "missing";
      return { actionId: dependencyId, title: dependency?.title ?? "Missing action", state, resolved: state === "complete" };
    });
    const dependencies = dependencyDetails.filter((dependency) => !dependency.resolved).map((dependency) => dependency.actionId);
    const evidenceConfirmed = Boolean(action.evidenceConfirmed);
    const prerequisitesSatisfied = dependencies.length === 0 && (!action.evidenceRequired || evidenceConfirmed);
    return { action, dependencyDetails, dependencies, evidenceConfirmed, prerequisitesSatisfied };
  });

  const invalidCompletedActions = readinessInputs.filter(({ action, prerequisitesSatisfied }) => action.state === "complete" && !prerequisitesSatisfied).map(({ action }) => action);
  const invalidCompletedIds = new Set(invalidCompletedActions.map((action) => action.id));
  const evidenceOutstanding = readinessInputs.filter(({ action, evidenceConfirmed }) => action.evidenceRequired && !evidenceConfirmed && action.state !== "complete").map(({ action }) => action);
  const blockedActions = actions.filter((action) => action.state === "blocked");
  const completedActions = actions.filter((action) => action.state === "complete" && !invalidCompletedIds.has(action.id));

  const actionReadiness = readinessInputs.map(({ action, dependencyDetails, dependencies, evidenceConfirmed, prerequisitesSatisfied }) => {
    const ready = action.state === "open" && prerequisitesSatisfied;
    const reason: SuccessorActionReadiness["reason"] = action.state === "complete"
      ? prerequisitesSatisfied ? "completed" : "completion_invalid"
      : action.state === "blocked"
        ? "explicitly_blocked"
        : dependencies.length > 0
          ? "dependency_blocked"
          : action.evidenceRequired && !evidenceConfirmed
            ? "evidence_required"
            : "ready";
    return { actionId: action.id, title: action.title, domain: action.domain, instruction: action.instruction, ready, unresolvedDependencies: dependencies, dependencyDetails, evidenceRequired: action.evidenceRequired, evidenceConfirmed, reason };
  });

  const counts = downstreamCounts(actions);
  const readinessById = new Map(actionReadiness.map((item) => [item.actionId, item]));
  const executableInProgress = actions.filter((action) => {
    if (action.state !== "in_progress") return false;
    const readiness = readinessById.get(action.id);
    return Boolean(readiness && readiness.unresolvedDependencies.length === 0 && (!readiness.evidenceRequired || readiness.evidenceConfirmed));
  });
  const readyOpen = actions.filter((action) => readinessById.get(action.id)?.ready);
  const nextOpen = [...readyOpen].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || a.title.localeCompare(b.title))[0];
  const nextEvidence = [...evidenceOutstanding]
    .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) || a.title.localeCompare(b.title))[0];
  const nextInProgress = executableInProgress[0];
  const nextAction: SuccessorNextAction | null = nextOpen
    ? { actionId: nextOpen.id, reason: "unblocks_downstream_work", downstreamCount: counts.get(nextOpen.id) ?? 0 }
    : nextEvidence
      ? { actionId: nextEvidence.id, reason: "resolve_evidence_gap", downstreamCount: counts.get(nextEvidence.id) ?? 0 }
      : nextInProgress
        ? { actionId: nextInProgress.id, reason: "continue_in_progress", downstreamCount: counts.get(nextInProgress.id) ?? 0 }
        : null;

  return {
    ready: blockedActions.length === 0 && unresolvedDependencies.length === 0 && evidenceOutstanding.length === 0 && invalidCompletedActions.length === 0,
    completionPercent: actions.length ? Math.round((completedActions.length / actions.length) * 100) : 0,
    openActions: actions.filter((action) => action.state === "open"),
    blockedActions,
    inProgressActions: actions.filter((action) => action.state === "in_progress"),
    completedActions,
    invalidCompletedActions,
    unresolvedDependencies,
    evidenceOutstanding,
    actionReadiness,
    nextAction,
  };
}
