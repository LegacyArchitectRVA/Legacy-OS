export interface AIRequest {
  workspaceId: string;
  prompt: string;
  context: string[];
}

export interface AIResponse {
  answer: string;
  confidence: number;
  sources: string[];
}

export async function generateResponse(request: AIRequest): Promise<AIResponse> {
  return {
    answer: `AI response prepared for workspace ${request.workspaceId}`,
    confidence: 0,
    sources: request.context,
  };
}
