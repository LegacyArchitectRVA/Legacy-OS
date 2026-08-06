export interface DecisionRequest {
  situation: string;
  objective: string;
  constraints: string[];
}

export interface DecisionReview {
  assumptions: string[];
  risks: string[];
  questions: string[];
}

export function reviewDecision(input: DecisionRequest): DecisionReview {
  return {
    assumptions: [`Review assumptions behind: ${input.objective}`],
    risks: input.constraints.map((item) => `Constraint risk: ${item}`),
    questions: ['What information is still missing before deciding?'],
  };
}
