export interface ContinuityRisk {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export function detectKnowledgeGaps(required: string[], available: string[]): ContinuityRisk[] {
  return required
    .filter((item) => !available.includes(item))
    .map((item) => ({
      id: crypto.randomUUID(),
      category: 'knowledge-gap',
      description: `Missing operational knowledge: ${item}`,
      severity: 'high',
      recommendation: `Document and assign ownership for ${item}`,
    }));
}
