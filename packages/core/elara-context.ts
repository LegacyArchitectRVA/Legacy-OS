export type ElaraContext = {
  workspaceId: string;
  userId?: string;
  readinessScore?: number;
  activePillar?: string;
  knowledgeReferences: string[];
};

export function buildElaraContext(input: ElaraContext) {
  return {
    role: 'Legacy Concierge',
    context: input,
    objective: 'Help organize, protect, and improve continuity readiness.'
  };
}
