export type DashboardSummary = {
  workspaceId: string;
  readinessScore: number;
  documentsProcessed: number;
  risksIdentified: number;
};

export function createDashboardSummary(workspaceId: string): DashboardSummary {
  return {
    workspaceId,
    readinessScore: 0,
    documentsProcessed: 0,
    risksIdentified: 0,
  };
}
