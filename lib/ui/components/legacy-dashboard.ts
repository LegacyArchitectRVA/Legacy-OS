export interface LegacyDashboardProps {
  workspaceName: string;
  readinessScore: number;
  risks: string[];
  actions: string[];
}

export function createLegacyDashboard(props: LegacyDashboardProps) {
  return {
    title: 'Legacy-OS Dashboard',
    workspace: props.workspaceName,
    readiness: props.readinessScore,
    risks: props.risks,
    actions: props.actions,
  };
}
