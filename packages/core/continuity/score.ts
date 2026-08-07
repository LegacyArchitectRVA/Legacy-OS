export type PillarScore = {
  pillar: string
  score: number
}

export function calculateContinuityScore(scores: PillarScore[]) {
  if (!scores.length) return 0

  const total = scores.reduce((sum, item) => sum + item.score, 0)
  return Math.round(total / scores.length)
}
