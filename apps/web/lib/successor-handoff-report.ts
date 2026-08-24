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
  const blockers: HandoffBlocker[] = [];
  for (const action of actions) {
    if (action.state === "complete") continue;
    const dependencies = action.dependencies.map((id) => byId.get(id)).filter((value): value is SuccessorAction => Boolean(value && value.state !== "complete"));
    if (dependencies.length) blockers.push({ action, reason: "dependency", dependencies });
    else if (action.evidenceRequired && !action.evidenceConfirmed) blockers.push({ action, reason: "evidence", dependencies: [] });
    else if (action.state === "blocked") blockers.push({ action, reason: "blocked", dependencies: [] });
  }
  const nextActions = actions.filter((action) => action.state === "in_progress" || (action.state === "open" && action.dependencies.every((id) => byId.get(id)?.state === "complete"))).slice(0, 5);
  return { ready: handoff.ready, completionPercent: handoff.completionPercent, blockers, nextActions };
}
