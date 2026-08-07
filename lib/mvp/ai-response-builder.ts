export interface AssistantContext {
  workspaceId: string;
  question: string;
  knowledge: string[];
}

export function buildAssistantResponse(context: AssistantContext) {
  return {
    workspaceId: context.workspaceId,
    answer: `Legacy-OS analysis prepared for: ${context.question}`,
    sources: context.knowledge,
    confidence: context.knowledge.length > 0 ? 'medium' : 'low',
    nextActions: [
      'Review identified continuity gaps',
      'Document missing operational knowledge',
      'Update readiness profile',
    ],
  };
}
