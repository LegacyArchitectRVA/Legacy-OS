export const continuityPillars = [
  "Digital Life",
  "Financial & Assets",
  "Household & Property",
  "Health & Medical",
  "Legal & Estate",
  "Business Continuity",
  "Legacy & Wishes"
];

export function calculateScore(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
