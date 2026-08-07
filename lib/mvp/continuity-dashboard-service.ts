export interface ContinuityDashboard {
  readinessScore: number;
  completedPillars: number;
  totalPillars: number;
  openActions: string[];
  lastUpdated: string;
}

export function buildContinuityDashboard(input: {
  readinessScore: number;
  completedPillars: number;
  totalPillars: number;
  actions: string[];
}): ContinuityDashboard {
  return {
    readinessScore: input.readinessScore,
    completedPillars: input.completedPillars,
    totalPillars: input.totalPillars,
    openActions: input.actions,
    lastUpdated: new Date().toISOString(),
  };
}
