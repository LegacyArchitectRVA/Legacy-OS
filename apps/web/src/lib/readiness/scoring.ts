export type ReadinessCategory = {
  name: string;
  score: number;
};

export function calculateReadiness(categories: ReadinessCategory[]) {
  if (!categories.length) return 0;
  const total = categories.reduce((sum, item) => sum + item.score, 0);
  return Math.round(total / categories.length);
}
