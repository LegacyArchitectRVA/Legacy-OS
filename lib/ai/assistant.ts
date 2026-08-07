import type { RetrievalContext } from './types';

export interface AssistantRequest {
  question: string;
  workspaceId: string;
  context?: RetrievalContext;
}

export interface AssistantResponse {
  answer: string;
  sources: string[];
  recommendations: string[];
}

/**
 * Core LegacyOS assistant orchestration layer.
 * Connects workspace context, retrieved knowledge, and operational reasoning.
 */
export function buildAssistantContext(request: AssistantRequest) {
  return {
    workspaceId: request.workspaceId,
    question: request.question,
    knowledge: request.context?.chunks ?? [],
    instructions: [
      'Answer using available business knowledge first.',
      'Identify missing information when confidence is low.',
      'Provide practical operational recommendations.'
    ]
  };
}
