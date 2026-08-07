export type Action = {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
};

export function createActionPlan(risks: string[]): Action[] {
  return risks.map((risk, index) => ({
    priority: index === 0 ? 'high' : index < 3 ? 'medium' : 'low',
    title: `Resolve continuity gap: ${risk}`,
    description: `Create documentation, ownership, and backup procedures for ${risk}.`,
  }));
}
