export type SuccessorActionState = "open" | "in_progress" | "blocked" | "complete";

export interface SuccessorAction {
  id: string;
  title: string;
  domain: string;
  instruction: string;
  state: SuccessorActionState;
  evidenceRequired: boolean;
  evidenceConfirmed?: boolean;
  dependencies: string[];
  updatedAt?: string;
}

export interface SuccessorActionStateRecord {
  actionId: string;
  status: SuccessorActionState;
  updatedAt: string;
  evidenceConfirmed: boolean;
  notes?: string;
}
