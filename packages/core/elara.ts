export type ElaraCapability =
  | 'readiness-guidance'
  | 'knowledge-assistance'
  | 'continuity-planning'
  | 'workflow-support'
  | 'intelligence-reporting';

export interface ElaraContext {
  workspaceId: string;
  userId?: string;
  currentGoal?: string;
  knowledgeSources?: string[];
}

export interface ElaraRequest {
  message: string;
  context: ElaraContext;
}

export const elara = {
  name: 'Elara',
  role: 'Legacy Concierge',
  capabilities: [
    'readiness-guidance',
    'knowledge-assistance',
    'continuity-planning',
    'workflow-support',
    'intelligence-reporting',
  ] as ElaraCapability[],
};
