export type ContinuityArea = {
  name: string;
  score: number;
  gaps: string[];
};

export type ContinuityAssessment = {
  overallScore: number;
  areas: ContinuityArea[];
  recommendations: string[];
};

export function assessContinuity(areas: ContinuityArea[]): ContinuityAssessment {
  const overallScore = Math.round(
    areas.reduce((total, area) => total + area.score, 0) / Math.max(areas.length, 1)
  );

  const recommendations = areas
    .filter((area) => area.gaps.length > 0)
    .map((area) => `Improve ${area.name}: ${area.gaps[0]}`);

  return {
    overallScore,
    areas,
    recommendations,
  };
}
