export type SuccessorActionState = "open" | "in_progress" | "blocked" | "complete";
export interface SuccessorAction { id: string; title: string; domain: string; instruction: string; state: SuccessorActionState; evidenceRequired: boolean; dependencies: string[]; }
export function transitionSuccessorAction(action: SuccessorAction, state: SuccessorActionState): SuccessorAction { if (action.state === "complete" && state !== "complete") return action; if (state === "complete" && action.evidenceRequired) return { ...action, state: "blocked" }; return { ...action, state }; }
