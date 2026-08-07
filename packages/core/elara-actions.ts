export type ElaraAction = {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  category:
    | 'digital'
    | 'financial'
    | 'household'
    | 'health'
    | 'legal'
    | 'business'
    | 'legacy';
};

export function createElaraAction(title: string): ElaraAction {
  return {
    id: crypto.randomUUID(),
    title,
    priority: 'medium',
    category: 'legacy'
  };
}
