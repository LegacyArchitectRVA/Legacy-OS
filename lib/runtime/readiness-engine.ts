export type ReadinessCategory =
  | "digital"
  | "financial"
  | "household"
  | "health"
  | "legal"
  | "business"
  | "legacy";

export interface ReadinessResult {
  score: number;
  risks: string[];
  recommendations: string[];
}

export function evaluateReadiness(categories: ReadinessCategory[]): ReadinessResult {
  const score = Math.min(100, categories.length * 14);

  return {
    score,
    risks: [],
    recommendations: ["Review missing continuity information", "Update operational knowledge"]
  };
}
