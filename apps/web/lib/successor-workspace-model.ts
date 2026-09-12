import type { SuccessorAction } from "./successor-action-types";

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
  const evidenceRequired = actions.filter((a) => a.evidenceRequired).length;
  const evidenceConfirmed = actions.filter((a) => a.evidenceRequired && a.evidenceConfirmed).length;

  return {
    total: actions.length,
    ready: actions.filter((a) => a.state === "open").length,
    blocked: actions.filter((a) => a.state === "blocked").length,
    inProgress: actions.filter((a) => a.state === "in_progress").length,
    complete: actions.filter((a) => a.state === "complete").length,
    evidenceRequired,
    evidenceConfirmed,
    evidenceGaps: evidenceRequired - evidenceConfirmed,
  };
}
