export type ContinuityResponse = {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
};

export function createContinuityResponse(score: number): ContinuityResponse {
  return {
    score,
    strengths: [],
    gaps: [],
    recommendations: [],
  };
}
