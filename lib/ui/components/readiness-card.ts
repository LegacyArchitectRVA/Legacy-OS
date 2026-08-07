export interface ReadinessCard {
  pillar: string;
  score: number;
  recommendation: string;
}

export function buildReadinessCard(card: ReadinessCard) {
  return {
    ...card,
    status: card.score >= 80 ? 'ready' : 'needs attention',
  };
}
