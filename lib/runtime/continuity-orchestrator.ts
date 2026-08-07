export type ContinuityInput = {
  workspaceId: string;
  categories: string[];
  risks: string[];
};

export type ContinuityOutput = {
  readinessScore: number;
  priorities: string[];
  nextActions: string[];
};

export function orchestrateContinuity(input: ContinuityInput): ContinuityOutput {
  const score = Math.max(0, 100 - input.risks.length * 8);

  return {
    readinessScore: score,
    priorities: input.risks,
    nextActions: input.categories.map(
      (category) => `Review ${category} continuity requirements`
    ),
  };
}
