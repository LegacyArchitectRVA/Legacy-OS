export interface AssistantRequest {
  workspaceId: string;
  question: string;
  context?: string[];
}

export interface AssistantResponse {
  answer: string;
  confidence: number;
  sources: string[];
}

export function runAssistant(request: AssistantRequest): AssistantResponse {
  return {
    answer: `LegacyOS prepared a response for: ${request.question}`,
    confidence: 0,
    sources: request.context ?? [],
  };
}
