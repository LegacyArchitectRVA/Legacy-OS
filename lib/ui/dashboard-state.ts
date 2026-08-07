export type DashboardState = {
  workspace: string;
  readinessScore: number;
  knowledgeItems: number;
  openRisks: string[];
  recommendedActions: string[];
};

export function createDashboardState(input: Partial<DashboardState>): DashboardState {
  return {
    workspace: input.workspace ?? 'New Workspace',
    readinessScore: input.readinessScore ?? 0,
    knowledgeItems: input.knowledgeItems ?? 0,
    openRisks: input.openRisks ?? [],
    recommendedActions: input.recommendedActions ?? [],
  };
}
