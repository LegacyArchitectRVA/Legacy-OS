export type ReadinessCategory = {
  name: string;
  score: number;
};

export function calculateLegacyScore(categories: ReadinessCategory[]) {
  if (!categories.length) return 0;

  const total = categories.reduce((sum, item) => sum + item.score, 0);
  return Math.round(total / categories.length);
}

export const defaultCategories = [
  'Documentation',
  'Knowledge Transfer',
  'Automation',
  'Security',
  'Operational Continuity',
];
