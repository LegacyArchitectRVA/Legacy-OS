export type ContinuityPriority = {
  area: string;
  risk: "high" | "medium" | "low";
  recommendation: string;
};

export function generatePriorities(gaps: string[]): ContinuityPriority[] {
  return gaps.map((gap) => ({
    area: gap,
    risk: "medium",
    recommendation: `Document and assign ownership for ${gap}.`,
  }));
}
