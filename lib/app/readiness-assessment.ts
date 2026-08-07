export type Pillar =
  | 'Digital Life'
  | 'Financial & Assets'
  | 'Household & Property'
  | 'Health & Medical'
  | 'Legal & Estate'
  | 'Business Continuity'
  | 'Legacy & Wishes';

export type AssessmentResult = {
  score: number;
  completed: number;
  total: number;
  gaps: Pillar[];
};

export function assessReadiness(completed: Pillar[]): AssessmentResult {
  const pillars: Pillar[] = [
    'Digital Life',
    'Financial & Assets',
    'Household & Property',
    'Health & Medical',
    'Legal & Estate',
    'Business Continuity',
    'Legacy & Wishes'
  ];

  return {
    score: Math.round((completed.length / pillars.length) * 100),
    completed: completed.length,
    total: pillars.length,
    gaps: pillars.filter((pillar) => !completed.includes(pillar))
  };
}
