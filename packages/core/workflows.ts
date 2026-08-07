export type WorkflowStatus = 'draft' | 'active' | 'completed';

export type LegacyWorkflow = {
  id: string;
  workspaceId: string;
  name: string;
  status: WorkflowStatus;
  steps: string[];
};

export const defaultLegacyWorkflows = [
  'Onboarding',
  'Knowledge Collection',
  'Readiness Review',
  'Weekly Intelligence Report'
];
