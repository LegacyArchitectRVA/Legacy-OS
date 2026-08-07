import { buildAssistantContext } from '../ai/context-builder';

export interface AssistantRequest {
  workspaceId: string;
  question: string;
}

export async function runLegacyAssistant(request: AssistantRequest) {
  const context = await buildAssistantContext(request.workspaceId, request.question);

  return {
    question: request.question,
    context,
    recommendation: 'Response generation connected through AI provider layer.',
    confidence: 0,
  };
}
