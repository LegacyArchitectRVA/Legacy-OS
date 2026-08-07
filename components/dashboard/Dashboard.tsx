export type DashboardMetric = {
  label: string;
  value: string;
  status?: string;
};

export function Dashboard({ metrics }: { metrics: DashboardMetric[] }) {
  return {
    title: 'LegacyOS Dashboard',
    metrics,
    sections: [
      'Business Brain',
      'Knowledge Vault',
      'AI Assistant',
      'Continuity Score'
    ]
  };
}
