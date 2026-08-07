export type ContinuitySignal = {
  area: string;
  risk: 'low' | 'medium' | 'high';
  issue: string;
  recommendation: string;
};

export function analyzeContinuitySignals(inputs: Record<string, boolean>): ContinuitySignal[] {
  const signals: ContinuitySignal[] = [];

  for (const [area, ready] of Object.entries(inputs)) {
    if (!ready) {
      signals.push({
        area,
        risk: 'high',
        issue: `${area} lacks continuity readiness`,
        recommendation: `Create documented instructions for ${area}`,
      });
    }
  }

  return signals;
}
