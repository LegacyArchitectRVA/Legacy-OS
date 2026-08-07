export type ReadinessReport = {
  score: number;
  risks: string[];
  recommendations: string[];
};

export function generateReadinessReport(score: number): ReadinessReport {
  return {
    score,
    risks: [],
    recommendations: [],
  };
}
