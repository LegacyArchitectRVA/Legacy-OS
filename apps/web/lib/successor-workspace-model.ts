import type { SuccessorAction } from "./successor-action-types";
import { buildSuccessorHandoff } from "./successor-handoff.ts";

export interface SuccessorWorkspaceModel {
  actions: SuccessorAction[];
  summary: {
    total: number;
    ready: number;
    blocked: number;
    inProgress: number;
    complete: number;
    evidenceRequired: number;
    evidenceConfirmed: number;
    evidenceGaps: number;
  };
}

export function summarizeSuccessorActions(actions: SuccessorAction[]): SuccessorWorkspaceModel["summary"] {
  const handoff = buildSuccessorHandoff(actions);
  const evidenceRequired = actions.filter((a) => a.evidenceRequired).length;
  const evidenceConfirmed = actions.filter((a) => a.evidenceRequired && a.evidenceConfirmed).length;

  return {
    total: actions.length,
    ready: handoff.actionReadiness.filter((item) => item.ready).length,
    blocked: handoff.blockedActions.length + handoff.actionReadiness.filter((item) => item.reason === "completion_invalid").length,
    inProgress: handoff.inProgressActions.length,
    complete: handoff.completedActions.length,
    evidenceRequired,
    evidenceConfirmed,
    evidenceGaps: evidenceRequired - evidenceConfirmed,
  };
}
