import type { SuccessorAction, SuccessorActionState } from "./successor-action-types";

export type { SuccessorAction, SuccessorActionState } from "./successor-action-types";

export function transitionSuccessorAction(action: SuccessorAction, state: SuccessorActionState): SuccessorAction {
  if (action.state === "complete" && state !== "complete") return action;
  if (state === "complete" && action.evidenceRequired && !action.evidenceConfirmed) {
    return { ...action, state: "blocked", updatedAt: new Date().toISOString() };
  }
  return { ...action, state, updatedAt: new Date().toISOString() };
}
