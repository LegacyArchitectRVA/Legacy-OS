export interface AIRequest {
  workspaceId: string;
  question: string;
  context?: string;
}

export interface AIResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

export async function generateAIResponse(request: AIRequest): Promise<AIResponse> {
  return {
    answer: `LegacyOS response prepared for workspace ${request.workspaceId}: ${request.question}`,
    sources: [],
    confidence: 0
  };
}
