export type ReadinessMetric = {
  pillar: string;
  score: number;
  notes?: string;
};

export function calculateReadiness(metrics: ReadinessMetric[]) {
  if (!metrics.length) return 0;
  const total = metrics.reduce((sum, item) => sum + item.score, 0);
  return Math.round(total / metrics.length);
}
