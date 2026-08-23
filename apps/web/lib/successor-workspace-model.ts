import type { SuccessorAction } from "./successor-action-types";

export interface SuccessorWorkspaceModel {
  actions: SuccessorAction[];
  summary: { total: number; ready: number; blocked: number; inProgress: number; complete: number };
}

export function summarizeSuccessorActions(actions: SuccessorAction[]): SuccessorWorkspaceModel["summary"] {
  return {
    total: actions.length,
    ready: actions.filter((a) => a.state === "open").length,
    blocked: actions.filter((a) => a.state === "blocked").length,
    inProgress: actions.filter((a) => a.state === "in_progress").length,
    complete: actions.filter((a) => a.state === "complete").length,
  };
}
