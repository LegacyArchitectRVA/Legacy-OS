export type DashboardMetric = {
  label: string;
  value: string | number;
  status?: 'good' | 'warning' | 'critical';
};

export type LegacyDashboard = {
  workspace: string;
  readinessScore: number;
  metrics: DashboardMetric[];
  nextActions: string[];
};

export function buildDashboard(workspace: string): LegacyDashboard {
  return {
    workspace,
    readinessScore: 0,
    metrics: [
      { label: 'Knowledge Records', value: 0 },
      { label: 'Continuity Risks', value: 0, status: 'warning' },
      { label: 'Open Actions', value: 0 }
    ],
    nextActions: ['Add operational knowledge', 'Complete readiness review']
  };
}
