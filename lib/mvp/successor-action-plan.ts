export type ActionItem = {
  priority: 'high' | 'medium' | 'low';
  area: string;
  action: string;
};

export function buildSuccessorActionPlan(gaps: string[]): ActionItem[] {
  return gaps.map((gap, index) => ({
    priority: index === 0 ? 'high' : index < 3 ? 'medium' : 'low',
    area: gap,
    action: `Review and document continuity instructions for ${gap}.`,
  }));
}
