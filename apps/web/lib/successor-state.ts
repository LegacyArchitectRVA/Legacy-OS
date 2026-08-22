export type SuccessorActionStatus = "open" | "in_progress" | "blocked" | "complete";

export interface SuccessorActionState { actionId: string; status: SuccessorActionStatus; updatedAt: string; evidenceConfirmed: boolean; notes?: string; }

const memory = new Map<string, SuccessorActionState>();

export function getSuccessorActionState(actionId: string): SuccessorActionState { return memory.get(actionId) ?? { actionId, status: "open", updatedAt: new Date().toISOString(), evidenceConfirmed: false }; }

export function setSuccessorActionState(input: Omit<SuccessorActionState, "updatedAt">): SuccessorActionState {
  const state = { ...input, updatedAt: new Date().toISOString() };
  memory.set(input.actionId, state);
  return state;
}
