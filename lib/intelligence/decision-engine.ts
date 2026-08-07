export type DecisionInput = {
  question: string;
  context: string[];
  riskLevel?: 'low' | 'medium' | 'high';
};

export type DecisionOutput = {
  recommendation: string;
  confidence: number;
  risks: string[];
  nextActions: string[];
};

export function evaluateDecision(input: DecisionInput): DecisionOutput {
  const confidence = input.context.length > 0 ? 0.75 : 0.35;

  return {
    recommendation: `Review available business context before acting on: ${input.question}`,
    confidence,
    risks: input.riskLevel === 'high' ? ['Requires additional review before execution'] : [],
    nextActions: [
      'Validate information source',
      'Review operational impact',
      'Record final decision'
    ]
  };
}
