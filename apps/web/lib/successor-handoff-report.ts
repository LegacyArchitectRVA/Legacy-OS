import type { SuccessorHandoff } from "./successor-handoff";
import type { SuccessorAction } from "./successor-action-types";

export interface HandoffBlocker {
  action: SuccessorAction;
  reason: "dependency" | "evidence" | "blocked";
  dependencies: SuccessorAction[];
}

export interface SuccessorHandoffReport {
  ready: boolean;
  completionPercent: number;
  blockers: HandoffBlocker[];
  nextActions: SuccessorAction[];
}

export function buildSuccessorHandoffReport(handoff: SuccessorHandoff, actions: SuccessorAction[]): SuccessorHandoffReport {
  const byId = new Map(actions.map((action) => [action.id, action]));
  const readinessById = new Map(handoff.actionReadiness.map((item) => [item.actionId, item]));
  const blockers: HandoffBlocker[] = [];

  for (const action of actions) {
    const readiness = readinessById.get(action.id);
    if (!readiness || readiness.reason === "completed" || readiness.ready) continue;

    if (readiness.reason === "explicitly_blocked") {
      blockers.push({ action, reason: "blocked", dependencies: [] });
      continue;
    }

    if (readiness.reason === "dependency_blocked") {
      const dependencies = readiness.unresolvedDependencies
        .map((id) => byId.get(id))
        .filter((value): value is SuccessorAction => Boolean(value));
      blockers.push({ action, reason: "dependency", dependencies });
      continue;
    }

    if (readiness.reason === "evidence_required") {
      blockers.push({ action, reason: "evidence", dependencies: [] });
    }
  }

  const nextActions = actions.filter((action) => {
    const readiness = readinessById.get(action.id);
    return Boolean(readiness && readiness.ready) || Boolean(
      readiness &&
      action.state === "in_progress" &&
      readiness.unresolvedDependencies.length === 0 &&
      (!readiness.evidenceRequired || readiness.evidenceConfirmed),
    );
  }).slice(0, 5);

  return { ready: handoff.ready, completionPercent: handoff.completionPercent, blockers, nextActions };
}
