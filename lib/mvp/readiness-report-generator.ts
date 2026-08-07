export interface ReadinessReport {
  score: number;
  strengths: string[];
  risks: string[];
  actions: string[];
}

export function generateReadinessReport(input: {
  score: number;
  gaps: string[];
}) : ReadinessReport {
  return {
    score: input.score,
    strengths: [],
    risks: input.gaps,
    actions: input.gaps.map((gap) => `Create continuity plan for ${gap}`)
  };
}
