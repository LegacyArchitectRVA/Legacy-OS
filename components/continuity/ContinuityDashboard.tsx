export type ContinuityArea = {
  name: string;
  score: number;
  risks: string[];
};

export function ContinuityDashboard({ areas = [] }: { areas?: ContinuityArea[] }) {
  const score = areas.length
    ? Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length)
    : 0;

  return {
    title: 'Continuity Readiness',
    score,
    areas,
    recommendations: areas.filter((area) => area.risks.length > 0)
  };
}
