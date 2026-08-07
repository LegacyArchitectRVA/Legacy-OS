export const pillars = [
  "Digital Life",
  "Financial & Assets",
  "Household & Property",
  "Health & Medical",
  "Legal & Estate",
  "Business Continuity",
  "Legacy & Wishes",
] as const;

export type Pillar = typeof pillars[number];

export interface ContinuityAssessment {
  pillar: Pillar;
  score: number;
  recommendations: string[];
}

export function calculateReadiness(scores: number[]) {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
